import { getNotificationRoute, NotificationType } from '@/types/notification';
import type { Notification } from '@/types/notification';

const buildNotification = (
  type: NotificationType,
  payload: unknown,
  referenceId?: string | null
): Notification => ({
  id: 'noti-1',
  userId: 'user-1',
  title: 'Title',
  message: 'Message',
  type,
  referenceId: referenceId ?? null,
  isRead: false,
  payload: payload as Notification['payload'],
  createdAt: new Date().toISOString(),
});

describe('getNotificationRoute', () => {
  it('routes system alert by action instead of title/message keyword', () => {
    const notification = buildNotification(
      NotificationType.SystemAlert,
      {
        action: 'ophthalmologist_email_confirmed',
      },
      null
    );

    const route = getNotificationRoute(notification, ['SystemAdmin']);

    expect(route).toBe('/system-admin/contracts');
  });

  it('routes doctor booking with shared AI data to screening review path', () => {
    const screeningId = 'bf7090c5-6f6f-4721-a44b-20f65e6ff8e2';
    const notification = buildNotification(
      NotificationType.NewAppointmentBooked,
      {
        aiScreeningId: screeningId,
        sharedMedicalData: true,
      }
    );

    const route = getNotificationRoute(notification, ['Ophthalmologist']);

    expect(route).toBe(`/ophthalmologist/screenings/${screeningId}/review`);
  });

  it('uses referenceId fallback for consultation navigation', () => {
    const sessionId = '755f4ef8-4b5f-49e7-b9ca-0d43ff6336e8';
    const notification = buildNotification(
      NotificationType.NewConsultationRequest,
      null,
      sessionId
    );

    const route = getNotificationRoute(notification, ['Doctor']);

    expect(route).toBe(
      `/ophthalmologist/consultations?sessionId=${encodeURIComponent(sessionId)}`
    );
  });

  it('routes wallet notification to patient wallet with transaction id', () => {
    const txId = 'f5f69ef2-6058-4992-945b-eb76878636eb';
    const notification = buildNotification(
      NotificationType.WalletDepositSuccess,
      {
        transactionId: txId,
      }
    );

    const route = getNotificationRoute(notification, ['Patient']);

    expect(route).toBe(
      `/patient/wallet?transactionId=${encodeURIComponent(txId)}`
    );
  });

  it('routes wallet notification to organisation wallet for org admin', () => {
    const txId = 'a2f8fd95-a55f-4f37-a10b-d8e932f6f47d';
    const notification = buildNotification(
      NotificationType.WalletPaymentProcessed,
      {
        transactionId: txId,
      }
    );

    const route = getNotificationRoute(notification, ['OrgAdmin']);

    expect(route).toBe(
      `/organisation/wallet?transactionId=${encodeURIComponent(txId)}`
    );
  });

  it('routes org admin verification review completion to organisation contract', () => {
    const notification = buildNotification(NotificationType.SystemAlert, {
      action: 'verification_review_completed',
      reviewFlowType: 'OrganisationVerification',
    });

    const route = getNotificationRoute(notification, ['OrgAdmin']);

    expect(route).toBe('/organisation/contract');
  });

  it('routes contract activated action to role-specific contract page', () => {
    const notification = buildNotification(NotificationType.SystemAlert, {
      action: 'contract_activated',
    });

    expect(getNotificationRoute(notification, ['Ophthalmologist'])).toBe(
      '/ophthalmologist/contract'
    );
    expect(getNotificationRoute(notification, ['OrgAdmin'])).toBe(
      '/organisation/contract'
    );
  });
});
