# Quy trình Vận hành Phòng khám Kỹ thuật số (Digital Clinic Workflow)

Tài liệu này mô tả quy trình làm việc khép kín của hệ thống AuraEyes theo mô hình Phòng khám số, tập trung vào việc quản lý hồ sơ bệnh án điện tử (EMR) theo chuẩn 23/BV-01.

## 1. Tổng quan Quy trình

Quy trình gồm 6 trạng thái chính cho một ca khám:
**Checked-in -> Screening pending -> AI completed -> Sent to Doctor -> In consultation -> Finalize**

## 2. Chi tiết các bước và Vai trò

### Bước 1: Tiếp nhận & Check-in (Clinic Staff)

- **Đối tượng**: Bệnh nhân đặt lịch trước (Quét QR từ email) hoặc Bệnh nhân vãng lai (Walk-in).
- **Hành động**: Clinic Staff thực hiện check-in cho bệnh nhân tại trang `Appointment`.
- **Kết quả**: Hệ thống khởi tạo một vòng đời `PatientVisit` và tạo mới **Hồ sơ bệnh án (Medical Record)**.
- **Trạng thái**: `CheckedIn`.

### Bước 2: Điền Thông tin Hành chính (Clinic Staff)

- **Hành động**: Clinic Staff sử dụng trang `ErmFormPatient.tsx` (Giao diện chuẩn 23/BV-01) để điền:
  - Phần I: Hành chính (Họ tên, tuổi, địa chỉ, nghề nghiệp...).
  - Phần II: Quản lý người bệnh (Ngày giờ vào viện, nơi giới thiệu...).
- **Trạng thái**: Chuyển sang `ScreeningPending`.

### Bước 3: Khám Sàng lọc AI (Clinic Staff)

- **Hành động**: Nhân viên chụp ảnh võng mạc và đẩy lên hệ thống AI.
- **Kết quả**: AI phân tích và trả về kết quả rủi ro (Risk Level) cùng các tổn thương phát hiện được.
- **Trạng thái**: `AICompleted`.

### Bước 4: Chuyển Bác sĩ (Clinic Staff)

- **Hành động**: Nhân viên xem lại kết quả AI và chọn Bác sĩ chuyên khoa để chuyển hồ sơ.
- **Trạng thái**: `SentToDoctor`.

### Bước 5: Khám Lâm sàng (Bác sĩ)

- **Hành động**: Bác sĩ tiếp nhận hồ sơ trong trang `Screening Review`.
- **Hành động tiếp theo**: Nhấn "Tạo hồ sơ bệnh án" để chuyển sang `ErmForm.tsx` (Giao diện hiện đại).
- **Nhiệm vụ Bác sĩ**:
  - Xem dữ liệu AI đã được điền tự động (Admission Reason, AI Findings).
  - Điền Phần A: Bệnh án (Quá trình bệnh lý, tiền sử, khám lâm sàng chi tiết mắt phải/mắt trái).
  - Đưa ra chẩn đoán cuối cùng và hướng điều trị.
- **Trạng thái**: `InConsultation`.

### Bước 6: Hoàn tất & Thanh toán (Clinic Staff / Cashier)

- **Hành động**: Bác sĩ xác nhận hoàn tất. Clinic Staff/Cashier thực hiện thanh toán và in hồ sơ bệnh án cho bệnh nhân.
- **Trạng thái**: `Finalized`.

## 3. Quản lý Tái khám (Patient Follow-up)

- Bệnh nhân có thể tự tra cứu lịch sử hồ sơ bệnh án cũ thông qua **CitizenID** hoặc **UserId** tại trang `Follow-up`.
- Hệ thống cho phép chọn một hồ sơ cũ để tạo yêu cầu tái khám (Follow-up Appointment), giúp bác sĩ nắm bắt được tiền sử bệnh lý của bệnh nhân.

## 4. Các tệp tin quan trọng

- `MedicalRecord.cs`: Entity chính lưu trữ dữ liệu bệnh án ở Backend.
- `ErmFormPatient.tsx`: Form nhập liệu hành chính (Chuẩn giấy tờ).
- `ErmForm.tsx`: Form khám lâm sàng cho Bác sĩ (Hiện đại, thông minh).
- `queue.tsx`: Trang quản lý hàng chờ của Clinic Staff.
- `screening-review.tsx`: Trang xem kết quả AI và chuyển đổi sang Bệnh án cho Bác sĩ.
- `follow-up.tsx`: Trang dành cho bệnh nhân đăng ký tái khám.
