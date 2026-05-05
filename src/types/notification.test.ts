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

    expect(route).toBe('/system-admin/verifications');
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

  it('routes org admin verification rejection to organisation contract', () => {
    const notification = buildNotification(NotificationType.SystemAlert, {
      action: 'verification_review_rejected',
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

  it('normalizes routeHint without leading slash', () => {
    const notification = buildNotification(NotificationType.SystemAlert, {
      routeHint: 'organisation/contract',
    });

    expect(getNotificationRoute(notification, ['OrgAdmin'])).toBe(
      '/organisation/contract'
    );
  });

  it('prioritizes routeHint for non-SystemAlert notifications', () => {
    const notification = buildNotification(NotificationType.NewPatientMessage, {
      routeHint: 'ophthalmologist/consultations?sessionId=abc',
      sessionId: 'should-not-be-used',
    });

    expect(getNotificationRoute(notification, ['Doctor'])).toBe(
      '/ophthalmologist/consultations?sessionId=abc'
    );
  });

  it('supports Organization role alias for org wallet route', () => {
    const txId = '5310c0ec-a2aa-4513-a48c-4eefef18f73b';
    const notification = buildNotification(
      NotificationType.WalletPaymentProcessed,
      {
        transactionId: txId,
      }
    );

    expect(getNotificationRoute(notification, ['Organization'])).toBe(
      `/organisation/wallet?transactionId=${encodeURIComponent(txId)}`
    );
  });

  it('routes verification action variants by keyword matching', () => {
    const notification = buildNotification(NotificationType.SystemAlert, {
      action: 'organisation_verification_request_submitted',
      verificationFlowType: 'OrganisationVerification',
    });

    expect(getNotificationRoute(notification, ['SystemAdmin'])).toBe(
      '/system-admin/verifications'
    );
  });

  it('treats string boolean sharedMedicalData values as true', () => {
    const screeningId = 'f5936924-aa6b-4ac8-ab9d-75de89959f1b';
    const notification = buildNotification(
      NotificationType.NewAppointmentBooked,
      {
        aiScreeningId: screeningId,
        sharedMedicalData: 'true',
      }
    );

    expect(getNotificationRoute(notification, ['Ophthalmologist'])).toBe(
      `/ophthalmologist/screenings/${screeningId}/review`
    );
  });

  it('routes correctly when backend sends notification type as enum name', () => {
    const notification: Notification = {
      ...buildNotification(NotificationType.NewPatientMessage, {
        sessionId: 'session-123',
      }),
      type: 'NewPatientMessage',
    };

    expect(getNotificationRoute(notification, ['Doctor'])).toBe(
      '/ophthalmologist/consultations?sessionId=session-123'
    );
  });
});
