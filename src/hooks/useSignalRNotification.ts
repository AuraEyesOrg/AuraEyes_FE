import { useEffect, useRef, useCallback } from 'react';
import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { toast } from 'react-toastify';
import useNotificationStore from '@/store/useNotificationStore';
import useAuthStore from '@/store/auth-store';
import { SignalRNotification } from '@/types/notification';
import { getNotificationRoute } from '@/types/notification';
import { router } from '@/lib/router';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

/**
 * SignalR Hub URL - configured via environment variable
 */
const NOTIFICATION_HUB_URL =
  (import.meta.env.VITE_API_END_POINT as string) + '/hubs/notifications';

/**
 * Reconnection delays in milliseconds
 */
const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000];
const TOKEN_EXPIRY_BUFFER_MS = 15000;

/**
 * Custom hook for managing SignalR notification connection
 * Automatically connects when user is authenticated and disconnects on logout
 */
export function useSignalRNotification(): {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  reconnect: () => Promise<void>;
} {
  const connectionRef = useRef<HubConnection | null>(null);
  const reconnectAttemptRef = useRef(0);

  const { isAuthenticated, user } = useAuthStore();
  const { addNotification, setConnectionStatus, connectionStatus } =
    useNotificationStore();

  /**
   * Get access token for SignalR authentication
   */
  const getAccessToken = useCallback(async (): Promise<string> => {
    const sanitizeToken = (value: string | null): string =>
      value?.replace(/['"]+/g, '') || '';

    const decodeJwtExp = (token: string): number | null => {
      const segments = token.split('.');
      if (segments.length < 2) {
        return null;
      }

      const base64Url = segments[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const payloadJson = atob(padded);
      const payload = JSON.parse(payloadJson) as { exp?: unknown };

      return typeof payload.exp === 'number' ? payload.exp : null;
    };

    const currentToken = sanitizeToken(localStorage.getItem('token'));
    if (!currentToken) {
      return '';
    }

    try {
      const exp = decodeJwtExp(currentToken);
      const isExpiringSoon =
        typeof exp === 'number' &&
        exp * 1000 < Date.now() + TOKEN_EXPIRY_BUFFER_MS;

      if (isExpiringSoon) {
        try {
          await api.get(API_ENDPOINTS.AUTH.ME);
        } catch {
          // Ignore: interceptor may throw while still refreshing and updating localStorage.
        }

        return sanitizeToken(localStorage.getItem('token'));
      }
    } catch {
      // Ignore malformed tokens and fall back to the current token.
    }

    return currentToken;
  }, []);

  /**
   * Handle incoming notification from SignalR
   */
  const handleNotificationReceived = useCallback(
    (notification: SignalRNotification) => {
      console.log('[SignalR] Notification received:', notification);

      // Add to store (will trigger sound and browser notification)
      addNotification(notification);

      // Show toast notification with navigation action
      toast.info(notification.title + '\n' + notification.message, {
        onClick: () => {
          const route = getNotificationRoute(
            {
              ...notification,
              userId: '',
              isRead: false,
            },
            user?.roles ?? []
          );
          if (route !== '#') {
            router.navigate(route);
          }
        },
        autoClose: 5000,
        closeOnClick: true,
      });
    },
    [addNotification, user?.roles]
  );

  /**
   * Build and configure SignalR connection
   */
  const buildConnection = useCallback((): HubConnection => {
    const connection = new HubConnectionBuilder()
      .withUrl(NOTIFICATION_HUB_URL, {
        accessTokenFactory: getAccessToken,
      })
      .withAutomaticReconnect(RECONNECT_DELAYS)
      .configureLogging(
        import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning
      )
      .build();

    // Connection state change handlers
    connection.onreconnecting(() => {
      console.log('[SignalR] Reconnecting...');
      setConnectionStatus('connecting');
    });

    connection.onreconnected((connectionId) => {
      console.log('[SignalR] Reconnected:', connectionId);
      setConnectionStatus('connected');
      reconnectAttemptRef.current = 0;
    });

    connection.onclose((error) => {
      console.log('[SignalR] Connection closed:', error);
      setConnectionStatus('disconnected');
    });

    // Register notification event handler
    connection.on('ReceiveNotification', handleNotificationReceived);

    return connection;
  }, [getAccessToken, handleNotificationReceived, setConnectionStatus]);

  /**
   * Start SignalR connection
   */
  const startConnection = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      console.log('[SignalR] Not authenticated, skipping connection');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      console.log('[SignalR] No token available, skipping connection');
      return;
    }

    // If already connected, skip
    if (
      connectionRef.current?.state === HubConnectionState.Connected ||
      connectionRef.current?.state === HubConnectionState.Connecting
    ) {
      return;
    }

    try {
      setConnectionStatus('connecting');

      // Build new connection if needed
      if (!connectionRef.current) {
        connectionRef.current = buildConnection();
      }

      await connectionRef.current.start();
      console.log('[SignalR] Connected successfully');
      setConnectionStatus('connected');
      reconnectAttemptRef.current = 0;
    } catch (error) {
      console.error('[SignalR] Connection failed:', error);
      setConnectionStatus('error');
    }
  }, [isAuthenticated, getAccessToken, buildConnection, setConnectionStatus]);

  /**
   * Stop SignalR connection
   */
  const stopConnection = useCallback(async (): Promise<void> => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
        console.log('[SignalR] Disconnected');
      } catch (error) {
        console.error('[SignalR] Error stopping connection:', error);
      }
      connectionRef.current = null;
      setConnectionStatus('disconnected');
    }
  }, [setConnectionStatus]);

  /**
   * Manual reconnect
   */
  const reconnect = useCallback(async (): Promise<void> => {
    await stopConnection();
    reconnectAttemptRef.current = 0;
    await startConnection();
  }, [stopConnection, startConnection]);

  // Effect to manage connection based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      startConnection();
    } else {
      stopConnection();
    }

    // Cleanup on unmount
    return () => {
      stopConnection();
    };
  }, [isAuthenticated, startConnection, stopConnection]);

  // Handle page visibility changes (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (
        document.visibilityState === 'visible' &&
        isAuthenticated &&
        connectionRef.current?.state !== HubConnectionState.Connected
      ) {
        startConnection();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, startConnection]);

  return {
    connectionStatus,
    reconnect,
  };
}

export default useSignalRNotification;
