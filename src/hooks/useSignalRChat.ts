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
  SIGNALR_TYPING_INDICATOR_EVENT,
  type SignalRChatMessageEvent,
  type SignalRSendTypingPayload,
  type SignalRRoomStateChangedEvent,
  type SignalRTypingIndicatorEvent,
} from '@/types/chat-realtime';

const CHAT_HUB_URL =
  (import.meta.env.VITE_API_END_POINT as string) + '/hubs/chat';
const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000];
const TOKEN_EXPIRY_BUFFER_MS = 15_000;

let activeChatConnection: HubConnection | null = null;

const sanitizeToken = (value: string | null): string =>
  value?.replace(/['"]+/g, '') || '';

export const sendChatTypingIndicator = async (
  payload: SignalRSendTypingPayload
): Promise<void> => {
  if (!payload.sessionId) {
    return;
  }

  if (activeChatConnection?.state !== HubConnectionState.Connected) {
    return;
  }

  try {
    await activeChatConnection.invoke(
      'SendTyping',
      payload.sessionId,
      payload.isTyping
    );
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[ChatHub] Failed to send typing event:', error);
    }
  }
};

/**
 * Manages dedicated ChatHub connection for realtime chat events.
 */
export function useSignalRChat(): void {
  const connectionRef = useRef<HubConnection | null>(null);
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
          // Token is expiring soon. Avoid triggering API calls from accessTokenFactory
          // to prevent request storms during reconnect cycles.
          return '';
        }
      }
    } catch {
      // Malformed token — fall through to return current value.
    }

    return currentToken;
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

  const handleTypingIndicatorChanged = useCallback(
    (payload: SignalRTypingIndicatorEvent) => {
      window.dispatchEvent(
        new CustomEvent<SignalRTypingIndicatorEvent>(
          SIGNALR_TYPING_INDICATOR_EVENT,
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
      activeChatConnection = null;
    });

    connection.on('ReceiveChatMessage', handleChatMessageReceived);
    connection.on('RoomStateChanged', handleRoomStateChanged);
    connection.on('TypingIndicatorChanged', handleTypingIndicatorChanged);

    return connection;
  }, [
    getAccessToken,
    handleChatMessageReceived,
    handleRoomStateChanged,
    handleTypingIndicatorChanged,
  ]);

  const startConnection = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      return;
    }

    const token = await getAccessToken();
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
      activeChatConnection = connectionRef.current;
      console.log('[ChatHub] Connected successfully');
    } catch (error) {
      console.error('[ChatHub] Connection failed:', error);
      activeChatConnection = null;
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
      activeChatConnection = null;
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
