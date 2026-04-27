# Hướng dẫn Kiểm thử Quy trình Phòng khám (Digital Clinic Walkthrough)

Tài liệu này cung cấp các bước kiểm thử thủ công cho quy trình khám bệnh khép kín từ khi bệnh nhân đến cho đến khi hoàn tất hồ sơ bệnh án 23/BV-01.

## 1. Chuẩn bị

- Đảm bảo Backend và Frontend đã được build thành công.
- Tài khoản kiểm thử:
  - `clinic_staff@aura.com` (Role: ClinicStaff)
  - `doctor@aura.com` (Role: Ophthalmologist)
  - `patient@aura.com` (Role: Patient)

## 2. Các bước thực hiện

### Bước 1: Tiếp nhận & Check-in

1. Đăng nhập bằng tài khoản **ClinicStaff**.
2. Truy cập trang `Appointment`.
3. Tìm bệnh nhân (đã đặt lịch hoặc tạo mới walk-in).
4. Nhấn **Check-in**.
5. **Kết quả mong đợi**: Bệnh nhân xuất hiện trong trang `Clinic Queue` với trạng thái `CheckedIn`.

### Bước 2: Điền Hồ sơ Hành chính (Chuẩn 23/BV-01)

1. Tại trang `Clinic Queue`, nhấn vào bệnh nhân vừa check-in.
2. Nhấn nút **Fill ERM (Administrative)**.
3. Hệ thống chuyển hướng sang trang `ErmFormPatient.tsx`.
4. Điền các thông tin trong Phần I (Hành chính) và Phần II (Quản lý).
5. Nhấn **Lưu thông tin**.
6. **Kết quả mong đợi**: Thông tin được lưu vào database. Trạng thái chuyển sang `ScreeningPending`.

### Bước 3: Chụp ảnh & AI Screening

1. Tại trang Queue, nhấn **Bắt đầu Sàng lọc AI**.
2. Tải lên ảnh võng mạc (Trái/Phải).
3. Đợi AI xử lý.
4. **Kết quả mong đợi**: Kết quả AI (Risk Level, Findings) hiển thị. Trạng thái chuyển sang `AICompleted`.

### Bước 4: Chuyển Bác sĩ

1. Tại trang Queue, nhấn **Gửi Bác sĩ**.
2. Chọn bác sĩ chuyên khoa trong danh sách.
3. **Kết quả mong đợi**: Trạng thái chuyển sang `SentToDoctor`. Bác sĩ nhận được thông báo.

### Bước 5: Khám Lâm sàng (Bác sĩ)

1. Đăng nhập bằng tài khoản **Bác sĩ (Ophthalmologist)**.
2. Truy cập trang `Screening Review`.
3. Tìm bệnh nhân được chuyển đến và nhấn **Xem chi tiết**.
4. Nhấn nút **Tạo hồ sơ bệnh án** (Thay thế nút Chia sẻ cũ).
5. Hệ thống chuyển hướng sang `ErmForm.tsx`.
6. **Kiểm tra**: Các thông tin Admission Reason và AI Findings phải được tự động điền từ kết quả sàng lọc.
7. Bác sĩ điền tiếp các thông tin chuyên môn tại Phần A (Quá trình bệnh lý, Khám mắt chi tiết).
8. Nhấn **Hoàn tất hồ sơ**.
9. **Kết quả mong đợi**: Hồ sơ được lưu. Trạng thái chuyển sang `Finalized`.

### Bước 6: Kiểm tra từ phía Bệnh nhân

1. Đăng nhập bằng tài khoản **Patient**.
2. Truy cập Dashboard.
3. Nhấn vào mục **Đặt lịch tái khám**.
4. Nhập **CitizenID** hoặc **UserId** để tra cứu.
5. **Kết quả mong đợi**: Hiển thị danh sách các hồ sơ cũ (bao gồm hồ sơ vừa tạo).
6. Chọn hồ sơ và gửi yêu cầu tái khám.

## 3. Tiêu chí Thành công (Definition of Done)

- [ ] Bệnh nhân đi hết quy trình 6 bước không lỗi.
- [ ] Dữ liệu hành chính từ Clinic Staff được bảo toàn khi Bác sĩ mở hồ sơ.
- [ ] Kết quả AI được tự động điền vào Form khám của Bác sĩ.
- [ ] Bệnh nhân tìm thấy hồ sơ của mình để đặt lịch tái khám.
- [ ] Giao diện `ErmFormPatient.tsx` hiển thị đúng chuẩn in ấn 23/BV-01.
- [ ] Giao diện `ErmForm.tsx` của bác sĩ hiện đại, dễ thao tác.
