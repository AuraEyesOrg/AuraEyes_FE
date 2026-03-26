# TEST REPORT DOCUMENT

| Field         | Value                              | Field      | Value              |
| ------------- | ---------------------------------- | ---------- | ------------------ |
| Project Name  | AURA Retinal Screening System Test | Creator    | QA Automation Team |
| Project Code  | AURA-FE-E2E                        | Issue Date | 2026-03-23         |
| Document Code | AURA-FE-E2E_Test_Report_v1.3       | Version    | v1.3               |

## Record of change

| Effective Date | Version | Change Item                 | \*A,D,M | Change description                                                                                                           | Reference                                                                                                                                                                                                                                                    |
| -------------- | ------- | --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-03-23     | v1.0    | Initial report              | A       | Initial report mapped from Playwright system flows                                                                           | tests/e2e/specs/01-doctor-registration-full-flow.spec.ts; tests/e2e/specs/02-org-onboarding.spec.ts; tests/e2e/specs/03-patient-screening-and-consultation-session.spec.ts; tests/e2e/specs/04-offline-booking.spec.ts; tests/e2e/specs/05-buy-quota.spec.ts |
| 2026-03-23     | v1.1    | Terminology update          | M       | Standardized business terms for onboarding, contract activation, AI screening, appointment booking, and consultation session | tests/e2e/docs/flow2-org-onboarding.md; tests/e2e/docs/flow3-patient-screening-and-consultation-session.md; tests/e2e/docs/flow4-offline-booking.md; tests/e2e/docs/flow5-buy-quota.md                                                                       |
| 2026-03-25     | v1.3    | Report format normalization | M       | Reformatted all feature sections to template-style layout for clean reporting and consistent alignment                       | tests/e2e/docs/System_Test_Report_AURA.md                                                                                                                                                                                                                    |

# TEST CASE LIST

| Field                              | Value                                                                                                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Name                       | AURA Retinal Screening System Test                                                                                                                                                     |
| Project Code                       | AURA-FE-E2E                                                                                                                                                                            |
| Test Environment Setup Description | 1. Server: AURA FE + BE test environment with test backdoor enabled. 2. Database: PostgreSQL seeded for system roles and business states. 3. Web Browser: Playwright Chromium context. |

| No  | Function Name                                                         | Sheet Name | Description                                                                                       | Pre-Condition                                                               |
| --- | --------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Flow 01 - Ophthalmologist Onboarding and Verification                 | Feature 1  | Ophthalmologist registration, credential verification, and protected access                       | System Admin account available; DB update for email confirmation is allowed |
| 2   | Flow 02 - Organisation Onboarding and Contract Activation             | Feature 2  | Organisation onboarding approval and contract activation lifecycle                                | Pending organisation onboarding request exists                              |
| 3   | Flow 03 - AI Screening, Appointment Booking, and Consultation Session | Feature 3  | Patient full screening service journey, then appointment request and consultation session handoff | Patient and ophthalmologist accounts available; slots can be seeded         |
| 4   | Flow 04 - Organisation Slot Booking and Offline Appointment           | Feature 4  | Patient books organisation offline appointment from clinics route                                 | Organisation data exists; offline slot can be created                       |
| 5   | Flow 05 - AI Quota Purchase for Screening Service                     | Feature 5  | Patient purchases additional AI quota and quota state is updated                                  | Patient account exists; wallet and quota are writable in test DB            |

# TEST STATISTICS

| Field         | Value                                | Field              | Value              |
| ------------- | ------------------------------------ | ------------------ | ------------------ |
| Project Name  | AURA Retinal Screening System Test   | Creator            | QA Automation Team |
| Project Code  | AURA-FE-E2E                          | Reviewer/ Approver |                    |
| Document Code | AURA-FE-E2E_Test_Report_v1.3         | Issue Date         | 2026-03-25         |
| Notes         | Included modules: Flow 01 to Flow 05 |                    |                    |

| No  | Module code                                                           | Passed | Failed | Pending |   N/A | Number of test cases |
| --- | --------------------------------------------------------------------- | -----: | -----: | ------: | ----: | -------------------: |
| 1   | Flow 01 - Ophthalmologist Onboarding and Verification                 |      0 |      0 |       3 |     0 |                    3 |
| 2   | Flow 02 - Organisation Onboarding and Contract Activation             |      0 |      0 |       3 |     0 |                    3 |
| 3   | Flow 03 - AI Screening, Appointment Booking, and Consultation Session |      0 |      0 |       6 |     0 |                    6 |
| 4   | Flow 04 - Organisation Slot Booking and Offline Appointment           |      0 |      0 |       3 |     0 |                    3 |
| 5   | Flow 05 - AI Quota Purchase for Screening Service                     |      0 |      0 |       3 |     0 |                    3 |
|     | **Sub total**                                                         |  **0** |  **0** |  **18** | **0** |               **18** |

- Test coverage:
- Test successful coverage:

---

## Feature 1

| Field            | Value                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Feature          | Flow 01 - Ophthalmologist Onboarding and Verification                                              |
| Test requirement | Validate ophthalmologist onboarding, credential verification, and post-verification access control |
| Number of TCs    | 3                                                                                                  |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       3 |   0 |
| Round 2       |      0 |      0 |       3 |   0 |
| Round 3       |      0 |      0 |       3 |   0 |

| Test Case ID | Test Case Description                  | Test Case Procedure                                                                                                                     | Expected Results                                                     | Pre-conditions                                             | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| ------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- | ------- | --------- | ------ | ------- | --------- | ------ | ------- | --------- | ------ | ---- |
| Function A   | Ophthalmologist onboarding submission  | Register onboarding profile and upload credential files from /register-doctor.                                                          | Onboarding request is created with pending verification status.      | Ophthalmologist email is unique; upload service available. | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F1-ID1       | Submit onboarding profile successfully | 1) Open /register-doctor.<br>2) Fill required profile fields.<br>3) Upload degree and certificate file.<br>4) Click Submit Application. | Application Submitted message is displayed and request is persisted. | Test DB and file upload endpoint are available.            | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function B   | Verification and approval              | Verify onboarding request lifecycle in system-admin module.                                                                             | Request can be searched and approved by System Admin.                | System Admin can access verification route.                | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F1-ID2       | Approve onboarding request             | 1) Open /system-admin/verifications.<br>2) Search by ophthalmologist email.<br>3) Approve request.                                      | Request is removed from pending list and approval feedback appears.  | Existing request from Function A.                          | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function C   | Post-verification access control       | Validate protected route access after approval.                                                                                         | Ophthalmologist can access dashboard or contract route.              | Verification status has been approved.                     | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F1-ID3       | Access protected route after approval  | 1) Sign in as approved ophthalmologist.<br>2) Navigate to /ophthalmologist/dashboard.                                                   | Protected route renders successfully.                                | Approved verification status exists.                       | Pending |           |        | Pending |           |        | Pending |           |        |      |

## Feature 2

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Feature          | Flow 02 - Organisation Onboarding and Contract Activation               |
| Test requirement | Validate organisation onboarding approval and contract activation chain |
| Number of TCs    | 3                                                                       |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       3 |   0 |
| Round 2       |      0 |      0 |       3 |   0 |
| Round 3       |      0 |      0 |       3 |   0 |

| Test Case ID | Test Case Description            | Test Case Procedure                                                                                            | Expected Results                                                    | Pre-conditions                                          | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| ------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- | ------- | --------- | ------ | ------- | --------- | ------ | ------- | --------- | ------ | ---- |
| Function A   | Organisation onboarding approval | Approve pending organisation onboarding request.                                                               | Provisioned organisation admin credentials are returned.            | Pending onboarding request exists.                      | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F2-ID1       | Approve onboarding request       | 1) Open /system-admin/organisations.<br>2) Click approve action.<br>3) Capture approval response.              | Request status becomes approved and credential payload is valid.    | System Admin session is active.                         | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function B   | Contract upload                  | Upload signed contract from organisation route.                                                                | Contract status changes to pending verification.                    | Organisation admin credentials are available.           | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F2-ID2       | Upload organisation contract     | 1) Sign in as organisation admin.<br>2) Navigate to /organisation/contract.<br>3) Upload signed contract file. | Upload feedback is shown and contract enters verification stage.    | Approved onboarding state.                              | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function C   | Contract activation gate         | Validate route access after contract verification.                                                             | Contract gate is cleared and dashboard routes are accessible.       | Contract verification by System Admin completed.        | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F2-ID3       | Verify contract and re-login     | 1) Verify contract at /system-admin/contracts.<br>2) Re-login as organisation admin.                           | Organisation dashboard routes are reachable without contract block. | Existing contract record in pending verification state. | Pending |           |        | Pending |           |        | Pending |           |        |      |

## Feature 3

| Field            | Value                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature          | Flow 03 - AI Screening, Appointment Booking, and Consultation Session                                                                                       |
| Test requirement | Validate patient full screening service route (dashboard -> screening new -> analysis -> review -> roadmap) before consultation request and session opening |
| Number of TCs    | 6                                                                                                                                                           |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       6 |   0 |
| Round 2       |      0 |      0 |       6 |   0 |
| Round 3       |      0 |      0 |       6 |   0 |

| Test Case ID | Test Case Description                           | Test Case Procedure                                                                                                                                         | Expected Results                                                             | Pre-conditions                                                       | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------- | --------- | ------ | ------- | --------- | ------ | ------- | --------- | ------ | ---- |
| Function A   | AI Screening service navigation                 | Validate full screening navigation before consultation request.                                                                                             | Patient reaches review and roadmap successfully after AI screening service.  | Patient account active; screening module reachable.                  | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F3-ID1       | Dashboard to new screening                      | 1) Sign in as patient.<br>2) Start at /patient/dashboard.<br>3) Open New Scan entry.                                                                        | Route changes to /patient/screening/new.                                     | Patient credentials valid.                                           | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F3-ID2       | Run AI screening and continue to review         | 1) Upload retinal image.<br>2) Click Start AI Analysis.<br>3) Click Start Screening.<br>4) Continue to review route.                                        | /patient/analysis and /patient/screening/review routes load in sequence.     | Uploaded image reaches ready state.                                  | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F3-ID3       | Review and roadmap navigation                   | 1) Validate review educational resources.<br>2) Open /patient/roadmap.<br>3) Return to review stage.                                                        | Review resources and roadmap page heading are visible.                       | Review state is available from screening result.                     | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function B   | Appointment request and booking                 | Validate specialist selection and appointment booking lifecycle.                                                                                            | Appointment booking is created and payment confirmation is completed.        | Slot is available and wallet is funded.                              | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F3-ID4       | Request specialist and complete booking         | 1) Click Find a Specialist.<br>2) Open doctor slots.<br>3) Confirm Booking.<br>4) Confirm and Pay.                                                          | Booking Confirmed feedback is displayed and consultation session is created. | Existing slot and schedule template in DB.                           | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function C   | Consultation session and Meet handoff           | Validate consultation entry points for patient and ophthalmologist.                                                                                         | Consultation chat is open and Google Meet link is available.                 | Consultation session is updated to open state.                       | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F3-ID5       | Patient and ophthalmologist consultation access | 1) Open /patient/chat as patient.<br>2) Open /ophthalmologist/consultations as ophthalmologist.<br>3) Verify consultation context and meet link visibility. | Both roles can access consultation session context with meeting handoff.     | Patient and ophthalmologist accounts linked to consultation session. | Pending |           |        | Pending |           |        | Pending |           |        |      |

## Feature 4

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Feature          | Flow 04 - Organisation Slot Booking and Offline Appointment             |
| Test requirement | Validate patient offline appointment booking through organisation slots |
| Number of TCs    | 3                                                                       |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       3 |   0 |
| Round 2       |      0 |      0 |       3 |   0 |
| Round 3       |      0 |      0 |       3 |   0 |

| Test Case ID | Test Case Description             | Test Case Procedure                                                                                              | Expected Results                                                | Pre-conditions                                       | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| ------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- | ------- | --------- | ------ | ------- | --------- | ------ | ------- | --------- | ------ | ---- |
| Function A   | Organisation slot visibility      | Validate organisation slot visibility in patient appointments.                                                   | Organisation slot section is visible and actionable.            | Organisation slot is seeded for target date.         | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F4-ID1       | Inspect organisation slot panel   | 1) Sign in as patient.<br>2) Open /patient/appointments.<br>3) Check Organisation Slots panel.                   | Organisation slot panel and booking action are visible.         | Patient account active.                              | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function B   | Offline appointment booking       | Validate booking submission from clinics route.                                                                  | Offline appointment booking is submitted successfully.          | Organisation selected; date and reason are provided. | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F4-ID2       | Submit offline booking            | 1) Open /patient/clinics.<br>2) Search organisation.<br>3) Select date and reason.<br>4) Click Book Appointment. | Booking success feedback is shown.                              | Available offline slot exists.                       | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function C   | Post-booking verification         | Validate booked data appears in appointment listing.                                                             | Appointment is visible in organisation slot list after booking. | Booking from Function B completed.                   | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F4-ID3       | Verify booked appointment in list | 1) Return to /patient/appointments.<br>2) Validate organisation name and slot display.                           | Booked organisation appointment is visible in listing.          | Existing appointment record from prior step.         | Pending |           |        | Pending |           |        | Pending |           |        |      |

## Feature 5

| Field            | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| Feature          | Flow 05 - AI Quota Purchase for Screening Service              |
| Test requirement | Validate patient AI quota purchase after exhausted quota state |
| Number of TCs    | 3                                                              |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       3 |   0 |
| Round 2       |      0 |      0 |       3 |   0 |
| Round 3       |      0 |      0 |       3 |   0 |

| Test Case ID | Test Case Description            | Test Case Procedure                                                                                | Expected Results                                                    | Pre-conditions                                              | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
| ------------ | -------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | ------- | --------- | ------ | ------- | --------- | ------ | ------- | --------- | ------ | ---- |
| Function A   | Exhausted quota gate             | Validate blocked screening behavior when quota is exhausted.                                       | Out-of-quota warning is displayed at screening stage.               | UsedAiQuota threshold reached and PurchasedAiQuota is zero. | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F5-ID1       | Verify out-of-quota warning      | 1) Set wallet and quota state in DB.<br>2) Upload image and start analysis.<br>3) Observe warning. | System blocks screening continuation and prompts quota purchase.    | Patient account and DB setup access are available.          | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function B   | Quota purchase transaction       | Validate purchase modal and transaction confirmation.                                              | Purchase success feedback is displayed and transaction is recorded. | Purchase modal and package options are available.           | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F5-ID2       | Complete quota purchase          | 1) Open purchase modal.<br>2) Select package.<br>3) Confirm purchase action.                       | Purchase success message is displayed.                              | Sufficient wallet balance configured.                       | Pending |           |        | Pending |           |        | Pending |           |        |      |
| Function C   | Quota and wallet state update    | Validate post-purchase quota and wallet state.                                                     | Purchased quota increases and wallet state updates as expected.     | Successful purchase from Function B.                        | Pending |           |        | Pending |           |        | Pending |           |        |      |
| F5-ID3       | Verify DB records after purchase | 1) Query patient quota fields.<br>2) Query wallet transaction records.                             | PurchasedAiQuota > 0 and wallet transaction row exists.             | DB query permission for test environment.                   | Pending |           |        | Pending |           |        | Pending |           |        |      |
