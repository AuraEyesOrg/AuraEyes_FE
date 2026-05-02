import { create } from 'zustand';
import { logger } from './logger';
import type { Notification, SignalRNotification } from '@/types/notification';
import {
  NotificationType,
  parseNotificationType,
  type NotificationTypeValue,
} from '@/types/notification';

/**
 * Maximum notifications to keep in memory for the dropdown
 */
const MAX_RECENT_NOTIFICATIONS = 50;

/**
 * Notification store state interface
 */
interface NotificationState extends Record<string, unknown> {
  /** List of notifications (most recent first) */
  notifications: Notification[];

  /** Unread notification count */
  unreadCount: number;

  /** Whether the notification panel is open */
  isPanelOpen: boolean;

  /** Loading state for initial fetch */
  isLoading: boolean;

  /** SignalR connection status */
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

  /** Urgent consilium invitation for doctors */
  urgentInvitation: Notification | null;

  /** Actions */
  setNotifications: (
    notifications: Notification[],
    unreadCount?: number
  ) => void;
  addNotification: (notification: SignalRNotification) => void;
  setUrgentInvitation: (notification: Notification | null) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setPanelOpen: (isOpen: boolean) => void;
  togglePanel: () => void;
  setLoading: (isLoading: boolean) => void;
  setConnectionStatus: (
    status: 'disconnected' | 'connecting' | 'connected' | 'error'
  ) => void;
  clearNotifications: () => void;
}

/**
 * Zustand store for managing notifications state
 */
const useNotificationStore = create<NotificationState>()(
  logger<NotificationState>(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isPanelOpen: false,
      isLoading: false,
      connectionStatus: 'disconnected',
      urgentInvitation: null,

      /**
       * Set notifications list (from API fetch)
       */
      setNotifications: (notifications, unreadCount) => {
        set({
          notifications: notifications.slice(0, MAX_RECENT_NOTIFICATIONS),
          ...(unreadCount !== undefined ? { unreadCount } : {}),
        });
      },

      /**
       * Add a new notification from SignalR real-time event
       */
      addNotification: (signalRNotification) => {
        const { notifications } = get();

        // Convert SignalR notification to full Notification
        const newNotification: Notification = {
          ...signalRNotification,
          userId: '', // Will be filled by backend
          isRead: false,
        };

        // Prepend to list, maintaining max size
        const updatedNotifications = [
          newNotification,
          ...notifications.slice(0, MAX_RECENT_NOTIFICATIONS - 1),
        ];

        set({
          notifications: updatedNotifications,
          unreadCount: get().unreadCount + 1,
        });

        // Play notification sound if available
        playNotificationSound(
          parseNotificationType(newNotification.type) ===
            NotificationType.ConsiliumInvitation
        );

        // Show browser notification if permitted
        showBrowserNotification(newNotification);

        // Set as urgent invitation if type matches
        if (
          parseNotificationType(newNotification.type) ===
          NotificationType.ConsiliumInvitation
        ) {
          set({ urgentInvitation: newNotification });
        }
      },

      /**
       * Set/Clear urgent invitation
       */
      setUrgentInvitation: (notification) => {
        set({ urgentInvitation: notification });
      },

      /**
       * Mark a single notification as read
       */
      markAsRead: (notificationId) => {
        const { notifications, unreadCount } = get();
        const notification = notifications.find((n) => n.id === notificationId);

        if (notification && !notification.isRead) {
          const updatedNotifications = notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          );

          set({
            notifications: updatedNotifications,
            unreadCount: Math.max(0, unreadCount - 1),
          });
        }
      },

      /**
       * Mark all notifications as read
       */
      markAllAsRead: () => {
        const { notifications } = get();
        const updatedNotifications = notifications.map((n) => ({
          ...n,
          isRead: true,
        }));

        set({
          notifications: updatedNotifications,
          unreadCount: 0,
        });
      },

      /**
       * Set unread count (from API)
       */
      setUnreadCount: (count) => {
        set((state) =>
          state.unreadCount === count ? state : { unreadCount: count }
        );
      },

      /**
       * Increment unread count
       */
      incrementUnreadCount: () => {
        set({ unreadCount: get().unreadCount + 1 });
      },

      /**
       * Decrement unread count
       */
      decrementUnreadCount: () => {
        set({ unreadCount: Math.max(0, get().unreadCount - 1) });
      },

      /**
       * Set panel open state
       */
      setPanelOpen: (isOpen) => {
        set({ isPanelOpen: isOpen });
      },

      /**
       * Toggle panel open state
       */
      togglePanel: () => {
        set({ isPanelOpen: !get().isPanelOpen });
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      /**
       * Set SignalR connection status
       */
      setConnectionStatus: (status) => {
        set((state) =>
          state.connectionStatus === status
            ? state
            : { connectionStatus: status }
        );
      },

      /**
       * Clear all notifications (on logout)
       */
      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
          isPanelOpen: false,
        });
      },
    }),
    'notificationStore'
  )
);

/**
 * Play notification sound effect
 * @param isUrgent - If true, play a more urgent/longer tone
 */
function playNotificationSound(isUrgent = false): void {
  try {
    // Use Web Audio API for notification sound
    const audioContext = new (
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant notification tone
    oscillator.type = isUrgent ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(
      isUrgent ? 440 : 880,
      audioContext.currentTime
    );
    oscillator.frequency.linearRampToValueAtTime(
      isUrgent ? 880 : 1046.5,
      audioContext.currentTime + (isUrgent ? 0.2 : 0.1)
    );

    gainNode.gain.setValueAtTime(
      isUrgent ? 0.5 : 0.3,
      audioContext.currentTime
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + (isUrgent ? 1.5 : 0.3)
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + (isUrgent ? 1.5 : 0.3));
  } catch {
    // Audio not supported or blocked
    console.debug('Notification sound not available');
  }
}

/**
 * Show browser notification
 */
function showBrowserNotification(notification: Notification): void {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png',
      tag: notification.id,
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png',
          tag: notification.id,
        });
      }
    });
  }
}

/**
 * Helper to get notification type label
 * @param type - NotificationType enum value
 * @param t - i18n translate function (optional). If not provided, returns English labels.
 */
export function getNotificationTypeLabel(
  type: NotificationTypeValue,
  t?: (key: string, defaultValue: string) => string
): string {
  const normalizedType = parseNotificationType(type);

  if (!t) {
    // Fallback English labels if no i18n function provided
    switch (normalizedType) {
      case NotificationType.AiScreeningCompleted:
        return 'Screening';
      case NotificationType.ConsultationAccepted:
      case NotificationType.ConsultationResultProvided:
      case NotificationType.NewConsultationRequest:
        return 'Consultation';
      case NotificationType.NewPatientMessage:
        return 'Message';
      case NotificationType.NewAppointmentBooked:
      case NotificationType.ScheduleChanged:
        return 'Appointment';
      case NotificationType.WalletDepositSuccess:
      case NotificationType.WalletPaymentProcessed:
        return 'Wallet';
      default:
        return 'Notification';
    }
  }

  // i18n-based labels
  switch (normalizedType) {
    case NotificationType.AiScreeningCompleted:
      return t('notification.types.screening', 'Screening');
    case NotificationType.ConsultationAccepted:
    case NotificationType.ConsultationResultProvided:
    case NotificationType.NewConsultationRequest:
      return t('notification.types.consultation', 'Consultation');
    case NotificationType.NewPatientMessage:
      return t('notification.types.message', 'Message');
    case NotificationType.NewAppointmentBooked:
    case NotificationType.ScheduleChanged:
      return t('notification.types.appointment', 'Appointment');
    case NotificationType.WalletDepositSuccess:
    case NotificationType.WalletPaymentProcessed:
      return t('notification.types.wallet', 'Wallet');
    default:
      return t('notification.types.notification', 'Notification');
  }
}

export default useNotificationStore;
