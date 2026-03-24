# TEST REPORT DOCUMENT

| Field         | Value                              | Field      | Value              |
| ------------- | ---------------------------------- | ---------- | ------------------ |
| Project Name  | AURA Retinal Screening System Test | Creator    | QA Automation Team |
| Project Code  | AURA-FE-E2E                        | Issue Date | 2026-03-23         |
| Document Code | AURA-FE-E2E_Test_Report_v1.2       | Version    | v1.2               |

## Record of change

| Effective Date | Version | Change Item              | \*A,D,M | Change description                                                                                                           | Reference                                                                                                                                                                                                                                                    |
| -------------- | ------- | ------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-03-23     | v1.0    | Initial report           | A       | Initial report mapped from 5 Playwright system flows                                                                         | tests/e2e/specs/01-doctor-registration-full-flow.spec.ts; tests/e2e/specs/02-org-onboarding.spec.ts; tests/e2e/specs/03-patient-screening-and-consultation-session.spec.ts; tests/e2e/specs/04-offline-booking.spec.ts; tests/e2e/specs/05-buy-quota.spec.ts |
| 2026-03-23     | v1.1    | Terminology update       | M       | Standardize business terminology for screening, appointment, onboarding, and contract activation                             | tests/e2e/docs/flow2-org-onboarding.md; tests/e2e/docs/flow3-patient-screening-and-consultation-session.md; tests/e2e/docs/flow4-offline-booking.md; tests/e2e/docs/flow5-buy-quota.md                                                                       |
| 2026-03-23     | v1.2    | Merge Flow 6 into Flow 3 | M       | Merge patient screening service navigation into Flow 03 before consultation request and remove duplicated standalone Flow 06 | tests/e2e/specs/03-patient-screening-and-consultation-session.spec.ts                                                                                                                                                                                        |

# TEST CASE LIST

| Field                              | Value                                                                                                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Name                       | AURA Retinal Screening System Test                                                                                                                                                     |
| Project Code                       | AURA-FE-E2E                                                                                                                                                                            |
| Test Environment Setup Description | 1. Server: AURA FE + BE test environment with test backdoor enabled. 2. Database: PostgreSQL seeded for system roles and business states. 3. Web Browser: Playwright Chromium context. |

| No  | Function Name                                                         | Sheet Name | Description                                                                                                  | Pre-Condition                                                                                     |
| --- | --------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 1   | Flow 01 - Ophthalmologist Onboarding and Verification                 | Feature 1  | Ophthalmologist registration, credential verification, and protected access                                  | System Admin account available; test backdoor available; DB update for email confirmation allowed |
| 2   | Flow 02 - Organisation Onboarding and Contract Activation             | Feature 2  | Organisation onboarding approval and contract activation lifecycle                                           | Pending organisation onboarding request exists; System Admin account available                    |
| 3   | Flow 03 - AI Screening, Appointment Booking, and Consultation Session | Feature 3  | Patient full screening service journey, then appointment request, consultation chat, and Google Meet handoff | Patient and Ophthalmologist accounts available; DB seed/update access for slots and consultation  |
| 4   | Flow 04 - Organisation Slot Booking and Offline Appointment           | Feature 4  | Patient books organisation offline appointment from clinics route                                            | Organisation data exists; offline slot can be created in DB                                       |
| 5   | Flow 05 - AI Quota Purchase for Screening Service                     | Feature 5  | Patient purchases additional AI quota and quota state is updated                                             | Patient account exists; wallet/quota update access exists                                         |

# TEST STATISTICS

| Field         | Value                                                              | Field              | Value              |
| ------------- | ------------------------------------------------------------------ | ------------------ | ------------------ |
| Project Name  | AURA Retinal Screening System Test                                 | Creator            | QA Automation Team |
| Project Code  | AURA-FE-E2E                                                        | Reviewer/ Approver |                    |
| Document Code | AURA-FE-E2E_Test_Report_v1.2                                       | Issue Date         | 2026-03-23         |
| Notes         | Included modules: Flow 01 to Flow 05 (Flow 06 merged into Flow 03) |                    |                    |

| No  | Module code                                                           | Passed | Failed | Pending |   N/A | Number of test cases |
| --- | --------------------------------------------------------------------- | -----: | -----: | ------: | ----: | -------------------: |
| 1   | Flow 01 - Ophthalmologist Onboarding and Verification                 |      0 |      0 |       1 |     0 |                    1 |
| 2   | Flow 02 - Organisation Onboarding and Contract Activation             |      0 |      0 |       1 |     0 |                    1 |
| 3   | Flow 03 - AI Screening, Appointment Booking, and Consultation Session |      0 |      0 |       1 |     0 |                    1 |
| 4   | Flow 04 - Organisation Slot Booking and Offline Appointment           |      0 |      0 |       1 |     0 |                    1 |
| 5   | Flow 05 - AI Quota Purchase for Screening Service                     |      0 |      0 |       1 |     0 |                    1 |
|     | **Sub total**                                                         |  **0** |  **0** |   **5** | **0** |                **5** |

- Test coverage:
- Test successful coverage:

---

## Feature 1

| Field            | Value                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Feature          | Flow 01 - Ophthalmologist Onboarding and Verification                                              |
| Test requirement | Validate ophthalmologist onboarding, credential verification, and post-verification access control |
| Number of TCs    | 1                                                                                                  |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       1 |   0 |
| Round 2       |      0 |      0 |       1 |   0 |
| Round 3       |      0 |      0 |       1 |   0 |

| Test Case ID | Test Case Description                                                 | Test Case Procedure                                                                                                                                                                                                                                                           | Expected Results                                                                                              | Pre-conditions                                                                             | Round 1     | Test date | Tester | Round 2     | Test date | Tester | Round 3     | Test date | Tester | Note |
| ------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------- | --------- | ------ | ----------- | --------- | ------ | ----------- | --------- | ------ | ---- |
| F1-TC01      | Validate ophthalmologist onboarding and admin verification lifecycle. | 1) Open /register-doctor. 2) Submit onboarding profile and credentials. 3) Confirm registration success message. 4) Update email confirmation in DB. 5) System Admin verifies request at /system-admin/verifications. 6) Sign in as ophthalmologist and open protected route. | Onboarding request is approved and ophthalmologist can access dashboard or contract route after verification. | System Admin account available; DB query/update access; test backdoor magic login enabled. | [ Pending ] |           |        | [ Pending ] |           |        | [ Pending ] |           |        |      |

## Feature 2

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Feature          | Flow 02 - Organisation Onboarding and Contract Activation               |
| Test requirement | Validate organisation onboarding approval and contract activation chain |
| Number of TCs    | 1                                                                       |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       1 |   0 |
| Round 2       |      0 |      0 |       1 |   0 |
| Round 3       |      0 |      0 |       1 |   0 |

| Test Case ID | Test Case Description                                                                | Test Case Procedure                                                                                                                                                                                                                                             | Expected Results                                                                                        | Pre-conditions                                                     | Round 1     | Test date | Tester | Round 2     | Test date | Tester | Round 3     | Test date | Tester | Note |
| ------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------- | --------- | ------ | ----------- | --------- | ------ | ----------- | --------- | ------ | ---- |
| F2-TC01      | Validate organisation onboarding approval, contract upload, and contract activation. | 1) System Admin opens onboarding request list. 2) Approve request and capture provisioned credentials. 3) Organisation admin signs in and uploads signed contract. 4) System Admin verifies contract at contracts module. 5) Organisation admin signs in again. | Organisation contract gate is cleared and organisation routes are accessible after contract activation. | Pending onboarding request exists; System Admin credentials valid. | [ Pending ] |           |        | [ Pending ] |           |        | [ Pending ] |           |        |      |

## Feature 3

| Field            | Value                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature          | Flow 03 - AI Screening, Appointment Booking, and Consultation Session                                                                                       |
| Test requirement | Validate patient full screening service route (dashboard -> screening new -> analysis -> review -> roadmap) before consultation request and session opening |
| Number of TCs    | 1                                                                                                                                                           |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       1 |   0 |
| Round 2       |      0 |      0 |       1 |   0 |
| Round 3       |      0 |      0 |       1 |   0 |

| Test Case ID | Test Case Description                                                          | Test Case Procedure                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Expected Results                                                                                                                                                   | Pre-conditions                                                                      | Round 1     | Test date | Tester | Round 2     | Test date | Tester | Round 3     | Test date | Tester | Note |
| ------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------- | --------- | ------ | ----------- | --------- | ------ | ----------- | --------- | ------ | ---- |
| F3-TC01      | Validate full patient screening service and then consultation session request. | 1) Seed available appointment slot and wallet balance. 2) Patient signs in at dashboard and opens new screening route. 3) Upload retinal image and start AI analysis at /patient/analysis. 4) Start screening and continue to review route. 5) Validate disease education resources, open roadmap, then return to review. 6) Request specialist review, book slot, confirm booking and pay. 7) Open patient chat and ophthalmologist consultations route with Google Meet handoff. | Patient completes full screening service journey first, then appointment booking succeeds and consultation session is opened for both patient and ophthalmologist. | Patient and ophthalmologist accounts exist; DB slot/session setup access available. | [ Pending ] |           |        | [ Pending ] |           |        | [ Pending ] |           |        |      |

## Feature 4

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Feature          | Flow 04 - Organisation Slot Booking and Offline Appointment             |
| Test requirement | Validate patient offline appointment booking through organisation slots |
| Number of TCs    | 1                                                                       |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       1 |   0 |
| Round 2       |      0 |      0 |       1 |   0 |
| Round 3       |      0 |      0 |       1 |   0 |

| Test Case ID | Test Case Description                                                 | Test Case Procedure                                                                                                                                                                                                   | Expected Results                                                                    | Pre-conditions                                                            | Round 1     | Test date | Tester | Round 2     | Test date | Tester | Round 3     | Test date | Tester | Note |
| ------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------- | --------- | ------ | ----------- | --------- | ------ | ----------- | --------- | ------ | ---- |
| F4-TC01      | Validate offline appointment booking from organisation clinics route. | 1) Seed offline slot for target organisation. 2) Patient opens appointments and navigates to clinics. 3) Search organisation, choose date, and submit booking reason. 4) Complete booking and return to appointments. | Offline appointment booking is successful and appears in organisation slot listing. | Organisation and patient data available; DB seed access for offline slot. | [ Pending ] |           |        | [ Pending ] |           |        | [ Pending ] |           |        |      |

## Feature 5

| Field            | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| Feature          | Flow 05 - AI Quota Purchase for Screening Service              |
| Test requirement | Validate patient AI quota purchase after exhausted quota state |
| Number of TCs    | 1                                                              |

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | -----: | -----: | ------: | --: |
| Round 1       |      0 |      0 |       1 |   0 |
| Round 2       |      0 |      0 |       1 |   0 |
| Round 3       |      0 |      0 |       1 |   0 |

| Test Case ID | Test Case Description                                                     | Test Case Procedure                                                                                                                                                                                                           | Expected Results                                                       | Pre-conditions                                                              | Round 1     | Test date | Tester | Round 2     | Test date | Tester | Round 3     | Test date | Tester | Note |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------- | --------- | ------ | ----------- | --------- | ------ | ----------- | --------- | ------ | ---- |
| F5-TC01      | Validate quota purchase flow and quota state update in screening service. | 1) Set patient wallet and exhausted quota state. 2) Patient uploads image and starts AI analysis. 3) Verify out-of-quota message. 4) Open purchase modal, choose package, and confirm payment. 5) Validate quota value in DB. | Purchased AI quota increases and purchase success feedback is visible. | Patient account and DB update access available for wallet and quota fields. | [ Pending ] |           |        | [ Pending ] |           |        | [ Pending ] |           |        |      |
