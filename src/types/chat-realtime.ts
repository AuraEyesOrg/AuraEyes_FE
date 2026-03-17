/**
 * Real-time chat event received via SignalR ChatHub.
 */
export interface SignalRChatMessageEvent {
  sessionId: string;
  messageId: string;
  senderProfileId: string;
  sentAt: string;
}

/**
 * Browser custom event name for chat realtime updates.
 */
export const SIGNALR_CHAT_MESSAGE_EVENT = 'aura:chat-message';
