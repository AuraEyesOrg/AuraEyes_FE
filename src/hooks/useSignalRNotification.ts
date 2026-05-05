import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { renderBilingualContent } from '@/lib/notification-utils';
import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useNotificationStore from '@/store/useNotificationStore';
import useAuthStore from '@/store/auth-store';
import {
  SignalRNotification,
  NotificationType,
  parseNotificationType,
  getNotificationRoute,
} from '@/types/notification';
import { router } from '@/lib/router';
import { resolvePathWithLocale } from '@/i18n/middleware';

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
  const userRolesRef = useRef<string[]>([]);
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // Stable selector: extract roles array, fall back to a module-level empty array
  // to avoid returning a new reference on every render (which causes infinite loop
  // with useSyncExternalStore / Zustand).
  const userRolesRaw = useAuthStore((state) => state.user?.roles);
  const userRoles = useMemo(() => userRolesRaw ?? [], [userRolesRaw]);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const setConnectionStatus = useNotificationStore(
    (state) => state.setConnectionStatus
  );
  const connectionStatus = useNotificationStore(
    (state) => state.connectionStatus
  );

  useEffect(() => {
    userRolesRef.current = userRoles;
  }, [userRoles]);

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

    let currentToken = '';
    try {
      currentToken = sanitizeToken(localStorage.getItem('token'));
    } catch {
      return '';
    }

    if (!currentToken) {
      return '';
    }

    try {
      const exp = decodeJwtExp(currentToken);
      const isExpiringSoon =
        typeof exp === 'number' &&
        exp * 1000 < Date.now() + TOKEN_EXPIRY_BUFFER_MS;

      if (isExpiringSoon) {
        // Avoid token-refresh probing here to prevent high-frequency /auth/me calls
        // when SignalR reconnects repeatedly.
        return '';
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

      const payload = (() => {
        const raw = notification.payload;
        if (!raw) return {};
        if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object'
              ? (parsed as Record<string, unknown>)
              : {};
          } catch {
            return {};
          }
        }
        return raw as Record<string, unknown>;
      })();

      const action =
        typeof payload.action === 'string'
          ? payload.action.trim().toLowerCase()
          : '';
      if (action === 'cashier_payment_ready') {
        void queryClient.invalidateQueries({
          queryKey: ['clinic-staff', 'queue'],
        });
        void queryClient.invalidateQueries({
          queryKey: ['clinic-staff-orders'],
        });
      }

      // Auto-refresh for refund actions
      if (action === 'refundconfirmed' || action === 'refundrejected') {
        console.log(
          '[SignalR] Refund action detected, invalidating queries...'
        );
        void queryClient.invalidateQueries({
          queryKey: ['patient', 'appointments'],
        });
        void queryClient.invalidateQueries({
          queryKey: ['financial', 'my-orders'],
        });
      }

      // Automatic redirection for patients when record is finalized
      const type = parseNotificationType(notification.type);
      if (
        type === NotificationType.ConsultationResultProvided &&
        userRolesRef.current.includes('Patient')
      ) {
        console.log('[SignalR] Record finalized, redirecting patient to chat');
        router.navigate(resolvePathWithLocale('/patient/chat'));
      }

      // Show toast notification with navigation action
      // Use unique toastId based on notification content to prevent duplicates
      const currentLang = i18n.language;
      const displayTitle = renderBilingualContent(
        notification.title,
        currentLang,
        notification.payload,
        notification.type,
        true
      );
      const displayMessage = renderBilingualContent(
        notification.message,
        currentLang,
        notification.payload,
        notification.type,
        false
      );
      const toastId =
        notification.id || `noti-${notification.type}-${notification.message}`;

      toast.info(displayTitle + '\n' + displayMessage, {
        toastId,
        onClick: () => {
          const route = getNotificationRoute(
            {
              ...notification,
              userId: '',
              isRead: false,
            },
            userRolesRef.current
          );
          if (route !== '#') {
            router.navigate(resolvePathWithLocale(route));
          }
        },
        autoClose: 5000,
        closeOnClick: true,
      });
    },
    [addNotification, queryClient]
  );

  /**
   * Handle unread count updates from SignalR
   */
  const handleUnreadCountReceived = useCallback(
    (count: number) => {
      if (typeof count === 'number' && Number.isFinite(count) && count >= 0) {
        setUnreadCount(count);
      }
    },
    [setUnreadCount]
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
    connection.on('ReceiveUnreadCount', handleUnreadCountReceived);

    return connection;
  }, [
    getAccessToken,
    handleNotificationReceived,
    handleUnreadCountReceived,
    setConnectionStatus,
  ]);

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
      void startConnection();
    } else {
      void stopConnection();
    }

    // Cleanup on unmount
    return () => {
      void stopConnection();
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
        void startConnection();
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
