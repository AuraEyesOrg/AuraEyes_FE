import { useCallback, useEffect, useRef } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import useAuthStore from '@/store/auth-store';

const INTERNAL_CHAT_HUB_URL =
  (import.meta.env.VITE_API_END_POINT as string) + '/hubs/internal-chat';
const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000];
const TOKEN_EXPIRY_BUFFER_MS = 15_000;
let activeInternalChatConnection: HubConnection | null = null;
const pendingJoinGroupIds = new Set<string>();

export const SIGNALR_INTERNAL_MESSAGE_EVENT = 'signalr:internal-message';
export const SIGNALR_INTERNAL_GROUP_UPDATE_EVENT =
  'signalr:internal-group-update';

const sanitizeToken = (value: string | null): string =>
  value?.replace(/['"]+/g, '') || '';

export const joinInternalChatGroup = async (groupId: string): Promise<void> => {
  if (!groupId) return;
  if (activeInternalChatConnection?.state !== HubConnectionState.Connected) {
    pendingJoinGroupIds.add(groupId);
    return;
  }

  try {
    pendingJoinGroupIds.delete(groupId);
    await activeInternalChatConnection.invoke('JoinGroup', groupId);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[InternalChatHub] Failed to join group:', error);
    }
  }
};

export const leaveInternalChatGroup = async (
  groupId: string
): Promise<void> => {
  if (!groupId) return;
  pendingJoinGroupIds.delete(groupId);
  if (activeInternalChatConnection?.state !== HubConnectionState.Connected) {
    return;
  }

  try {
    await activeInternalChatConnection.invoke('LeaveGroup', groupId);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[InternalChatHub] Failed to leave group:', error);
    }
  }
};

export function useSignalRInternalChat(): void {
  const connectionRef = useRef<HubConnection | null>(null);
  const isStartingRef = useRef(false);
  const shouldStopRef = useRef(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const getAccessToken = useCallback(async (): Promise<string> => {
    let currentToken = '';
    try {
      currentToken = sanitizeToken(localStorage.getItem('token'));
    } catch {
      return '';
    }

    if (!currentToken) return '';

    try {
      const segments = currentToken.split('.');
      if (segments.length >= 2) {
        const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const payload = JSON.parse(atob(padded)) as { exp?: unknown };
        const exp = typeof payload.exp === 'number' ? payload.exp : null;

        if (
          typeof exp === 'number' &&
          exp * 1000 < Date.now() + TOKEN_EXPIRY_BUFFER_MS
        ) {
          return '';
        }
      }
    } catch {
      // Malformed token
    }

    return currentToken;
  }, []);

  const handleMessageReceived = useCallback((message: any) => {
    window.dispatchEvent(
      new CustomEvent(SIGNALR_INTERNAL_MESSAGE_EVENT, {
        detail: message,
      })
    );
  }, []);

  const handleGroupUpdated = useCallback((payload: any) => {
    window.dispatchEvent(
      new CustomEvent(SIGNALR_INTERNAL_GROUP_UPDATE_EVENT, {
        detail: payload,
      })
    );
  }, []);

  const buildConnection = useCallback((): HubConnection => {
    const connection = new HubConnectionBuilder()
      .withUrl(INTERNAL_CHAT_HUB_URL, {
        accessTokenFactory: getAccessToken,
      })
      .withAutomaticReconnect(RECONNECT_DELAYS)
      .configureLogging(
        import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning
      )
      .build();

    connection.on('ReceiveMessage', handleMessageReceived);
    connection.on('GroupUpdated', handleGroupUpdated);

    return connection;
  }, [getAccessToken, handleMessageReceived, handleGroupUpdated]);

  const startConnection = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    if (
      connectionRef.current?.state === HubConnectionState.Connected ||
      connectionRef.current?.state === HubConnectionState.Connecting
    ) {
      return;
    }

    if (isStartingRef.current) return;
    isStartingRef.current = true;

    try {
      if (!connectionRef.current) {
        connectionRef.current = buildConnection();
      }

      await connectionRef.current.start();
      activeInternalChatConnection = connectionRef.current;

      for (const groupId of Array.from(pendingJoinGroupIds)) {
        try {
          await connectionRef.current.invoke('JoinGroup', groupId);
          pendingJoinGroupIds.delete(groupId);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn(
              '[InternalChatHub] Failed to re-join pending group:',
              groupId,
              error
            );
          }
        }
      }

      console.log('[InternalChatHub] Connected successfully');
      if (shouldStopRef.current) {
        shouldStopRef.current = false;
        await stopConnection();
      }
    } catch (error) {
      console.error('[InternalChatHub] Connection failed:', error);
      activeInternalChatConnection = null;
      connectionRef.current = null;
    } finally {
      isStartingRef.current = false;
    }
  }, [buildConnection, isAuthenticated]);

  const stopConnection = useCallback(async (): Promise<void> => {
    if (!connectionRef.current) return;

    if (
      connectionRef.current.state === HubConnectionState.Connecting ||
      isStartingRef.current
    ) {
      shouldStopRef.current = true;
      return;
    }

    try {
      await connectionRef.current.stop();
      console.log('[InternalChatHub] Disconnected');
    } catch (error) {
      console.error('[InternalChatHub] Error stopping connection:', error);
    } finally {
      activeInternalChatConnection = null;
      connectionRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void startConnection();
    } else {
      void stopConnection();
    }

    return () => {
      void stopConnection();
    };
  }, [isAuthenticated, startConnection, stopConnection]);

  // Support manual join/leave group calls via the connection instance if needed
  // (In this case, we handle it via the connectionRef if we exposed it,
  // but for now we just listen to broadcasts)
}

export default useSignalRInternalChat;
