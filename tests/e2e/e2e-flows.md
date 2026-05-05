# AURA E2E Flow Mapping (UI-first)

## Scope

This document maps the remaining E2E business flows to concrete frontend routes and stable UI selectors found in the current React codebase.

## Flow 2: Patient AI Screening + Quota/Wallet Deduction

- Entry route: /patient/screening
- New screening route: /patient/screening/new
- AI analyze route: /patient/screening/analyze
- Wallet route: /patient/wallet

Key selectors:

- Start new scan button: role=button, name="New Screening" (screening page)
- Upload file input: input[type="file"] on /patient/screening/new
- Continue from upload: role=button, name="Start AI Analysis"
- Start analyze action: role=button, name="Start Screening" on /patient/screening/analyze
- Result summary heading: text "Your Retinal Health Summary"
- Result CTA: role=button, name="Continue to Review"
- Wallet balance label: text "Available Balance"

Notes:

- No explicit consent checkbox is present in current /patient/screening/new or /patient/screening/analyze UI.
- The analysis page deducts quota before calling AI endpoint. For E2E determinism, AI processing can be mocked via DB/backdoor arrangement.

## Flow 3: Patient Appointment Booking and Consultation Session

- Default route after patient login: /patient/dashboard
- New scan route: /patient/screening/new
- Analysis route: /patient/analysis
- Review route: /patient/screening/review
- Personal roadmap route: /patient/roadmap
- Doctors list route: /patient/doctors
- Booking route: /patient/book?doctorId=<id>
- Booking confirmation route: /patient/book/confirm
- Doctor appointment list route: /ophthalmologist/appointments
- Doctor consultation room route: /ophthalmologist/consultations

Key selectors:

- Dashboard new scan entry: role=link, name="Upload New Scan" or "Upload Your First Scan"
- Start analysis action: role=button, name="Start AI Analysis"
- AI execution action: role=button, name="Start Screening"
- Continue review action: role=button, name="Continue to Review"
- Review page specialist action: role=button, name="Find a Specialist"
- Roadmap heading: role=heading, name="Health Improvement Roadmap"
- Search doctor input: placeholder="Search by doctor name, email or bio..."
- View slots action: role=button, name="View Slots" (doctor card)
- Slot button: role=button with time text (e.g. 09:00 / 10:30) in booking week grid
- Reserve modal confirm: role=button, name="Confirm Booking"
- Checkout action: role=button, name="Confirm & Pay"
- Booking success heading: role=heading, name="Booking Confirmed!"
- Doctor open consultation action: link name="Open" on /ophthalmologist/appointments

Notes:

- Screening new page uses local image quality simulation; test should retry when warning state "Blur Detected" appears.
- External gateway (VNPay/PayOS) can be bypassed by DB status updates for consultation/payment entities.

## Flow 4: Organization Registration -> Admin Approval -> Org Slot Management

- Public org register route: /register-organisation
- Admin approval route: /system-admin/organisations
- Org slot management route: /organisation/slots

Key selectors:

- Submit org onboarding: role=button, name="Gửi đăng ký tổ chức"
- Register success text: text "Đã ghi nhận đăng ký"
- Admin onboarding panel heading: text "Organisation Onboarding Requests"
- Approve onboarding action: role=button, name="Xác nhận & cấp tài khoản"
- Create template action: role=button, name="Create template"
- Generate slots action: role=button, name="Generate slots"
- Success banners: text contains "Template created successfully." / "Generated"

Notes:

- Org admin temporary password is returned by the approval response payload; E2E can capture it from the UI-triggered network response and then perform real UI login.

## Flow 5: Patient Books Offline Clinic

- Offline clinic route: /patient/clinics

Key selectors:

- Organisation search input: placeholder="Search organisation by name, city, or address"
- Organisation card selection: card button with organisation name text
- Visit date input: input[type="date"]
- Visit reason input: placeholder="Blurred vision, routine follow-up..."
- Slot action: role=button, name="Book Clinic Visit"
- Success banner text: "Đặt lịch thành công. Vui lòng theo dõi trạng thái ở Appointments."

Notes:

- Offline booking does not require online payment; only slot availability and appointment creation are required.

npx playwright test tests/e2e/specs/03-patient-screening-and-consultation-session.spec.ts --debug
