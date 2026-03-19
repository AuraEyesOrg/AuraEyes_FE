import { useCallback, useEffect, useRef } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import useAuthStore from '@/store/auth-store';
import {
  SIGNALR_CHAT_MESSAGE_EVENT,
  SIGNALR_ROOM_STATE_CHANGED_EVENT,
  type SignalRChatMessageEvent,
  type SignalRRoomStateChangedEvent,
} from '@/types/chat-realtime';

const CHAT_HUB_URL =
  (import.meta.env.VITE_API_END_POINT as string) + '/hubs/chat';
const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000];

const sanitizeToken = (value: string | null): string =>
  value?.replace(/['"]+/g, '') || '';

/**
 * Manages dedicated ChatHub connection for realtime chat events.
 */
export function useSignalRChat(): void {
  const connectionRef = useRef<HubConnection | null>(null);
  const { isAuthenticated } = useAuthStore();

  const getAccessToken = useCallback((): string => {
    return sanitizeToken(localStorage.getItem('token'));
  }, []);

  const handleChatMessageReceived = useCallback(
    (chatMessage: SignalRChatMessageEvent) => {
      console.log('[ChatHub] Message received:', chatMessage);
      window.dispatchEvent(
        new CustomEvent<SignalRChatMessageEvent>(SIGNALR_CHAT_MESSAGE_EVENT, {
          detail: chatMessage,
        })
      );
    },
    []
  );

  const handleRoomStateChanged = useCallback(
    (payload: SignalRRoomStateChangedEvent) => {
      console.log('[ChatHub] Room state changed:', payload);
      window.dispatchEvent(
        new CustomEvent<SignalRRoomStateChangedEvent>(
          SIGNALR_ROOM_STATE_CHANGED_EVENT,
          { detail: payload }
        )
      );
    },
    []
  );

  const buildConnection = useCallback((): HubConnection => {
    const connection = new HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, {
        accessTokenFactory: getAccessToken,
      })
      .withAutomaticReconnect(RECONNECT_DELAYS)
      .configureLogging(
        import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning
      )
      .build();

    connection.onreconnecting(() => {
      console.log('[ChatHub] Reconnecting...');
    });

    connection.onreconnected((connectionId) => {
      console.log('[ChatHub] Reconnected:', connectionId);
    });

    connection.onclose((error) => {
      console.log('[ChatHub] Connection closed:', error);
    });

    connection.on('ReceiveChatMessage', handleChatMessageReceived);
    connection.on('RoomStateChanged', handleRoomStateChanged);

    return connection;
  }, [getAccessToken, handleChatMessageReceived, handleRoomStateChanged]);

  const startConnection = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.log('[ChatHub] No token, skipping connection');
      return;
    }

    if (
      connectionRef.current?.state === HubConnectionState.Connected ||
      connectionRef.current?.state === HubConnectionState.Connecting
    ) {
      return;
    }

    try {
      if (!connectionRef.current) {
        connectionRef.current = buildConnection();
      }

      await connectionRef.current.start();
      console.log('[ChatHub] Connected successfully');
    } catch (error) {
      console.error('[ChatHub] Connection failed:', error);
      connectionRef.current = null;
    }
  }, [buildConnection, getAccessToken, isAuthenticated]);

  const stopConnection = useCallback(async (): Promise<void> => {
    if (!connectionRef.current) {
      return;
    }

    try {
      await connectionRef.current.stop();
      console.log('[ChatHub] Disconnected');
    } catch (error) {
      console.error('[ChatHub] Error stopping connection:', error);
    } finally {
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
}

export default useSignalRChat;
