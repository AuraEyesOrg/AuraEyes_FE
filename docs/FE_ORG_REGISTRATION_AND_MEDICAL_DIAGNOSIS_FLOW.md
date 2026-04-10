# FE Org Registration and Medical Diagnosis Flow

## 1) Why tsconfig deprecation errors happen

The deprecation diagnostics are produced by newer TypeScript (TS 6.x) because some compiler options in this project are marked for removal in TS 7.0.

Current deprecated options in this codebase:

- esModuleInterop set to false
- moduleResolution set to Node (resolved as node10)
- baseUrl set to src

Observed diagnostics point to:

- tsconfig.json line 8 for esModuleInterop
- tsconfig.json line 13 for moduleResolution
- tsconfig.json line 19 for baseUrl

Why this happens:

- TS 6 introduces migration diagnostics for options that will stop functioning in TS 7.
- This is not a runtime app crash; it is a forward-compatibility warning/error from the compiler service.

Recommended migration path for this Vite + React project:

1. Replace moduleResolution: Node with moduleResolution: Bundler.
2. Remove esModuleInterop: false (false is default behavior; remove explicit deprecated setting).
3. Remove baseUrl and keep alias through paths using explicit relative mapping from tsconfig root, for example:
   - paths: { "@/_": ["./src/_"] }
4. Keep Vite alias in sync with TS alias in vite.config.mjs.

Short-term temporary suppression (not final fix):

- Add ignoreDeprecations: "6.0" in compilerOptions.
- Use only while finishing migration, then remove suppression.

## 2) Frontend organization registration flow

### Entry and route

- Public route renders RegisterOrganisationPage at:
  - /register-organisation
  - /:locale/register-organisation

### Main page behavior

File: src/features/auth/pages/register-organisation.tsx

1. User fills organization onboarding form:

- organisationName
- orgType (Hospital or Clinic)
- contactFullName
- contactEmail
- contactPhone
- address
- licenseNumber
- notes

2. On submit:

- FE normalizes/trims values.
- FE calls registerOrganisation API function.

3. API call:
   File: src/features/auth/api/auth.api.ts

- registerOrganisation sends POST to:
  - /auth/register/organisation
- Request type is RegisterOrganisationRequest.
- Response shape expected by FE:
  - requestId
  - email
  - message

4. Success UI:

- Page switches to success state (isSubmitted = true).
- UI message indicates request has been sent to System Admin.
- Shows submitted contact email.
- Provides CTA buttons to go to login or home.

5. Error UI:

- FE uses extractApiErrorMessage to map backend/network errors.
- Displays inline error banner without leaving page.

Business meaning of this flow:

- Organization registration is a request workflow, not immediate account activation.
- System Admin review/approval is expected before operational access.

## 3) Medical diagnosis flow after screening and consultation

This flow has two connected stages:

- Stage A: Patient AI screening pipeline.
- Stage B: Consultation and doctor verification/diagnosis reporting.

### Stage A: Patient screening pipeline

Primary files:

- src/features/patient/pages/screening-new.tsx
- src/features/patient/pages/retinal-analysis.tsx
- src/features/patient/pages/review.tsx
- src/features/patient/api/screening.api.ts
- src/features/patient/api/consent.api.ts

A1. Upload and quality validation

- Patient uploads retinal images in screening-new page.
- FE validates fundus quality/type via AI validation endpoint.

A2. Create screening session

- FE uploads accepted files using screeningApi.uploadRetinalImages.
- FE creates session using screeningApi.createSession.
- Backend returns screeningId.

A3. Consent recording

- FE records consent by calling agreeScreeningConsent(screeningId, content).

A4. Navigate to analysis

- FE navigates to /patient/analysis with state including:
  - screeningId
  - image previews and metadata
  - consentAccepted

A5. AI analysis and persistence
In retinal-analysis page:

- FE performs fast analysis first for quick response.
- FE attempts full analysis for richer overlays (bbox/heatmap).
- FE computes mapped risk and findings from AI output.
- FE persists result with screeningApi.saveAiResults(screeningId, payload):
  - rawJsonOutput
  - riskLevel
  - confidenceScore
  - summary
  - findings

A6. Review and consultation intent handoff

- User goes to /patient/screening/review.
- FE builds and stores consultation context (screeningId, images, anomalies, risk, rawJsonOutput).
- From review page, user can continue to doctor selection at /patient/doctors with this context.

### Stage B: Consultation creation and doctor diagnosis report

Primary files:

- src/features/patient/pages/booking-confirmation.tsx
- src/features/patient/hooks/use-booking.ts
- src/features/patient/api/booking.api.ts
- src/features/consultation/api/consultation.api.ts
- src/features/ophthalmologist/pages/screening-review.tsx
- src/types/consultation.ts

B1. Appointment booking confirmation
In booking-confirmation page:

- FE confirms reserved slot using useConfirmReservation.
- Payload includes:
  - patientId
  - aiScreeningId (from consultation context)
  - shareRetinalImages
  - shareAiResults
- FE may re-submit consent content for selected sharing scope before confirmation.

B2. Backend creates consultation session

- confirmReservation API returns booking confirmation including consultationSessionId.
- FE invalidates consultation session queries after success.

B3. Doctor side links consultation to screening
In ophthalmologist screening-review page:

- FE queries consultation sessions filtered by:
  - ophthalmologistId
  - aiScreeningId (screening being reviewed)
- FE chooses reportable session with priority:
  1. Verification session
  2. VideoCall session

B4. Doctor submits diagnosis/verification report

- FE validates required inputs (diagnosis code, clinical findings, confidence range, doctor identity, linked session).
- FE submits report through submitVerificationReport(sessionId, payload).
- Endpoint:
  - /consultation-sessions/{sessionId}/verification-report
- Payload can include:
  - diagnosisCode / diagnosesCode
  - codingSystem
  - clinicalFindings / diagnosesText
  - severityLevel
  - confidenceLevel
  - treatmentPlan
  - recommendations
  - isUrgent
  - status
  - followUpDate
  - isReferralNeeded
  - finalizedAt

B5. Session lifecycle signals
Consultation model supports:

- Session status: Pending, Confirmed, Completed, Cancelled
- Chat status: Locked, MemoOnly, Open, Archived

These statuses define when patient-doctor communication is locked/open and when the case is effectively completed.

## 4) End-to-end summary

Complete FE business chain:

1. Patient uploads retinal images.
2. FE creates screening session and records consent.
3. AI analysis is run and persisted as screening results.
4. Patient reviews findings and books consultation with attached screening context.
5. Booking confirmation carries aiScreeningId and sharing flags.
6. Doctor reviews linked screening and submits structured diagnosis report to consultation session.

This creates traceability from AI screening data to doctor-confirmed diagnosis workflow.
