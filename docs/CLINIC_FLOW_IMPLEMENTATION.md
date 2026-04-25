# Clinic Flow Implementation Plan (Digital Clinic Model)

## 1. Overview

Hệ thống AuraEyes đang chuyển từ mô hình "lai" (Platform & System) sang mô hình **Phòng khám số (Digital Clinic)**. Trong mô hình mới này, các nghiệp vụ xoay quanh một quy trình khép kín do chính tổ chức vận hành từ A-Z. Phân quyền (RBAC) sẽ được chia nhỏ gọn vào 1 role chung `ClinicStaff` (tương lai sẽ tách quyền theo sub-role: Receptionist, Coordinator, Cashier).

## 2. Các Bước Quy Trình (Actors & Flow)

### Bước 1: Receptionist (Tiếp tân) - Check In

- **Nhiệm vụ**: Tiếp nhận bệnh nhân đến khám, check-in dựa trên lịch hẹn hoặc walk-in.
- **Trạng thái hiện tại**: Đã có chức năng check-in trong `appointments.tsx`.
- **Cần làm (To-Do)**:
  - Khởi tạo vòng đời `PatientVisit` với trạng thái `CheckedIn`.

### Bước 2: Coordinator (Điều phối viên) - AI Screening & Send to Doctor

- **Nhiệm vụ**: Xem danh sách hàng đợi (Queue), tiến hành chụp ảnh võng mạc, chạy AI phân tích và chuyển (Send to Doctor) cho bác sĩ.
- **Trạng thái hiện tại**:
  - Đã có `queue.tsx` quản lý danh sách chờ. (Đã fix lỗi 400 Bad Request).
  - Chức năng AI Screening đã hoạt động.
- **Cần làm (To-Do)**:
  - Nút **Send to Doctor** cần mở popup:
    - Click "Send to Doctor" button.
    - Select an available ophthalmologist from dropdown.
    - Add any notes for the doctor (optional).
    - Click "Confirm" to assign.
  - Tích hợp thêm realtime (SignalR) cho danh sách Queue để Coordinator nhận thông báo ngay khi Receptionist check-in. Và realtime thông báo + bắn kết quả qua cho Bác sĩ.

### Bước 3: Doctor (Bác sĩ) - Khám lâm sàng & Trả kết quả

- **Nhiệm vụ**: Bác sĩ (Ophthalmologist) tiếp nhận case từ Coordinator, xem ảnh võng mạc, khám lâm sàng và đưa ra chẩn đoán/kết luận.
- **Trạng thái hiện tại**:
  - Frontend: Tham khảo và tận dụng module `screening-review.tsx`.
  - Backend: Đã có API lấy thông tin Consultation nhưng cần đảm bảo luồng `ClinicBooking` được bác sĩ nhìn thấy dễ dàng.
- **Cần làm (To-Do)**:
  - Bác sĩ khi cập nhật kết quả khám xong sẽ thay đổi trạng thái sang `WaitingForPayment`. Và có gửi Medical Report về cho bệnh nhân.
  - Bổ sung nút để bác sĩ chuyển hồ sơ sang bộ phận Thu ngân (Cashier).
  - Hồ sơ sẽ hiển thị với thiết kế Medical Report / Đơn thuốc chuẩn (như ảnh reference: hiển thị chẩn đoán, toa thuốc, tên bác sĩ khám, lời dặn). Ở góc nhìn bác sĩ là nơi nhập thuốc.

### Bước 4: Cashier (Thu ngân) - Nhập giá thuốc & Thanh toán

- **Nhiệm vụ**: Tiếp nhận kết quả cuối cùng từ Bác sĩ, nhập thông tin đơn thuốc / dịch vụ phát sinh, in hóa đơn và thu tiền bệnh nhân.
- **Trạng thái hiện tại**: Chưa có luồng rõ ràng, hiện tại có trang `billing.tsx` nhưng cần tuỳ chỉnh cho mô hình Clinic.
- **Cần làm (To-Do)**:
  - Tạo UI cho Cashier trong `billing.tsx` hiển thị danh sách bệnh nhân đang "WaitingForPayment".
  - Chức năng tính phí, in hóa đơn.
  - Sau khi thanh toán xong, trạng thái `PatientVisit` chuyển hẳn sang `Completed` / `Closed`.

## 3. Kiến trúc tham khảo (References)

- **Frontend**: Sửa đổi trực tiếp tại thư mục `src/features/clinic-staff`. Có thể tham khảo code cũ ở thư mục `src/features/organisation` nhưng **KHÔNG ĐƯỢC** thay đổi code của organisation.
- **Backend**: Các truy vấn không cần lọc theo `OrganisationId` vì hệ thống chạy độc lập.

## 4. Lịch trình Triển khai (Next Steps)

1. [x] **Fix lỗi Backend 400 Bad Request**.
2. [x] **Cập nhật nút "Send to Doctor"**: Thêm popup chọn bác sĩ và ghi chú (Frontend).
3. [x] **Thiết lập Realtime SignalR**: Báo notifications qua lại giữa Receptionist -> Coordinator -> Doctor.
4. [x] **Hoàn thiện UI Doctor & Medical Report**: Tạo UI review, nhập đơn thuốc, và lưu kết quả chuyển sang trạng thái `WaitingForPayment`.
5. [x] **Tích hợp Cashier (Billing)**: Hoàn tất thanh toán và chuyển trạng thái `PatientVisit` sang `Completed`.
6. [ ] **Xây dựng module Cashier (Billing)**: Thu ngân nhập tiền thuốc và hoàn tất ca khám.
