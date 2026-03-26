# AURA React FE Project Structure Map

**Project:** Aura Retinal Health Screening Platform  
**Location:** `d:\ki9-lastdancefpt\Aura\FE\AURA-FE\src`  
**Router Config:** [src/routes/index.tsx](src/routes/index.tsx)  
**Date Generated:** March 20, 2026

---

## Table of Contents

1. [Complete Route Map](#complete-route-map)
2. [Page Structure & Components](#page-structure--components)
3. [Key Form Fields & Data-TestIDs](#key-form-fields--data-testids)
4. [reCAPTCHA Integration](#recaptcha-integration)
5. [URL Redirect Patterns](#url-redirect-patterns)
6. [Component Hierarchy](#component-hierarchy)

---

## Complete Route Map

### Guest/Public Routes (No Auth Required)

| Route           | Page Component    | File Path                            | Purpose                 |
| --------------- | ----------------- | ------------------------------------ | ----------------------- |
| `/`             | HomePage          | `features/guest/pages/Home`          | Landing page            |
| `/about`        | AboutPage         | `features/guest/pages/About`         | About AURA              |
| `/how-it-works` | HowItWorksPage    | `features/guest/pages/HowItWorks`    | Platform tutorial       |
| `/contact`      | ContactPage       | `features/guest/pages/Contact`       | Contact form            |
| `/ethics`       | EthicsPrivacyPage | `features/guest/pages/EthicsPrivacy` | Ethics & privacy policy |
| `/status`       | StatusPage        | `features/guest/pages/Status`        | System status           |
| `/compliance`   | CompliancePage    | `features/guest/pages/Compliance`    | Compliance information  |

### Authentication Routes

| Route                    | Page Component           | File Path                                   | Features                                                      |
| ------------------------ | ------------------------ | ------------------------------------------- | ------------------------------------------------------------- |
| `/login`                 | LoginPage                | `features/auth/pages/login`                 | **✅ Has reCAPTCHA** - Email/password + social login (Google) |
| `/forgot-password`       | ForgotPasswordPage       | `features/auth/pages/forgot-password`       | Password recovery                                             |
| `/reset-password`        | ResetPasswordPage        | `features/auth/pages/reset-password`        | Password reset                                                |
| `/register-doctor`       | RegisterDoctorPage       | `features/auth/pages/register-doctor`       | Doctor/ophthalmologist signup                                 |
| `/register-organisation` | RegisterOrganisationPage | `features/auth/pages/register-organisation` | Clinic/hospital registration                                  |
| `/confirm-email`         | ConfirmEmailPage         | `features/auth/pages/confirm-email`         | Email verification                                            |
| `/two-factor-auth`       | TwoFactorSettingsPage    | `features/auth/pages/two-factor-settings`   | 2FA setup                                                     |
| `/two-factor-verify`     | TwoFactorVerifyPage      | `features/auth/pages/two-factor-verify`     | 2FA verification during login                                 |
| `/pending-approval`      | PendingApprovalPage      | `features/auth/pages/pending-approval`      | Waiting for admin approval                                    |

### Patient Routes

| Route                              | Page Component          | File Path                                     | Key Features                                                              |
| ---------------------------------- | ----------------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| `/patient/dashboard`               | PatientDashboard        | `features/patient/pages/dashboard`            | Main patient hub                                                          |
| `/patient/screening`               | ScreeningPage           | `features/patient/pages/screening`            | View past screenings                                                      |
| `/patient/screening/new`           | ScreeningNewPage        | `features/patient/pages/screening-new`        | **Upload retinal images** - drag/drop, clipboard paste, file validation   |
| `/patient/screening/analyze`       | RetinalAnalysisPage     | `features/patient/pages/retinal-analysis`     | **AI analysis results** - anomaly visualization, lesion mapping           |
| `/patient/screening/review`        | ReviewPage              | `features/patient/pages/review`               | Review AI findings before sharing                                         |
| `/patient/reports`                 | ReportsPage             | `features/patient/pages/reports`              | Historical screening reports                                              |
| `/patient/appointments`            | AppointmentsPage        | `features/patient/pages/appointments`         | View booked appointments                                                  |
| `/patient/book`                    | BookAppointmentPage     | `features/patient/pages/book-appointment`     | **Book online consultation** - search doctors, view slots, reserve        |
| `/patient/book/confirm`            | BookingConfirmationPage | `features/patient/pages/booking-confirmation` | **Final booking confirmation** - share images/AI results, countdown timer |
| `/patient/profile`                 | ProfilePage             | `features/patient/pages/profile`              | Patient profile management                                                |
| `/patient/settings`                | SettingsPage            | `features/patient/pages/settings`             | Account settings                                                          |
| `/patient/clinics`                 | ClinicsPage             | `features/patient/pages/clinics`              | **Offline clinic booking** - search orgs, select date/slot                |
| `/patient/doctors`                 | DoctorsPage             | `features/patient/pages/doctors`              | **Search ophthalmologists** - find doctor, view availability              |
| `/patient/roadmap`                 | RoadmapPage             | `features/patient/pages/roadmap`              | Treatment roadmap                                                         |
| `/patient/chat`                    | ChatPage                | `features/patient/pages/chat`                 | Chat with doctors                                                         |
| `/patient/wallet`                  | WalletPage              | `features/patient/pages/wallet`               | **Wallet & quota** - balance, transactions, top-up                        |
| `/patient/wallet/payment-callback` | PaymentCallbackPage     | `features/patient/pages/payment-callback`     | Payment gateway callback                                                  |
| `/patient/help-feedback`           | HelpFeedbackPage        | `features/patient/pages/help-feedback`        | Support & feedback                                                        |
| `/patient/notifications`           | NotificationsPage       | `features/patient/pages/notifications`        | Notification center                                                       |
| `/notifications`                   | NotificationsPage       | `features/patient/pages/notifications`        | Alias for notifications                                                   |
| `/patient/security`                | TwoFactorSettingsPage   | `features/auth/pages/two-factor-settings`     | 2FA management                                                            |

### Organisation (Clinic) Routes

| Route                     | Page Component                 | File Path                                     | Access  | Key Features                                                   |
| ------------------------- | ------------------------------ | --------------------------------------------- | ------- | -------------------------------------------------------------- |
| `/organisation/dashboard` | OrganisationDashboard          | `features/organisation/pages/dashboard`       | Private | Main dashboard                                                 |
| `/organisation/patients`  | OrganisationPatientsPage       | `features/organisation/pages/patients`        | Private | Manage patients                                                |
| `/organisation/analytics` | OrganisationAnalyticsPage      | `features/organisation/pages/analytics`       | Private | Usage analytics                                                |
| `/organisation/calendar`  | OrganisationCalendarPage       | `features/organisation/pages/calendar`        | Private | Appointment calendar                                           |
| `/organisation/slots`     | OrganisationSlotManagementPage | `features/organisation/pages/slot-management` | Private | Manage clinic slots                                            |
| `/organisation/contract`  | OrganisationContractPage       | `features/organisation/pages/contract`        | Private | **Contract upload** - drag/drop, file preview, status tracking |
| `/organisation/settings`  | OrganisationSettingsPage       | `features/organisation/pages/settings`        | Private | Organization settings                                          |

### Ophthalmologist (Doctor) Routes

| Route                                             | Page Component                     | File Path                                         | Access  | Key Features                                           |
| ------------------------------------------------- | ---------------------------------- | ------------------------------------------------- | ------- | ------------------------------------------------------ |
| `/ophthalmologist/dashboard`                      | OphthalmologistDashboard           | `features/ophthalmologist/pages/dashboard`        | Private | Main dashboard                                         |
| `/ophthalmologist/patients`                       | OphthalmologistPatientsPage        | `features/ophthalmologist/pages/patients`         | Private | Manage patients                                        |
| `/ophthalmologist/screenings`                     | OphthalmologistScreeningsPage      | `features/ophthalmologist/pages/screenings`       | Private | View screenings                                        |
| `/ophthalmologist/analytics`                      | OphthalmologistAnalyticsPage       | `features/ophthalmologist/pages/analytics`        | Private | Analytics dashboard                                    |
| `/ophthalmologist/appointments`                   | OphthalmologistAppointmentsPage    | `features/ophthalmologist/pages/appointments`     | Private | **View appointments** - status, actions                |
| `/ophthalmologist/settings`                       | OphthalmologistSettingsPage        | `features/ophthalmologist/pages/settings`         | Private | Settings                                               |
| `/ophthalmologist/consultations`                  | ConsultationsPage                  | `features/ophthalmologist/pages/consultations`    | Private | **Active consultations** - chat room access            |
| `/ophthalmologist/screenings/:screeningId/review` | OphthalmologistScreeningReviewPage | `features/ophthalmologist/pages/screening-review` | Private | Review screening details                               |
| `/ophthalmologist/schedules`                      | OphthalmologistSlotManagementPage  | `features/ophthalmologist/pages/slot-management`  | Private | Manage schedules                                       |
| `/ophthalmologist/slot-management`                | OphthalmologistSlotManagementPage  | `features/ophthalmologist/pages/slot-management`  | Private | Alias for schedules                                    |
| `/ophthalmologist/contract`                       | OphthalmologistContractPage        | `features/ophthalmologist/pages/contract`         | Private | **Contract management** - template view, upload signed |

### System Admin Routes

| Route                                       | Page Component                    | File Path                                              | Purpose                                                                   |
| ------------------------------------------- | --------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `/system-admin/dashboard`                   | SystemAdminDashboard              | `features/system-admin/pages/dashboard`                | Central admin hub                                                         |
| `/system-admin/organisations`               | SystemAdminOrganisations          | `features/system-admin/pages/organisations`            | **Org approval & management** - approve/reject onboarding, view contracts |
| `/system-admin/patients`                    | SystemAdminPatients               | `features/system-admin/pages/patients`                 | Manage patients                                                           |
| `/system-admin/ophthalmologists`            | SystemAdminOphthalmologists       | `features/system-admin/pages/ophthalmologists`         | **Doctor verification** - approve/reject verification with reason         |
| `/system-admin/verifications`               | SystemAdminVerificationRequests   | `features/system-admin/pages/verification-requests`    | Verification request queue                                                |
| `/system-admin/users`                       | SystemAdminUsers                  | `features/system-admin/pages/users`                    | User management                                                           |
| `/system-admin/ai-models`                   | SystemAdminAIModels               | `features/system-admin/pages/ai-models`                | AI model monitoring                                                       |
| `/system-admin/audit-logs`                  | SystemAdminAuditLogs              | `features/system-admin/pages/audit-logs`               | Audit trail                                                               |
| `/system-admin/settings`                    | SystemAdminSettings               | `features/system-admin/pages/settings`                 | System configuration                                                      |
| `/system-admin/permissions`                 | SystemAdminPermissions            | `features/system-admin/pages/permissions`              | Role & permission management                                              |
| `/system-admin/contract-templates`          | SystemAdminContractTemplates      | `features/system-admin/pages/contract-templates`       | Contract template library                                                 |
| `/system-admin/contract-templates/new`      | SystemAdminContractTemplateEditor | `features/system-admin/pages/contract-template-editor` | Create new template                                                       |
| `/system-admin/contract-templates/:id/edit` | SystemAdminContractTemplateEditor | `features/system-admin/pages/contract-template-editor` | Edit existing template                                                    |
| `/system-admin/contracts`                   | SystemAdminContracts              | `features/system-admin/pages/contracts`                | View/manage all contracts                                                 |

### Professional Network Routes (Optional Feature)

| Route                       | Page Component          | File Path                                                        | Purpose                |
| --------------------------- | ----------------------- | ---------------------------------------------------------------- | ---------------------- |
| `/network`                  | NetworkLayout           | `features/professional-network/components/layouts/NetworkLayout` | Base layout            |
| `/network/feed`             | NetworkFeedPage         | `features/professional-network/pages/FeedPage`                   | Social feed            |
| `/network/discover`         | NetworkDiscoverPage     | `features/professional-network/pages/DiscoverPage`               | Discover posts         |
| `/network/saved`            | NetworkSavedPage        | `features/professional-network/pages/SavedPage`                  | Saved posts            |
| `/network/post/:id`         | NetworkPostDetailPage   | `features/professional-network/pages/PostDetailPage`             | Post detail & comments |
| `/network/profile/:id`      | NetworkProfilePage      | `features/professional-network/pages/ProfilePage`                | User profile           |
| `/network/organisation/:id` | NetworkOrganisationPage | `features/professional-network/pages/OrganisationPage`           | Organization profile   |

---

## Page Structure & Components

### 1. Authentication Pages

#### `/login` - LoginPage

**File:** `src/features/auth/pages/login.tsx`

**Form Fields:**

- Email input: `#login-email`
- Password input: `#login-password`
- Show/hide password toggle
- Signup mode toggle link

**Key Elements:**

- **reCAPTCHA iframe** with site key from `VITE_RECAPTCHA_SITE_KEY`
- Google OAuth login button
- "Secure Sign In" or "Signing In" button text

**Features:**

- Dual mode: Login + Register in same page
- 2FA detection on login
- Error handling with reCAPTCHA reset on error

**Code Reference:**

```typescript
// reCAPTCHA setup
const recaptchaRef = useRef<ReCAPTCHA>(null);
const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

// Validation in onLoginSubmit
if (!recaptchaToken) {
  setError('Please complete the reCAPTCHA verification.');
  return;
}
```

#### `/register-organisation` - RegisterOrganisationPage

**File:** `src/features/auth/pages/register-organisation.tsx`

**Form Fields (React Hook Form):**

1. `organisationName` - text input
   - Placeholder: "Aura Eye Clinic"
   - Validation: Required
   - Icon: Building2

2. `orgType` - select dropdown
   - Options: "Clinic" (value: "2"), "Hospital" (value: "1")
   - Default: "2"
   - Validation: Required

3. `contactFullName` - text input
   - Placeholder: "Nguyen Van A"
   - Validation: Required
   - Icon: User

4. `contactEmail` - email input
   - Placeholder: "admin@clinic.vn"
   - Validation: Required
   - Icon: Mail

5. `contactPhone` - phone input
   - Placeholder: "0909123456"
   - Icon: Phone
   - Optional

6. `licenseNumber` - text input
   - Placeholder: "GP-2026-001"
   - Icon: FileText
   - Optional

7. `address` - text input
   - Placeholder: "123 Nguyen Hue, Ho Chi Minh City"
   - Icon: MapPin
   - Optional

8. `notes` - textarea
   - Placeholder: "Nhu cầu triển khai, số lượng bác sĩ, yêu cầu hợp tác..."
   - 4 rows
   - Optional

**Submission Button:**

- Text changes: "Gửi đăng ký tổ chức" (normal) → "Đang gửi..." (submitting)
- Disabled during submission

**Success Response:**

- Shows confirmation page with submitted email
- Links to `/login` and `/`

---

### 2. Patient Pages

#### `/patient/screening/new` - ScreeningNewPage

**File:** `src/features/patient/pages/screening-new.tsx`

**Image Upload Features:**

- **Drag & drop zone** - accepts images + `.dcm` files
- **File input** - select multiple images
- **Clipboard paste** - paste images copied to clipboard
- **Supported formats:** JPEG, PNG, WebP, DCM
- **Max file size:** 10MB
- **Duplicate detection** - prevents re-uploading same file

**Upload Validation Process:**

1. Uploading state (progress bar 0→100%)
2. Validating state
3. Final status: `ready`, `warning`, or `error`
4. Quality levels: `high`, `medium`, `low`

**UI Elements:**

- Upload progress indicator
- File preview (image thumbnail)
- File name and size display
- Delete button (X) for individual uploads
- Status messages for warnings/errors

#### `/patient/book` - BookAppointmentPage

**File:** `src/features/patient/pages/book-appointment.tsx`

**Search & Filtering:**

- Doctor search input
- Date selector (week navigation)
- Slot time display

**Appointment Slot Features:**

- **Slot Status Colors:**
  - Available: emerald (clickable)
  - Reserved: amber (reserved by someone else)
  - Booked: blue (already booked)
  - Blocked: gray (unavailable)
  - Expired: grayed out
- **Reservation Modal:**
  - 5-minute countdown timer
  - "Confirm Booking" button
  - "Cancel" button
  - Timer urgency colors: green (>120s) → amber (60-120s) → red (<60s)

**Doctor Card Display:**

- Avatar image with fallback
- Full name, email
- Years of experience
- Rating (stars)
- Certificate count

**Buttons:**

- "View Slots" → navigates to `/patient/book`
- "Confirm Booking" → modal confirmation
- "Book Now" → reserves slot temporarily

#### `/patient/book/confirm` - BookingConfirmationPage

**File:** `src/features/patient/pages/booking-confirmation.tsx`

**Shared Data Options:**

- Checkbox: "Share retinal images with doctor"
- Checkbox: "Share AI analysis results with doctor"

**Confirmation Elements:**

- Appointment details display
- Reserve countdown timer
- **"Confirm & Pay" button** → completes booking, creates consultation session
- "Cancel Booking" button → releases reservation

**Session Storage:**

- Stores `slotId` in `sessionStorage['patient-booking-confirm-context']`
- Uses query param fallback: `?slotId=xxx`

#### `/patient/clinics` - ClinicsPage

**File:** `src/features/patient/pages/clinics.tsx`

**Search & Filters:**

- **Search Input:**
  - Placeholder: "Search organisation by name, city, or address"
  - Left-aligned Search icon
  - Real-time filtering

- **Organisation Selection:**
  - Grid layout (1 col mobile, 2 cols tablet+)
  - Selected state: `border-cyan-500 bg-cyan-50`
  - Shows: name, type badge, star rating, address with icon

- **Additional Filters:**
  - Date picker (defaults to today)
  - Visit reason textarea

- **Action Button:**
  - "Book Slot" for each available clinic slot
  - Slot time display (09:00, 10:00, etc.)

**Slot Selection:**

- Shows available slots after date + org selection
- Status message on book success/error

#### `/patient/doctors` - DoctorsPage

**File:** `src/features/patient/pages/doctors.tsx`

**Search:**

- Placeholder: "Search by doctor name, email or bio..."
- Live results (20 results per page)

**Doctor Card Layout (2-column grid):**

- **Avatar:** Circular image with fallback (uses `VITE_AVATAR_FALLBACK_URL`)
- **Name & Email:** Large name, small email
- **Verified Badge:** Green "Verified" indicator
- **Years of Experience:** "X yrs exp"
- **Bio:** Line-clamped (2 lines)
- **Certificate Count:** "N certificate(s)"
- **Rating & Review Count:** Star + number

**Slot Display (After doctor selected):**

- Grouped by date
- Format: "Mon, Mar 20" for date header
- Slot times listed: "09:00", "10:00", etc.
- Expired slots grayed out
- "Book Slot" button for each time

#### `/patient/wallet` - WalletPage

**File:** `src/features/patient/pages/wallet.tsx`

**Wallet Display:**

- **Balance Card:**
  - Current wallet balance (large number)
  - Formatted as Vietnamese VND: "1,200,000đ"
  - Monthly stats: total deposits, total spent, transaction count

- **Preset Deposit Buttons:**
  - Amounts: 100k, 200k, 500k, 1M, 2M, 5M VND
  - Or custom amount input

**Payment Methods:**

- PayOS gateway
- VNPay gateway
- Selection radio buttons or toggle

**Transaction History Table:**

- Transaction type icon (color-coded)
- Amount with +/- indicator
- Date/time
- Status
- Pagination (10 per page)

**Transaction Icons:**

- Deposit/Bonus: ↓ green
- Payment/Withdrawal: ↑ red
- Refund: ↻ blue

**Modal: TopUpQuotaModal**

- Shows bundle info: "5 lượt — 50,000đ"
- Purchase button shows price
- Success message with countdown close (1.5s)
- Close button (X)

---

### 3. Contract Pages

#### `/organisation/contract` - OrganisationContractPage

**File:** `src/features/organisation/pages/contract.tsx`

**Upload Zone (Drag & Drop):**

- **Accepted formats:** JPEG, PNG, WebP, PDF
- **Max size:** 10MB
- **File preview:** Image thumbnail or PDF icon + filename + size
- **Status indicators:**
  - Uploading: progress bar
  - Ready to upload: button "Upload Contract"
  - Already uploaded: shows preview image or PDF indicator

**Contract Status Display:**

- Status badge with color: `text-blue-600 bg-blue-50` (pending admin review)
- Status text: "Đã upload - Chờ admin duyệt"
- Status icon: Clock (blue)
- Actions: "Mở file gốc" (external link), "Upload lại" (re-upload)

**Template Download:**

- "Download Template" button
- File naming: `organisation-contract-{contractNumber}.{ext}`

**API Mutation:**

- Upload endpoint: `organisationContractApi.uploadSignedContract(file)`

#### `/ophthalmologist/contract` - OphthalmologistContractPage

**File:** `src/features/ophthalmologist/pages/contract.tsx`

**Similar to organisation contract:**

- Drag & drop upload zone
- File preview (image or PDF)
- Status indicator with color/icon
- "Mở file gốc" and "Upload lại" buttons
- Template preview/download

**Status Messages:**

- Pending Signature: "Chờ ký hợp đồng" (amber badge)
- Uploaded & Pending Admin Review: "Đã upload — Chờ admin duyệt" (blue badge)
- Active: "Đang hiệu lực" (emerald badge)
- Draft: "Nháp" (slate badge)

---

### 4. System Admin Pages

#### `/system-admin/organisations` - OrganisationsPage

**File:** `src/features/system-admin/pages/organisations.tsx`

**Onboarding Requests Section:**

- **List of pending requests** with approval workflow
- **Request Card Shows:**
  - Organization name
  - Contact email & phone
  - Org type (Clinic/Hospital)
  - Status: "Pending"
  - **Approve Button:** Green button, action handler `handleApproveOnboarding(requestId)`
  - **Reject Button:** Red button (likely similar handler)

**Approval Result Display:**

- Shows success message with credentials issued:
  - Generated email/password
  - Confirmation status

**Organisations Table Columns:**

- Organization name + type (small badge)
- Location
- Users count (badge)
- AI Screenings count
- Contract status (badge with color)
- Status (active/inactive/suspended)
- Actions: View Details eye icon, More menu (MoreVertical)

**Stats Cards:**

- Active Organisations count
- Monthly Revenue (formatted currency)
- Pending Payments
- Total Screenings
- Organisation Users

#### `/system-admin/ophthalmologists` - OphthalmologistVerificationPage

**File:** `src/features/system-admin/pages/ophthalmologists.tsx`

**Ophthalmologist List Table:**

- **Verification Status Badges:**
  - "PendingVerification": amber/warning
  - "Approved": green/success "Verified"
  - "Rejected": red/error "Rejected"

**Action Buttons (Per Row):**

- **"Approve Verification"** button (title tooltip)
  - Calls `approveOphtHandle(row.id)`
- **"Reject Verification"** button (title tooltip)
  - Calls `handleRejectClick(row)`
  - Opens reject modal below

**Reject Modal (Conditional Render):**

- **Shows when:** `rejectingDoctor` state is set
- **Fields:**
  - Reason textarea with placeholder:
    ```
    "Mô tả rõ lý do từ chối (ví dụ: ảnh giấy phép không rõ nét,
     chứng chỉ chưa có hiệu lực, thiếu bằng cấp chuyên ngành...)"
    ```
  - Error display: `rejectError` state
  - Submitting state: `rejectSubmitting` boolean

- **Buttons:**
  - "Cancel" button: `handleRejectCancel()` → clears modal
  - "Reject" button: `handleRejectSubmit()`
    - Calls: `ophthalmologistApi.rejectVerification(doctorId, reason)`
    - Updates table after success

**Search & Filter:**

- Placeholder: "Search by name, email, or ID..."
- Pagination controls

---

### 5. Other Key Components

#### TopUpQuotaModal Component

**File:** `src/features/patient/components/TopUpQuotaModal.tsx`

**Props:**

```typescript
interface TopUpQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuota: QuotaBalance;
}
```

**Features:**

- Modal overlay with backdrop blur
- **Header:** "Mua lượt AI Screening" with Zap icon
- **Current Quota Display:**
  - Shows: "Lượt hiện tại: X/Y lượt"
- **Bundle Package Card:**
  - Border: 2px primary color
  - Title: "Gói {bundleSize} lượt"
  - Price per unit: "{price}đ / lượt"
  - Total price: "{totalPrice}đ"

- **Buttons:**
  - "Hủy" (Cancel) button
  - **"Mua {bundleSize} lượt ({price}đ)" button** - LoadingButton
    - Shows loading spinner while `buyMutation.isPending`
    - Disabled on success message

- **Success Message:**
  - Green bg: "Mua thành công {bundleSize} lượt! Số dư ví: {balance}đ"
  - Auto-closes after 1.5s

- **Error Message:**
  - Red bg: Shows `buyMutation.error.message` or default message
  - AlertTriangle icon

---

## Key Form Fields & Data-TestIDs

### Login Form

```
Input #login-email
Input #login-password
ReCAPTCHA iframe[title*="reCAPTCHA"]
Button "Secure Sign In" | "Signing In"
```

### Organisation Registration Form

```
Input name="organisationName" placeholder="Aura Eye Clinic"
Select name="orgType" values="1" | "2"
Input name="contactFullName" placeholder="Nguyen Van A"
Input name="contactEmail" placeholder="admin@clinic.vn"
Input name="contactPhone" placeholder="0909123456"
Input name="licenseNumber" placeholder="GP-2026-001"
Input name="address" placeholder="123 Nguyen Hue, Ho Chi Minh City"
Textarea name="notes" placeholder="Nhu cầu triển khai..."
Button text="Gửi đăng ký tổ chức"
```

### Image Upload Components

```
Drag-drop zone: role="button" or custom div with onDrop handler
File input: accept="image/*,.dcm"
Selected file preview with delete (X) button
Upload button: "Upload Contract" or similar
Progress indicator: animated bar or percentage
```

### Doctor Search

```
Input placeholder="Search by doctor name, email or bio..."
Role button for each doctor card
Avatar img with alt="Doctor Name"
Badge text="Verified"
```

### Clinic Booking Search

```
Input placeholder="Search organisation by name, city, or address"
Role button for each org card (selected state: border-cyan-500)
Date input selector
Visit reason textarea
Role button for each slot
```

### Wallet/TopUp

```
Modal aria-label="Mua lượt AI screening"
Display text "Lượt hiện tại" + balance
Button text="Mua {bundleSize} lượt ({price}đ)"
Button text="Hủy"
Success message selector for animation
```

### System Admin Tables

```
Button title="Approve Verification" | "Reject Verification"
Textarea placeholder="Mô tả rõ lý do từ chối..."
Button text varying by action
Select for status filters
```

---

## reCAPTCHA Integration

### Login Page Only

**File:** `src/features/auth/pages/login.tsx`

**Configuration:**

```typescript
import ReCAPTCHA from 'react-google-recaptcha';

const recaptchaRef = useRef<ReCAPTCHA>(null);
const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

// In JSX:
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
  onChange={(token) => setRecaptchaToken(token)}
  onExpired={() => setRecaptchaToken(null)}
  onErrored={() => setRecaptchaToken(null)}
/>
```

**E2E Testing Bypass:**

```typescript
// Mock grecaptcha global
await page.evaluate(() => {
  (window as unknown as { grecaptcha?: unknown }).grecaptcha = {
    ready: (cb: () => void) => cb(),
    execute: async () => 'e2e-recaptcha-token',
    getResponse: () => 'e2e-recaptcha-token',
  };
});

// Route intercept
await page.route('**/recaptcha/api2/userverify*', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ token: 'e2e-recaptcha-token' }),
  });
});
```

**Environment Variable:**

- `VITE_RECAPTCHA_SITE_KEY` - configured in `.env.test` for test environment

---

## URL Redirect Patterns

### After Successful Registration

```
/register-organisation → Success page (within same component)
                      → Link to /login
                      → Link to /
```

### After Successful Login

```
/login → Role-based redirect:
         - Patient: /patient/dashboard
         - Ophthalmologist: /ophthalmologist/dashboard
         - Organisation: /organisation/dashboard
         - System Admin: /system-admin/dashboard
```

### After Booking Confirmation

```
/patient/book → (select doctor/slot)
             → /patient/book/confirm → (confirm & pay)
             → /patient/appointments (explicit navigate)
```

### After Contract Upload Success

```
/organisation/contract → (upload file)
                      → Page reloads with new contract status
                      → Status changes from "Đang chỉnh sửa" to "Đã upload - Chờ admin duyệt"
```

### After Appointment Booking (Patient)

```
/patient/doctors → (select doctor)
                → /patient/book → (select slot)
                → /patient/book/confirm → Success response
                → /patient/appointments (via navigate call)
```

### After Session Expiry

```
/patient/book/confirm → (reservation expires)
                     → /patient/book (automatic redirect via navigate)
```

---

## Component Hierarchy

### Patient Layout Structure

```
PatientLayout
  ├─ PatientSidebar
  │  ├─ Navigation links
  │  └─ QuotaBadge (displays current quota)
  ├─ PatientHeader
  │  ├─ Page title
  │  ├─ Breadcrumbs
  │  └─ User menu
  └─ Page Content
```

### Examination Flow

```
ScreeningNewPage (upload)
  └─ Images stored in useScreeningStore
  └─ Navigate to RetinalAnalysisPage

RetinalAnalysisPage (AI analysis)
  ├─ PatientImageViewer (main image display)
  ├─ PatientFindings/AnalysisSidebar (anomaly list)
  ├─ PatientImageStrip/ReadOnlyImageGallery (thumbnail navigation)
  └─ ReviewPage (explicit nav or direct)

ReviewPage (confirmation)
  └─ Action: Share with doctor or schedule appointment
```

### Booking Flow

```
DoctorsPage (search & select doctor)
  └─ Button "View Slots" → /patient/book?doctorId=xxx

BookAppointmentPage (view availability)
  ├─ Calendar/date navigation
  ├─ Slot grid
  └─ Button "Reserve" → ReservationModal

ReservationModal (temporary hold)
  ├─ 5-minute countdown
  └─ Buttons: "Confirm Booking" | "Cancel"
     → "Confirm" navigates to /patient/book/confirm

BookingConfirmationPage (final step)
  ├─ Share options (checkboxes)
  ├─ Reservation countdown
  └─ Button "Confirm & Pay"
     → Creates ConsultationSession
     → Success page
```

### Admin Approval Flow

```
SystemAdminOrganisationsPage (request queue)
  ├─ List of pending requests
  └─ "Approve" button per request
     → Success message
     → Request removed from queue
     → Organisation added to active list

SystemAdminOphthalmologistsPage (verification)
  ├─ List of pending doctors
  ├─ "Approve" button per row
  └─ "Reject" button per row
     → RejectModal when reject clicked
        ├─ Reason textarea
        ├─ Error display
        └─ Submit confirms rejection
           → Table updates
```

---

## Project Configuration Files

**Router Config:** `src/routes/index.tsx`

- Main routing setup with lazy-loaded components
- PrivateRoute component for protected pages
- Suspense fallback: PageLoader spinner

**Key Dependencies:**

- `react-router-dom` - routing
- `react-google-recaptcha` - reCAPTCHA
- `@react-oauth/google` - Google login
- `@tanstack/react-query` - API queries
- `react-hook-form` - form management
- `lucide-react` - icons
- `axios` - HTTP client

**API Clients:**

- `axios` instance with interceptors
- Base URL: `VITE_API_ENDPOINT` environment variable

**Stores:**

- `useAuthStore` (Zustand) - authentication state
- `useScreeningStore` - screening/image store

---

## Environment Variables

```env
# Test Mode
VITE_API_ENDPOINT=http://localhost:5000
VITE_AVATAR_FALLBACK_URL=https://ui-avatars.com/api/?name=
VITE_RECAPTCHA_SITE_KEY=your_site_key

# E2E Tests
E2E_ROLE_EMAIL_PATIENT=patient@gmail.com
E2E_ROLE_EMAIL_OPHTHALMOLOGIST=ophthalmologist@gmail.com
```

---

## Notes for E2E Testing

1. **reCAPTCHA:** Always mock grecaptcha and intercept API routes in test
2. **File Uploads:** Use `fileInputRef.current?.click()` or drag-drop simulation
3. **Database Queries:** E2E tests use direct PostgreSQL queries for setup
4. **Countdown Timers:** Account for timeouts (5-minute reservation holds)
5. **Modal Detection:** Check for backdrop blur and role="dialog" attributes
6. **Status Badges:** Text content varies (color classes don't help selectors)
7. **External Links:** Use `target="_blank"` and `rel="noopener noreferrer"`
8. **Form Validation:** react-hook-form includes error messages in DOM

---

**Last Updated:** March 20, 2026  
**Mapped by:** GitHub Copilot
