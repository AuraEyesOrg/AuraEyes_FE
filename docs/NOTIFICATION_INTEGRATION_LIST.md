# Danh sách tích hợp Notification (BE -> FE)

Tài liệu này tổng hợp toàn bộ các loại thông báo hiện có trong hệ thống Aura, cấu trúc dữ liệu song ngữ mới, và các điểm kích hoạt tại Backend.

## 1. Kiến trúc Thông báo Song ngữ (Bilingual JSON)

Để đảm bảo trải nghiệm người dùng đồng nhất, hệ thống đã chuyển sang định dạng JSON song ngữ. Mọi thông báo từ Backend PHẢI sử dụng helper `NotificationMessage.Create(vi, en)`.

- **Cấu trúc JSON lưu trữ**: `{"vi": "Nội dung tiếng Việt", "en": "English content"}`
- **Cách hiển thị FE**: Sử dụng utility `renderBilingualContent(content, lang)` để tự động chọn ngôn ngữ theo cấu hình trình duyệt/người dùng.

## 2. Nguyên tắc Thiết kế (Human-Centric)

1. **Không truyền ID kỹ thuật**: Tuyệt đối không đưa UUID vào nội dung thông báo. Sử dụng tên người, mã đơn hàng, hoặc mã bệnh án dễ đọc.
2. **Cá nhân hóa**:
   - Đối với bác sĩ: "Bệnh nhân [Tên] đã..."
   - Đối với bệnh nhân: "Bạn đã..." hoặc "Yêu cầu của bạn đã..."
3. **Tránh lỗi "Unknown"**: Luôn truy vấn và xử lý tên bệnh nhân/bác sĩ trước khi tạo payload thông báo.

---

## 3. Danh sách chi tiết các loại Notification

| STT | Loại (NotificationType)        | Trigger tại Backend (BE)                          | Payload & Params quan trọng                | Route điều hướng (FE)                                        |
| :-- | :----------------------------- | :------------------------------------------------ | :----------------------------------------- | :----------------------------------------------------------- |
| 1   | **AiScreeningCompleted**       | Khi AI phân tích xong hình ảnh võng mạc.          | `screeningId`, `riskLevel`                 | `/patient/reports` hoặc `/ophthalmologist/screenings`        |
| 2   | **ConsultationAccepted**       | Bác sĩ chấp nhận yêu cầu hội chẩn của bệnh nhân.  | `sessionId`, `doctorName`                  | `/patient/chat?sessionId=...`                                |
| 3   | **ConsultationResultProvided** | Bác sĩ hoàn tất chẩn đoán và gửi kết quả.         | `sessionId`, `diagnosis`                   | `/patient/chat?sessionId=...`                                |
| 4   | **NewConsultationRequest**     | Bệnh nhân gửi yêu cầu hội chẩn mới tới bác sĩ.    | `screeningId`, `patientName`               | `/ophthalmologist/screenings/:id/review`                     |
| 5   | **NewPatientMessage**          | Bệnh nhân gửi tin nhắn mới trong cửa sổ chat.     | `sessionId`, `senderName`, `preview`       | `.../chat?sessionId=...`                                     |
| 6   | **NewAppointmentBooked**       | Lịch hẹn mới được đặt thành công.                 | `appointmentId`, `patientName`, `time`     | `/ophthalmologist/appointments` hoặc `/patient/appointments` |
| 7   | **ScheduleChanged**            | Lịch hẹn bị thay đổi thời gian hoặc trạng thái.   | `appointmentId`, `previousTime`, `newTime` | `/patient/appointments`                                      |
| 8   | **WalletDepositSuccess**       | Nạp tiền vào ví Aura thành công.                  | `transactionId`, `amount`, `newBalance`    | `/patient/wallet`                                            |
| 9   | **WalletPaymentProcessed**     | Thanh toán dịch vụ từ ví thành công.              | `transactionId`, `amount`, `description`   | `/patient/wallet`                                            |
| 10  | **ConsiliumInvitation**        | Bác sĩ mời bác sĩ khác tham gia hội chẩn nhóm.    | `groupId`, `senderName`, `patientName`     | `/network/collaboration?groupId=...`                         |
| 11  | **SystemAlert**                | Các cảnh báo hệ thống (Duyệt hồ sơ, Hợp đồng...). | `action`, `flowType`, `routeHint`          | Linh hoạt theo `routeHint` hoặc `action`                     |
| 12  | **ConsiliumNewMessage**        | Có tin nhắn mới trong nhóm hội chẩn.              | `groupId`, `senderName`, `content`         | `/network/collaboration?groupId=...`                         |
| 13  | **ConsiliumConcluded**         | Nhóm hội chẩn lâm sàng đã kết thúc.               | `groupId`, `groupName`                     | `/network/collaboration?groupId=...`                         |
| 14  | **RefundProcessed**            | Hoàn tiền thành công cho lịch khám đã hủy.        | `appointmentId`, `amount`                  | `/patient/wallet` hoặc `/patient/appointments`               |
| 15  | **PrescriptionIssued**         | Bác sĩ đã kê đơn thuốc mới.                       | `patientId`, `doctorName`                  | `/patient/medical-history`                                   |
| 16  | **EMRUpdated**                 | Bệnh án điện tử được cập nhật kết quả mới.        | `patientId`, `sessionId`                   | `/patient/medical-history`                                   |

---

## 4. Các Nhóm Thông báo mới

### Nhóm Vận hành Bác sĩ (Doctor Ops)

- **LeaveRequestProcessed**: Thông báo kết quả duyệt đơn nghỉ phép (Approved/Rejected) kèm theo khoảng thời gian cụ thể.
- **Consilium Updates**: Thông báo khi có tin nhắn mới hoặc khi ca hội chẩn kết thúc để bác sĩ kịp thời nắm bắt tiến độ.

### Nhóm Thanh toán & Hoàn tiền (Billing)

- **RefundProcessed**: Thông báo khi tiền đã được hoàn trả thành công vào tài khoản/ví của bệnh nhân sau khi hủy lịch.

### Nhóm Bệnh án & Đơn thuốc (EMR)

- **EMRUpdated / PrescriptionIssued**: Thông báo ngay khi bác sĩ chốt bệnh án hoặc kê đơn để bệnh nhân có thể truy cập ngay vào toa thuốc điện tử.

---

## 5. Các Action đặc biệt trong `SystemAlert`

Loại thông báo `SystemAlert` thường mang theo một `action` cụ thể để FE quyết định route:

- **`verification_request_submitted`**: Khi bác sĩ/phòng khám gửi hồ sơ duyệt.
  - _Route_: `/system-admin/verifications` (Admin) hoặc `/settings` (User).
- **`ophthalmologist_verification_approved`**: Khi hồ sơ bác sĩ được duyệt thành công.
  - _Route_: `/ophthalmologist/settings`.
- **`contract_activated`**: Khi hợp đồng dịch vụ được kích hoạt.
  - _Route_: `/ophthalmologist/contract`.
- **`cashier_payment_ready`**: Thông báo cho nhân viên thanh toán khi bệnh nhân đã khám xong và cần thanh toán.
  - _Target_: Clinic Staff với sub-role **Cashier**.
  - _Route_: `/clinic-staff/cashier?visitId=...`.

---

## 6. Phân quyền thông báo cho Clinic Staff (Sub-roles)

Hệ thống hỗ trợ gửi thông báo tới các nhóm nhân viên phòng khám dựa trên sub-role (không gửi tràn lan cho toàn bộ Clinic Staff):

| Sự kiện                          | Sub-role mục tiêu | Mục đích                                             |
| :------------------------------- | :---------------- | :--------------------------------------------------- |
| **Bệnh nhân Walk-in / Đặt lịch** | `Receptionist`    | Để thực hiện check-in và điều phối hàng đợi ban đầu. |
| **Bệnh nhân đã Check-in**        | `Coordinator`     | Chuẩn bị thực hiện sàng lọc (Screening).             |
| **Bác sĩ đã chốt tư vấn**        | `Cashier`         | Thực hiện thanh toán và cấp phát thuốc/kính.         |
| **Hồ sơ bệnh án hoàn tất**       | `Coordinator`     | Lưu trữ và kiểm soát chất lượng hồ sơ.               |

Backend sử dụng method `SendToClinicSubRoleAsync(subRole, ...)` để thực hiện việc này.

---

## 7. Hướng dẫn xử lý tại Frontend

Frontend không cần mapping tay từng mã thông báo vào file `i18n.json` nữa. Thay vào đó, hãy sử dụng nội dung đã được Backend bản địa hóa sẵn:

```tsx
import { renderBilingualContent } from '@/lib/notification-utils';
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const displayTitle = renderBilingualContent(notification.title, i18n.language);
const displayMessage = renderBilingualContent(
  notification.message,
  i18n.language
);
```

> [!IMPORTANT]
> Tất cả các thông báo mới PHẢI được định nghĩa qua `NotificationMessage.Create` ở Backend để đảm bảo tính tương thích với cơ chế hiển thị này.
