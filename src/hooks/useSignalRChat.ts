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
  type SignalRChatMessageEvent,
} from '@/types/chat-realtime';

const CHAT_HUB_URL =
  (import.meta.env.VITE_API_END_POINT as string) + '/hubs/chat';
const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000];

/**
 * Manages dedicated ChatHub connection for realtime chat events.
 */
export function useSignalRChat(): void {
  const connectionRef = useRef<HubConnection | null>(null);
  const { isAuthenticated } = useAuthStore();

  const getAccessToken = useCallback((): string => {
    return localStorage.getItem('token') || '';
  }, []);

  const handleChatMessageReceived = useCallback(
    (chatMessage: SignalRChatMessageEvent) => {
      window.dispatchEvent(
        new CustomEvent<SignalRChatMessageEvent>(SIGNALR_CHAT_MESSAGE_EVENT, {
          detail: chatMessage,
        })
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

    connection.on('ReceiveChatMessage', handleChatMessageReceived);

    return connection;
  }, [getAccessToken, handleChatMessageReceived]);

  const startConnection = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      return;
    }

    if (!getAccessToken()) {
      return;
    }

    if (
      connectionRef.current?.state === HubConnectionState.Connected ||
      connectionRef.current?.state === HubConnectionState.Connecting
    ) {
      return;
    }

    if (!connectionRef.current) {
      connectionRef.current = buildConnection();
    }

    await connectionRef.current.start();
  }, [buildConnection, getAccessToken, isAuthenticated]);

  const stopConnection = useCallback(async (): Promise<void> => {
    if (!connectionRef.current) {
      return;
    }

    try {
      await connectionRef.current.stop();
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
}

export default useSignalRChat;
