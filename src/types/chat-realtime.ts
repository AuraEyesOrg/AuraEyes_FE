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
 * Room state change event received via SignalR ChatHub.
 * Fired when the backend transitions a session between states.
 */
export interface SignalRRoomStateChangedEvent {
  sessionId: string;
  /** "ROOM_OPENED" or "ROOM_CLOSED" */
  event: 'ROOM_OPENED' | 'ROOM_CLOSED';
  timestamp: string;
}

/**
 * Typing indicator event received via SignalR ChatHub.
 */
export interface SignalRTypingIndicatorEvent {
  sessionId: string;
  senderProfileId: string;
  isTyping: boolean;
  timestamp: string;
}

/**
 * Payload used by FE pages to send typing state through ChatHub.
 */
export interface SignalRSendTypingPayload {
  sessionId: string;
  isTyping: boolean;
}

/**
 * Browser custom event names dispatched from the SignalR hook
 * so any component in the tree can listen without coupling to SignalR.
 */
export const SIGNALR_CHAT_MESSAGE_EVENT = 'aura:chat-message';
export const SIGNALR_ROOM_STATE_CHANGED_EVENT = 'aura:room-state-changed';
export const SIGNALR_TYPING_INDICATOR_EVENT = 'aura:chat-typing';
