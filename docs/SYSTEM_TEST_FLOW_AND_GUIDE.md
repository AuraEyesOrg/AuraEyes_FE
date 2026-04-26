# AURA System Test Flow and Guide

## 1. Muc tieu

Tai lieu nay gom nhat thiet ke Kien truc E2E Test (Playwright) va Test Plan cho 5 luong cot loi cua AURA, dong thoi mo ta phan hien thuc backend de chay test theo triet ly:

- Moi truong test doc lap (ASPNETCORE_ENVIRONMENT=Test)
- Mock toan bo external services (Email, Payment, AI model)
- Locator resilient (user-facing locators, khong dung CSS class)
- Hybrid AAA (Arrange/Assert qua Backdoor API, Act qua UI)

## 2. Phan da hien thuc trong code

### 2.1 Test Environment

Da them profile Test trong launch settings:

- File: src/API/Properties/launchSettings.json
- Profile: Test
- Port: https://localhost:5101;http://localhost:5100
- ASPNETCORE_ENVIRONMENT=Test

Da them appsettings cho Test:

- File: src/API/appsettings.Test.json
- Connection string DB test rieng
- Tat Hangfire worker trong test
- Them key bao ve backdoor: Testing:BackdoorKey

### 2.2 Mock External Services

Da them test doubles:

- FakeEmailService (khong goi SMTP that)
- FakePayOSService (khong goi gateway that, quan ly trang thai payment trong memory)

Da wire vao Program chi khi environment la Test:

- IEmailService -> FakeEmailService
- IPayOSService -> FakePayOSService

### 2.3 TestBackdoorController

Da them controller:

- Route base: /api/test-backdoor
- Chi cho phep khi ENV=Test
- Bat buoc header: X-Test-Key = Testing:BackdoorKey

Endpoints da co:

- POST /api/test-backdoor/reset-and-seed
- GET /api/test-backdoor/email/verify-token?email=
- POST /api/test-backdoor/email/confirm
- POST /api/test-backdoor/payments/mark-success
- POST /api/test-backdoor/payments/verify
- POST /api/test-backdoor/screenings/complete-mock-ai

## 3. Cach chay nhanh

### 3.1 Run backend o mode Test

- Chon launch profile Test trong src/API/Properties/launchSettings.json
- Dam bao DB test ton tai va truy cap duoc

### 3.2 Header bat buoc cho backdoor

Tat ca request den /api/test-backdoor phai co:

- Header: X-Test-Key: <gia tri Testing:BackdoorKey trong appsettings.Test.json>

### 3.3 Luong setup chuan cho moi E2E suite

1. Goi reset-and-seed
2. Goi email/confirm hoac email/verify-token tuy test case
3. Setup payment state qua payments/mark-success (neu can)
4. Setup AI result qua screenings/complete-mock-ai (neu can)

## 4. Locator Policy cho Playwright

Bat buoc su dung:

- getByRole
- getByLabel
- getByPlaceholder
- getByText
- data-testid (neu can bo sung)

Khong duoc dung:

- CSS class selectors nhu .btn, .input-group, .xyz

## 5. Hybrid AAA Pattern

### Arrange (Backdoor API)

- reset data
- seed du lieu role/user/slot/contract
- bypass email
- mock payment state
- mock AI completion

### Act (UI only)

- thao tac trang web dung locators user-facing

### Assert (Backdoor/API + UI)

- assert business state qua endpoint/domain data
- assert UI state (toast, badge, status)
- assert notification realtime

## 6. Test Plan theo 7 luong cot loi

## 6.1 Flow 01 - Ophthalmologist Onboarding and Verification

Flow:

- Register doctor -> Upload credentials -> Email confirm bypass -> Admin approve/reject verification -> Doctor access control check

Pham vi kiem thu:

- Happy Path: submit onboarding thanh cong, admin approve
- Negative Path: missing required fields, invalid file upload
- Alternative Path: admin reject onboarding va hien ly do tu choi
- Security Boundary: doctor chua duoc verify truy cap /ophthalmologist/dashboard bi chan

## 6.2 Flow 02 - Organisation Onboarding and Contract Activation

Flow:

- Approve organisation onboarding -> Upload signed contract -> Admin verify/reject contract -> Gate contract truoc khi vao core route

Pham vi kiem thu:

- Happy Path: onboarding approved + contract verified
- Negative Path: contract file khong hop le/empty
- Alternative Path: admin reject contract, org admin phai upload lai
- Security Boundary: contract chua active truy cap /organisation/dashboard, /organisation/patients, /organisation/settings bi redirect ve /organisation/contract

## 6.3 Flow 03 - AI Screening, Appointment Booking, and Consultation Session

Flow:

- Patient dashboard -> New screening -> AI analysis -> Review/Roadmap -> Request specialist -> Booking -> Consultation session

Pham vi kiem thu:

- Happy Path: full route screening -> booking -> consultation
- Negative Path: wallet khong du, booking bi chan
- Alternative Path: user huy payment tren gateway test va quay lai booking
- Security Boundary: role khong hop le khong duoc vao route consultation cua role khac

## 6.4 Flow 04 - Organisation Slot Booking and Offline Appointment

Flow:

- Patient mo /patient/clinics -> Chon organisation slot -> Dat lich offline -> Xac minh trong /patient/appointments

Pham vi kiem thu:

- Happy Path: dat lich offline thanh cong
- Negative Path: slot het cho, reason bi bo trong
- Alternative Path: huy lich hen va cap nhat suc chua slot
- Security Boundary: chi patient role moi thao tac booking o clinics route

## 6.5 Flow 05 - AI Quota Purchase for Screening Service

Flow:

- Out-of-quota gate -> Top-up wallet -> Mock payment -> Verify payment -> Buy quota -> Re-screening

Pham vi kiem thu:

- Happy Path: nap tien va mua quota thanh cong
- Negative Path: payment fail/cancel khong cong wallet
- Alternative Path: tiep tuc mua goi quota khac sau top-up
- Security Boundary: test-backdoor API bat buoc X-Test-Key, request sai key tra 401/403

## 6.6 Flow 06 - Profile Management

Flow:

- Patient login -> vao /patient/profile -> cap nhat thong tin ca nhan/avatar -> doi mat khau

Pham vi kiem thu:

- Happy Path: cap nhat profile thanh cong (name/phone/avatar)
- Negative Path: doi mat khau voi current password sai hoac du lieu khong hop le

Route chinh:

- /patient/profile
- /patient/settings

## 6.7 Flow 07 - Professional Network Collaboration

Flow:

- Doctor/Organisation vao /network/feed -> tao bai theo category -> like/comment -> notification

Pham vi kiem thu:

- Happy Path: tao bai CasePresentation/Announcement/KnowledgeShare thanh cong
- Negative Path: submit bai voi content rong bi chan
- Alternative Path: tuong tac like/comment va xac minh cap nhat notification/feed
- Security Boundary: Patient co gang vao /network/feed bi redirect ve trang home

Route chinh:

- /network
- /network/feed
- /network/post/:id

## 7. Goi y skeleton Playwright suite

- test.beforeEach:
  - call reset-and-seed
  - login state theo role
- helper api client:
  - inject X-Test-Key
- page object:
  - chi user-facing locators
- assert:
  - db/business state qua backdoor
  - ui state qua expect

## 8. Luu y van hanh

- Khong su dung external service that trong test run
- Moi test case can du lieu doc lap, deterministic
- Neu test realtime flaky, uu tien assert event + poll co timeout ngan
- Khuyen nghi pipeline CI chay profile Test + DB test rieng
