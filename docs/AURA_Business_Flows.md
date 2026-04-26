# AURA: System for Retinal Vascular Health Screening - Business Flows

## 1. Actor: Patient (Bệnh nhân)

**Description:** Người dùng cuối sử dụng hệ thống để sàng lọc bệnh lý võng mạc, nhận tư vấn và quản lý sức khỏe.

### 1.1 Flow: Authentication & Profile Management

- **Pre-conditions:** Khách (Guest).
- **Main Flow:**
  1. Người dùng chọn đăng ký tài khoản (Register).
  2. Hệ thống gửi mã OTP qua email. Người dùng nhập OTP để xác minh.
  3. Người dùng đăng nhập bằng Email/Password hoặc **OAuth 2.0 (Google)**.
  4. Người dùng cập nhật hồ sơ cá nhân (thông tin liên hệ, ảnh đại diện).
- **Business Rules:** Email là unique. Không thể đổi email/username sau khi đăng ký.

### 1.2 Flow: AI-Based Retinal Screening & Consent Handling

- **Pre-conditions:** Bệnh nhân đã đăng nhập.
- **Main Flow:**
  1. Bệnh nhân chọn "Start New Scan".
  2. Bệnh nhân tải lên tệp hình ảnh võng mạc (Fundus/OCT).
  3. System hiển thị Form Cam kết (Medical Consent): Yêu cầu bệnh nhân đồng ý cho phép AI phân tích hình ảnh và xác nhận quyền riêng tư dữ liệu cho phiên làm việc này.
  4. Bệnh nhân check đồng ý (Agree/Sign): Hệ thống tạo một record trong bảng `Consents` map với `PatientId`.
  5. Bệnh nhân bấm "Start Analysis".
  6. Xử lý Session: Hình ảnh được mã hóa tải lên Cloud Storage (Supabase). System tạo một record `AiScreenings` map với `ConsentId` và `ImageId`, sau đó gọi AI Engine xử lý.
  7. Trả về kết quả: Điểm rủi ro (Risk Score), Bản đồ nhiệt (Heatmaps), và Anomalies.
  8. Bệnh nhân tải xuống báo cáo dưới dạng PDF.
- **Business Rules:** - Bắt buộc phải có `Consent` hợp lệ trước khi gọi AI API.
  - Định dạng hỗ trợ: JPG, PNG, DICOM (Max 50MB). AI trả kết quả trong 30-60s.

### 1.3 Flow: Tele-Consultation Request (Yêu cầu Bác sĩ / Phòng khám tư vấn)

- **Pre-conditions:** Bệnh nhân đã có kết quả AI sàng lọc và có đủ số dư trong Ví (Wallet).
- **Main Flow:**
  1. Từ màn hình kết quả AI, Bệnh nhân chọn "Request Ophthalmologist Review".
  2. Chọn Đối tác: Hệ thống hiển thị danh sách các **Bác sĩ (Ophthalmologists)** đang online/available và các **Phòng khám (Clinics)**. Bệnh nhân có thể xem profile, đánh giá, và giá tiền của từng bác sĩ.
  3. Bệnh nhân **chọn đích danh một Bác sĩ** hoặc một Phòng khám cụ thể.
  4. Hệ thống kiểm tra số dư Ví. Nếu đủ, tiến hành Hold (giữ) hoặc trừ tiền phí tư vấn.
  5. Đẩy yêu cầu vào hàng đợi (Queue) của **chính xác Bác sĩ/Phòng khám** đã được chọn.
  6. Khi Bác sĩ chấp nhận, hệ thống tạo `ConsultationSessions` và mở phòng Chat Real-time.
  7. Bệnh nhân và Bác sĩ trao đổi.
  8. Bác sĩ chốt chẩn đoán, Bệnh nhân nhận Báo cáo chẩn đoán cuối cùng.
- **Exceptions:** - Nếu số dư Ví không đủ -> Chuyển hướng sang Flow Nạp tiền (Top-up).
  - Nếu Bác sĩ từ chối hoặc không phản hồi sau thời gian timeout -> Hoàn tiền (Refund) và yêu cầu bệnh nhân chọn bác sĩ khác.

### 1.4 Flow: Facility Booking & Appointment

- **Main Flow:**
  1. Bệnh nhân tìm kiếm Bác sĩ hoặc Phòng khám/Bệnh viện theo tên, chuyên môn hoặc vị trí.
  2. Chọn cơ sở/Bác sĩ, xem lịch trống (Available Slots).
  3. Đặt lịch khám trực tiếp (Offline) hoặc Online và nhận email xác nhận.

### 1.5 Flow: Wallet Management & Top-up

- **Main Flow:**
  1. Bệnh nhân truy cập "My Wallet" để xem số dư và lịch sử giao dịch.
  2. Chọn "Top-up", nhập số tiền.
  3. Hệ thống chuyển hướng sang cổng thanh toán (VNPay / PayOS).
  4. Thanh toán thành công, cập nhật số dư ví.

---

## 2. Actor: Ophthalmologist (Bác sĩ nhãn khoa)

**Description:** Bác sĩ chuyên khoa thực hiện xác minh kết quả AI, chẩn đoán, và tư vấn từ xa.

### 2.1 Flow: Onboarding & Verification

- **Main Flow:**
  1. Bác sĩ đăng ký tài khoản, tải lên hồ sơ chuyên môn (Bằng cấp, chứng chỉ hành nghề).
  2. Trạng thái tài khoản là `Pending Verification`.
  3. System Admin phê duyệt hồ sơ -> Trạng thái đổi thành `Active`.
  4. Bác sĩ đăng nhập, đọc và ký điện tử Hợp đồng hợp tác (Cooperation Contract).
  5. Bác sĩ cập nhật trạng thái "Available" để nhận ca.

### 2.2 Flow: Diagnostic & Tele-Consultation

- **Pre-conditions:** Bác sĩ đang `Active` và bật trạng thái "Available".
- **Main Flow:**
  1. Bác sĩ xem danh sách các yêu cầu tư vấn gửi đích danh cho mình (Assigned Requests).
  2. Bác sĩ nhấn "Accept" một ca bệnh.
  3. Hệ thống hiển thị: Hình ảnh gốc, Kết quả AI, Heatmaps, `Consent` của bệnh nhân, Lịch sử y tế.
  4. Bác sĩ sử dụng công cụ (Zoom, Pan, Highlight) để đánh giá hình ảnh.
  5. Bác sĩ xác nhận (Confirm) hoặc điều chỉnh kết quả của AI.
  6. Bác sĩ thêm Ghi chú lâm sàng (Clinical Notes) và Lộ trình điều trị.
  7. Nhấn "Send Final Report" để gửi kết quả cho bệnh nhân. Hệ thống tự động lưu Log và tính doanh thu cho Bác sĩ.
- **Business Rules:** - Bác sĩ không được nhận ca mới nếu hàng đợi cá nhân (Personal Queue) đang >= 10 ca (tránh quá tải).

### 2.3 Flow: Professional Network (Thảo luận chuyên môn)

- **Main Flow:**
  1. Bác sĩ chọn một ca lâm sàng thú vị đã điều trị.
  2. Hệ thống **tự động ẩn danh (anonymize)** toàn bộ dữ liệu định danh của bệnh nhân (PII), chỉ giữ lại hình ảnh võng mạc và chẩn đoán y khoa.
  3. Đăng bài lên mạng lưới chuyên môn (Professional Network) để thảo luận với đồng nghiệp.

### 2.4 Flow: Earnings Withdrawal (Rút tiền)

- **Main Flow:** Bác sĩ xem thu nhập trong Ví -> Nhập số tiền -> Nhập OTP xác nhận -> Yêu cầu rút tiền về tài khoản ngân hàng đã liên kết.

---

## 3. Actor: Organization Admin (Phòng khám / Bệnh viện)

**Description:** Quản trị viên đại diện cho tổ chức y tế, quản lý lịch khám và sử dụng AI cho bệnh nhân tại chỗ.

### 3.1 Flow: Organization Activation

- **Main Flow:** Đăng nhập -> Tải lên hợp đồng hợp tác và tài liệu pháp lý -> Chờ System Admin phê duyệt để kích hoạt cơ sở.

### 3.2 Flow: On-site Screening (Tầm soát tại cơ sở)

- **Pre-conditions:** Bệnh nhân đến khám trực tiếp.
- **Main Flow:**
  1. Org Admin hoặc nhân viên tạo hồ sơ bệnh nhân trên hệ thống.
  2. Yêu cầu bệnh nhân ký **Cam kết (Consent) phiên bản vật lý hoặc điện tử tại quầy**.
  3. Nhân viên tải tệp ảnh võng mạc lên hệ thống AURA, map với Consent đã ký.
  4. Gọi AI Screening và nhận kết quả trực tiếp cho bệnh nhân.

### 3.3 Flow: Schedule & Appointment Management

- **Main Flow:** Org Admin tạo các khung giờ trống (Available Slots) cho dịch vụ chụp võng mạc / Bác sĩ của phòng khám -> Bệnh nhân trên app sẽ nhìn thấy các slot này để đặt lịch.

### 3.4 Flow: Billing & Payment (Thanh toán phí dịch vụ AI)

- **Main Flow:** Xem Báo cáo chi phí (Monthly Billing Summary) -> Thanh toán qua cổng thanh toán -> Xuất báo cáo lịch sử giao dịch ra file Excel.

---

## 4. Actor: System Admin (Quản trị viên hệ thống)

**Description:** Super-user quản lý nền tảng.

### 4.1 Flow: Partner Verification (Duyệt đối tác)

- **Main Flow:** Xem danh sách `Pending` -> Xem xét chứng chỉ -> Kích hoạt (Approve) hoặc Từ chối (Reject).

### 4.2 Flow: Platform Configuration & Monitoring

- **Main Flow:** Cấu hình tỷ lệ hoa hồng -> Giám sát AI (Accuracy, Inference Time) -> Quản lý phân quyền (RBAC) -> Xem Audit Logs.

---

## 5. Global Technical Constraints (Dành cho AI Coder)

- **Architecure:** Clean Architecture (API, Application, Domain, Infrastructure).
- **Database:** PostgreSQL (Core) + MongoDB (Logs/Chats).
- **Data Privacy (Consent):** - Bảng `Consents` (Id, PatientId, SessionId, AgreedAt, Status, IPAddress).
  - Bảng `AiScreenings` bắt buộc phải có khóa ngoại tham chiếu đến `ConsentId`.
- **Storage:** Cloud object storage (Cloudinary / AWS S3) cho file hình ảnh. File được generate link tạm thời (Presigned URL) theo session.
- **Audit Logs:** Immutable, lưu dạng JSONB (chỉ dùng soft-delete `IsDeleted = true`).
- **Security:** Dữ liệu PII & PHI phải được mã hóa end-to-end.
