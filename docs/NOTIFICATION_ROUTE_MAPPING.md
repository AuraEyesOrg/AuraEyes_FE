# Notification Route Mapping (FE + BE)

Tài liệu này mô tả đầy đủ cách ánh xạ notification sang route đích trong FE, đối chiếu với payload thực tế từ BE.
Mục tiêu chính là giảm lỗi click notification bị rơi về route mặc định (thường là dashboard).

## 1) Tổng quan luồng notification

- BE phát notification qua `INotificationService.SendAsync(...)`.
- Notification được lưu trong DB (entity `Notification`).
- Sau khi lưu, BE đẩy realtime qua SignalR:
  - `ReceiveNotification`
  - `ReceiveUnreadCount`
- FE nhận qua hook `useSignalRNotification`, cập nhật store và hiển thị toast.
- Khi user click notification (dropdown hoặc trang danh sách), FE gọi:
  - `getNotificationRoute(notification, roles)`

## 2) Các file FE liên quan

### 2.1 Route resolver và kiểu dữ liệu

- `src/types/notification.ts`
  - `NotificationType`
  - parse payload
  - `getNotificationRoute(notification, roles)`

### 2.2 Data fetching và mutations

- `src/features/notifications/api/notification.api.ts`
- `src/lib/notificationService.ts`
- `src/features/notifications/hooks/use-notifications.ts`

### 2.3 State + realtime

- `src/store/useNotificationStore.ts`
- `src/hooks/useSignalRNotification.ts`

### 2.4 UI click handlers

- `src/components/ui/notification/NotificationDropdown.tsx`
- `src/features/patient/pages/notifications.tsx`
- `src/features/notifications/pages/view-all.tsx`

## 3) API và Hub contract

### 3.1 REST API

- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `POST /api/notifications/{id}/mark-read`
- `POST /api/notifications/mark-all-read`

Controller: `src/API/Controllers/NotificationsController.cs`

### 3.2 SignalR Hub

- Hub endpoint: `/api/hubs/notifications`
- Outbound methods:
  - `ReceiveNotification`
  - `ReceiveUnreadCount`

Hub files:

- `src/API/Hubs/NotificationHub.cs`
- `src/API/Services/NotificationHubService.cs`

## 4) Quy tắc resolve route khi click notification (FE)

Nguồn sự thật: `src/types/notification.ts` (`getNotificationRoute`).

### 4.1 Chuẩn hoá role

Resolver xử lý role không phân biệt hoa/thường và có alias:

- `SystemAdmin` ↔ `Admin`
- `OrgAdmin` ↔ `Organization`
- `Ophthalmologist` ↔ `Doctor`

### 4.2 Chuẩn hoá payload + fallback ID

FE ưu tiên đọc ID trong payload, sau đó fallback sang `notification.referenceId`.

- `screeningId`: `aiScreeningId` | `screeningId`
- `consultation/sessionId`: `consultationSessionId` | `sessionId` | `consultationId`
- `appointmentId`: `appointmentId` | `appointmentSlotId` | `slotId`
- `transactionId`: `transactionId`

### 4.3 Ưu tiên `routeHint`

- Nếu payload có `routeHint`:
  - FE chấp nhận cả dạng có `/` đầu (`/organisation/contract`) và dạng thiếu `/` (`organisation/contract`).
  - Dạng thiếu `/` sẽ được chuẩn hoá thành path hợp lệ trước khi navigate.

Điểm này giúp giảm lỗi click rơi về route mặc định khi BE trả `routeHint` chưa chuẩn.

### 4.4 Mapping theo `NotificationType`

| NotificationType                                                                               | Role                    | Route đích                                         | ID cần có                                             | Cách truyền          |
| ---------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------- | ----------------------------------------------------- | -------------------- |
| AiScreeningCompleted                                                                           | Patient                 | /patient/reports                                   | screeningId                                           | `?screeningId=...`   |
| AiScreeningCompleted                                                                           | Ophthalmologist         | /ophthalmologist/screenings                        | screeningId                                           | `?screeningId=...`   |
| AiScreeningCompleted                                                                           | OrgAdmin/Organization   | /organisation/patients                             | screeningId                                           | `?screeningId=...`   |
| ConsultationAccepted / ConsultationResultProvided / NewConsultationRequest / NewPatientMessage | Ophthalmologist         | /ophthalmologist/consultations                     | consultation/session id                               | `?sessionId=...`     |
| ConsultationAccepted / ConsultationResultProvided / NewConsultationRequest / NewPatientMessage | Patient                 | /patient/chat                                      | consultation/session id                               | `?sessionId=...`     |
| ConsultationAccepted / ConsultationResultProvided / NewConsultationRequest / NewPatientMessage | OrgAdmin/Organization   | /organisation/calendar                             | consultation/session id                               | `?sessionId=...`     |
| NewAppointmentBooked (sharedMedicalData=true, có aiScreeningId)                                | Ophthalmologist         | /ophthalmologist/screenings/{aiScreeningId}/review | aiScreeningId                                         | path param           |
| NewAppointmentBooked                                                                           | Ophthalmologist         | /ophthalmologist/appointments                      | consultationSessionId/appointmentSlotId/appointmentId | `?sessionId=...`     |
| NewAppointmentBooked                                                                           | OrgAdmin/Organization   | /organisation/calendar                             | consultationSessionId/appointmentSlotId/appointmentId | `?sessionId=...`     |
| NewAppointmentBooked                                                                           | Patient                 | /patient/appointments                              | consultationSessionId/appointmentSlotId/appointmentId | `?appointmentId=...` |
| ScheduleChanged                                                                                | Ophthalmologist         | /ophthalmologist/appointments                      | appointment id                                        | `?appointmentId=...` |
| ScheduleChanged                                                                                | OrgAdmin/Organization   | /organisation/calendar                             | appointment id                                        | `?appointmentId=...` |
| ScheduleChanged                                                                                | Patient                 | /patient/appointments                              | appointment id                                        | `?appointmentId=...` |
| WalletDepositSuccess                                                                           | Patient                 | /patient/wallet                                    | transactionId                                         | `?transactionId=...` |
| WalletDepositSuccess                                                                           | OrgAdmin/Organization   | /organisation/wallet                               | transactionId                                         | `?transactionId=...` |
| WalletPaymentProcessed                                                                         | Patient                 | /patient/wallet                                    | transactionId                                         | `?transactionId=...` |
| WalletPaymentProcessed                                                                         | OrgAdmin/Organization   | /organisation/wallet                               | transactionId                                         | `?transactionId=...` |
| WalletPaymentProcessed                                                                         | Ophthalmologist         | /ophthalmologist/wallet                            | transactionId                                         | `?transactionId=...` |
| SystemAlert                                                                                    | Theo action/flow + role | Xem mục 4.5                                        | tuỳ trường hợp                                        | route/action based   |

### 4.5 Mapping chi tiết `SystemAlert` (đã harden)

Resolver xử lý theo thứ tự ưu tiên:

1. `routeHint` (nếu có) → đi thẳng route.
2. `action` (ưu tiên exact match, có thêm keyword matching để chịu được biến thể action mới).
3. `verificationFlowType/reviewFlowType/flowType` (fallback theo flow verification).

Các action chính đang có từ BE:

- `ophthalmologist_email_confirmed`
  - `SystemAdmin` → `/system-admin/contracts`
- `verification_request_submitted`
  - `SystemAdmin` → `/system-admin/verifications`
  - `Ophthalmologist` → `/ophthalmologist/settings`
  - `OrgAdmin/Organization` → `/organisation/contract`
- `verification_review_completed` hoặc `ophthalmologist_verification_approved`
  - `SystemAdmin` → `/system-admin/verifications`
  - `Ophthalmologist` → `/ophthalmologist/settings`
  - `OrgAdmin/Organization` → `/organisation/contract`
- `contract_activated`
  - `Ophthalmologist` → `/ophthalmologist/contract`
  - `OrgAdmin/Organization` → `/organisation/contract`

Fallback theo flow verification (khi action không match exact):

- Nếu `flowType` có dấu hiệu verification/onboarding/credential/organisation:
  - `SystemAdmin` → `/system-admin/verifications`
  - `Ophthalmologist` → `/ophthalmologist/settings`
  - `OrgAdmin/Organization` → `/organisation/contract`

## 5) BE callsites: nơi phát notification + payload key

Nguồn quét chính: các file gọi `SendAsync(..., NotificationType.SystemAlert, payload: ...)`.

| File                                                                                                                 | NotificationType | Trigger                                  | Payload keys quan trọng                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/Application/Ophthalmologists/Commands/UploadCredentials/UploadCredentialsCommandHandler.cs`                     | SystemAlert      | Bác sĩ gửi/yêu cầu duyệt hồ sơ chứng chỉ | `action=verification_request_submitted`, `verificationFlowType`, `ophthalmologistId`, `previousStatus`, `currentStatus` |
| `src/Application/SystemAdmin/Ophthalmologists/Commands/VerifyOphthalmologist/VerifyOphthalmologistCommandHandler.cs` | SystemAlert      | Admin duyệt/từ chối hồ sơ bác sĩ         | `action=verification_review_completed`, `reviewFlowType`, `approved`, `rejectionReason`, `ophthalmologistId`            |
| `src/Application/Ophthalmologists/Commands/VerifyOphthalmologist/VerifyOphthalmologistCommandHandler.cs`             | SystemAlert      | Event bác sĩ được verify                 | `action=ophthalmologist_verification_approved`, `verificationFlowType=OnboardingVerification`, `ophthalmologistId`      |
| `src/Infrastructure/Identity/AuthService.cs`                                                                         | SystemAlert      | Bác sĩ xác nhận email                    | `action=ophthalmologist_email_confirmed`, `ophthalmologistUserId`, `emailConfirmed`                                     |
| `src/Application/SystemAdmin/Contracts/Commands/SignContract/SignContractCommandHandler.cs`                          | SystemAlert      | Kích hoạt hợp đồng                       | `action=contract_activated`, `contractId`, `contractType`, `contractStatus`, `routeHint`                                |

## 6) ReferenceId extraction ở BE

File: `src/Infrastructure/Services/NotificationService.cs`

- BE serialize payload dạng camelCase.
- Nếu không truyền `referenceId` trực tiếp, service sẽ cố extract GUID theo type + generic keys.
- Generic keys đang hỗ trợ:
  - `consultationSessionId`, `consultationId`, `sessionId`
  - `appointmentId`, `appointmentSlotId`, `slotId`
  - `screeningId`, `aiScreeningId`
  - `transactionId`, `messageId`
  - `ophthalmologistId`, `ophthalmologistUserId`

Điều này giúp FE vẫn điều hướng được khi tên key payload khác nhau giữa callsite.

## 7) Vì sao click có thể rơi về dashboard mặc định?

Các nguyên nhân thường gặp:

- Action mới chưa được map trong FE resolver.
- `routeHint` được gửi dạng không chuẩn (thiếu `/` đầu).
- Role trả về là `Organization` nhưng FE chỉ check `OrgAdmin`.
- Payload thiếu key ID ưu tiên, không có `referenceId` fallback.

Định hướng fix:

- Ưu tiên map exact action, thêm keyword matching có kiểm soát cho action biến thể.
- Chuẩn hoá `routeHint` trước khi navigate.
- Duy trì alias role (`OrgAdmin` + `Organization`).
- Bảo đảm payload có key ID hoặc `referenceId` hợp lệ.

## 8) Checklist khi thêm notification mới

1. BE: thêm `NotificationType` (nếu cần), gọi `SendAsync`, bảo đảm payload có key ID phục vụ route.
2. FE: cập nhật `getNotificationRoute` cho role + route đích.
3. FE UI: bảo đảm click ở dropdown/page đều gọi `getNotificationRoute`.
4. Test thủ công:
   - click dropdown đi đúng route
   - query param đúng key ID
   - role khác nhau đi đúng màn hình
   - unread count cập nhật đúng qua SignalR
