# Notification Route Mapping (FE + BE)

Tai lieu nay tong hop toan bo diem su dung notification trong FE + BE, quy tac click notification di route nao, va can truyen ID gi.

## 1) Tong quan luong notification

- BE tao notification qua INotificationService.SendAsync(...)
- Notification duoc luu DB (entity Notification)
- Sau khi luu, BE day realtime qua SignalR:
  - ReceiveNotification
  - ReceiveUnreadCount
- FE nhan qua hook useSignalRNotification, cap nhat store va hien toast
- Khi user click notification (dropdown/page), FE goi getNotificationRoute(notification, roles) de resolve route dich

## 2) FE files lien quan

### 2.1 Route resolver va kieu du lieu

- src/types/notification.ts
  - NotificationType enum
  - parse payload
  - getNotificationRoute(notification, roles)

### 2.2 Data fetching va mutations

- src/features/notifications/api/notification.api.ts
- src/lib/notificationService.ts
- src/features/notifications/hooks/use-notifications.ts

### 2.3 State + realtime

- src/store/useNotificationStore.ts
- src/hooks/useSignalRNotification.ts

### 2.4 UI click handlers

- src/components/ui/notification/NotificationDropdown.tsx
- src/features/patient/pages/notifications.tsx
- src/features/notifications/pages/view-all.tsx

## 3) API va Hub contracts

### 3.1 REST API

- GET /api/notifications
- GET /api/notifications/unread-count
- POST /api/notifications/{id}/mark-read
- POST /api/notifications/mark-all-read

Controller: src/API/Controllers/NotificationsController.cs

### 3.2 SignalR Hub

- Hub endpoint: /api/hubs/notifications
- Outbound methods:
  - ReceiveNotification
  - ReceiveUnreadCount

Hub files:

- src/API/Hubs/NotificationHub.cs
- src/API/Services/NotificationHubService.cs

## 4) Quy tac resolve route khi click notification (FE)

Nguon su that: src/types/notification.ts (ham getNotificationRoute)

### 4.1 Quy tac doc ID tu payload/referenceId

FE uu tien doc ID trong payload theo key list, sau do fallback sang notification.referenceId.

- screening id: aiScreeningId | screeningId
- consultation/session id: consultationSessionId | sessionId | consultationId
- appointment id: appointmentId | appointmentSlotId | slotId
- transaction id: transactionId

### 4.2 Mapping theo NotificationType + role + ID can co

| NotificationType           | Role                    | Route dich                                                                      | ID can co                                             | Cach truyen        |
| -------------------------- | ----------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------ |
| AiScreeningCompleted       | Patient                 | /patient/reports                                                                | screeningId                                           | ?screeningId=...   |
| AiScreeningCompleted       | Ophthalmologist         | /ophthalmologist/screenings                                                     | screeningId                                           | ?screeningId=...   |
| AiScreeningCompleted       | OrgAdmin                | /organisation/patients                                                          | screeningId                                           | ?screeningId=...   |
| ConsultationAccepted       | Ophthalmologist         | /ophthalmologist/consultations                                                  | consultation/session id                               | ?sessionId=...     |
| ConsultationAccepted       | Patient                 | /patient/chat                                                                   | consultation/session id                               | ?sessionId=...     |
| ConsultationAccepted       | OrgAdmin                | /organisation/calendar                                                          | consultation/session id                               | ?sessionId=...     |
| ConsultationResultProvided | Ophthalmologist         | /ophthalmologist/consultations                                                  | consultation/session id                               | ?sessionId=...     |
| ConsultationResultProvided | Patient                 | /patient/chat                                                                   | consultation/session id                               | ?sessionId=...     |
| ConsultationResultProvided | OrgAdmin                | /organisation/calendar                                                          | consultation/session id                               | ?sessionId=...     |
| NewConsultationRequest     | Ophthalmologist         | /ophthalmologist/consultations                                                  | consultation/session id                               | ?sessionId=...     |
| NewConsultationRequest     | Patient                 | /patient/chat                                                                   | consultation/session id                               | ?sessionId=...     |
| NewConsultationRequest     | OrgAdmin                | /organisation/calendar                                                          | consultation/session id                               | ?sessionId=...     |
| NewPatientMessage          | Ophthalmologist         | /ophthalmologist/consultations                                                  | consultation/session id                               | ?sessionId=...     |
| NewPatientMessage          | Patient                 | /patient/chat                                                                   | consultation/session id                               | ?sessionId=...     |
| NewPatientMessage          | OrgAdmin                | /organisation/calendar                                                          | consultation/session id                               | ?sessionId=...     |
| NewAppointmentBooked       | Ophthalmologist         | /ophthalmologist/screenings/{aiScreeningId}/review (neu sharedMedicalData=true) | aiScreeningId                                         | path param         |
| NewAppointmentBooked       | Ophthalmologist         | /ophthalmologist/appointments                                                   | consultationSessionId/appointmentSlotId/appointmentId | ?sessionId=...     |
| NewAppointmentBooked       | OrgAdmin                | /organisation/calendar                                                          | consultationSessionId/appointmentSlotId/appointmentId | ?sessionId=...     |
| NewAppointmentBooked       | Patient                 | /patient/appointments                                                           | consultationSessionId/appointmentSlotId/appointmentId | ?appointmentId=... |
| ScheduleChanged            | Ophthalmologist         | /ophthalmologist/appointments                                                   | appointment id                                        | ?appointmentId=... |
| ScheduleChanged            | OrgAdmin                | /organisation/calendar                                                          | appointment id                                        | ?appointmentId=... |
| ScheduleChanged            | Patient                 | /patient/appointments                                                           | appointment id                                        | ?appointmentId=... |
| WalletDepositSuccess       | Patient                 | /patient/wallet                                                                 | transactionId                                         | ?transactionId=... |
| WalletDepositSuccess       | OrgAdmin                | /organisation/wallet                                                            | transactionId                                         | ?transactionId=... |
| WalletPaymentProcessed     | Patient                 | /patient/wallet                                                                 | transactionId                                         | ?transactionId=... |
| WalletPaymentProcessed     | OrgAdmin                | /organisation/wallet                                                            | transactionId                                         | ?transactionId=... |
| WalletPaymentProcessed     | Ophthalmologist         | /ophthalmologist/wallet                                                         | transactionId                                         | ?transactionId=... |
| SystemAlert                | Phu thuoc action + role | Xem muc 4.3                                                                     | tuy truong hop                                        | route/action based |

### 4.3 SystemAlert action routing

Neu payload co routeHint bat dau bang '/' thi dung truc tiep routeHint.

Neu khong co routeHint, FE route theo action/flow:

- action = ophthalmologist_email_confirmed
  - SystemAdmin -> /system-admin/contracts
- action = verification_request_submitted
  - SystemAdmin -> /system-admin/verifications
  - Ophthalmologist -> /ophthalmologist/settings
  - OrgAdmin -> /organisation/contract
- action = verification_review_completed hoac ophthalmologist_verification_approved
  - SystemAdmin -> /system-admin/verifications
  - Ophthalmologist -> /ophthalmologist/settings
  - OrgAdmin -> /organisation/contract
- action = contract_activated
  - Ophthalmologist -> /ophthalmologist/contract
  - OrgAdmin -> /organisation/contract
- flow verification onboarding/credential/organisation
  - SystemAdmin -> /system-admin/verifications
  - Ophthalmologist -> /ophthalmologist/settings
  - OrgAdmin -> /organisation/contract

## 5) BE callsites: Noi phat notification + payload ID keys

Nguon quet chinh: cac file su dung NotificationType.\* va \_notificationService.SendAsync(...)

| File                                                                                                               | NotificationType           | Trigger                            | Payload keys (quan trong cho route/id)                                                      |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| src/Application/Screenings/Commands/CompleteAiScreening/CompleteAiScreeningCommandHandler.cs                       | AiScreeningCompleted       | Hoan tat AI screening              | ScreeningId, ResultStatus                                                                   |
| src/Application/ConsultationSessions/Commands/SubmitVerificationReport/SubmitVerificationReportCommandHandler.cs   | ConsultationResultProvided | Bac si gui ket qua consult         | ConsultationId, DoctorId                                                                    |
| src/Application/ConsultationSessions/Commands/SendMessage/SendMessageCommandHandler.cs                             | NewPatientMessage          | Patient gui tin nhan trong consult | ConsultationId, PatientId                                                                   |
| src/Application/ConsultationSessions/Commands/CreateVerificationSession/CreateVerificationSessionCommandHandler.cs | NewConsultationRequest     | Tao verification session           | ConsultationId, PatientId                                                                   |
| src/Infrastructure/Services/SessionReminderWorker.cs                                                               | NewConsultationRequest     | Reminder session tre               | sessionId, consultationId, reminderType                                                     |
| src/Application/Scheduling/AppointmentSlots/Commands/ConfirmReservation/ConfirmReservationCommandHandler.cs        | NewAppointmentBooked       | Confirm dat lich                   | ConsultationSessionId, AppointmentSlotId, AppointmentTime, AiScreeningId, SharedMedicalData |
| src/Application/Scheduling/Appointments/Commands/CreateClinicAppointment/CreateClinicAppointmentCommandHandler.cs  | NewAppointmentBooked       | Tao lich tai co so                 | AppointmentId, AppointmentTime, Reason, OrganisationId                                      |
| src/Application/Wallets/Commands/VerifyPayment/VerifyPaymentCommandHandler.cs                                      | WalletDepositSuccess       | Xac minh nap tien wallet           | TransactionId, Amount, Action                                                               |
| src/Application/AiQuota/Commands/BuyAiQuota/BuyAiQuotaCommandHandler.cs                                            | WalletPaymentProcessed     | Mua AI quota                       | TransactionId, Amount, QuotaAmount                                                          |
| src/Application/Ophthalmologists/Commands/UploadCredentials/UploadCredentialsCommandHandler.cs                     | SystemAlert                | Gui request xac minh credentials   | action, verificationFlowType, ophthalmologistId, previousStatus, currentStatus              |
| src/Application/SystemAdmin/Ophthalmologists/Commands/VerifyOphthalmologist/VerifyOphthalmologistCommandHandler.cs | SystemAlert                | Admin duyet/tu choi verify         | action, reviewFlowType, approved, rejectionReason, ophthalmologistId                        |
| src/Application/Ophthalmologists/Commands/VerifyOphthalmologist/VerifyOphthalmologistCommandHandler.cs             | SystemAlert                | Ophthalmologist verification event | OphthalmologistId, Action                                                                   |
| src/Infrastructure/Identity/AuthService.cs                                                                         | SystemAlert                | Confirm email cho ophthalmologist  | action=ophthalmologist_email_confirmed, ophthalmologistUserId, emailConfirmed               |
| src/Application/SystemAdmin/Contracts/Commands/SignContract/SignContractCommandHandler.cs                          | SystemAlert                | Kich hoat contract                 | action=contract_activated, contractId, contractType, contractStatus, routeHint              |

## 6) ReferenceId extraction tren BE

File: src/Infrastructure/Services/NotificationService.cs

- BE serializes payload camelCase
- Neu khong truyen referenceId truc tiep, service se tu extract GUID theo type + generic keys
- Keys generic da ho tro:
  - consultationSessionId, consultationId, sessionId
  - appointmentId, appointmentSlotId, slotId
  - screeningId, aiScreeningId
  - transactionId, messageId
  - ophthalmologistId, ophthalmologistUserId

Dieu nay giup FE fallback notification.referenceId khi payload key bi khac ten.

## 7) Luu y va risk can biet

- ConsultationAccepted va ScheduleChanged dang co enum + route FE, nhung co the khong co du callsite tao notification trong luong nghiep vu hien tai.
- SystemAlert co routeHint: neu routeHint sai, click se di sai route.
- Payload naming khong dong nhat (PascalCase/camelCase) van chay nho normalize, nhung nen thong nhat naming de de bao tri.

## 8) Checklist khi them notification moi

1. BE: them NotificationType (neu can), call SendAsync, dam bao payload co ID route key.
2. FE: cap nhat getNotificationRoute cho role + route dich.
3. FE UI: dam bao dropdown/view-all click goi getNotificationRoute.
4. Test manual:
   - dropdown click dung route
   - query id dung key
   - role khac nhau di dung man hinh
   - unread count update dung qua SignalR.
