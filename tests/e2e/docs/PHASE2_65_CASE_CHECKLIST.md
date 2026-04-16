# Phase 2 E2E Checklist (65 Cases)

## Scope

- Target cases: 65
- Framework: Playwright
- Round policy: each case is tracked in Round 1, Round 2, Round 3
- Focus: critical paths + high-risk bad cases

## Group 1: Core User Flows (15 Cases)

| ID         | Module             | Scenario                                                   | Role            | Type  | R1  | R2  | R3  |
| ---------- | ------------------ | ---------------------------------------------------------- | --------------- | ----- | --- | --- | --- |
| AUTH_01    | Authentication     | Local login redirects Patient to correct dashboard         | Patient         | Happy | [ ] | [ ] | [ ] |
| AUTH_02    | Authentication     | Local login redirects Ophthalmologist to correct dashboard | Ophthalmologist | Happy | [ ] | [ ] | [ ] |
| AUTH_03    | Authentication     | Google login redirects by role correctly                   | Multi-role      | Happy | [ ] | [ ] | [ ] |
| AUTH_04    | Authentication     | Logout clears session and blocks private pages             | Multi-role      | Happy | [ ] | [ ] | [ ] |
| AUTH_05    | Authentication     | Wrong role cannot access protected route                   | Multi-role      | Bad   | [ ] | [ ] | [ ] |
| PROFILE_01 | Profile Management | Patient updates profile information successfully           | Patient         | Happy | [ ] | [ ] | [ ] |
| PROFILE_02 | Profile Management | Ophthalmologist updates profile and avatar successfully    | Ophthalmologist | Happy | [ ] | [ ] | [ ] |
| PROFILE_03 | Profile Management | Organization updates settings profile successfully         | OrgAdmin        | Happy | [ ] | [ ] | [ ] |
| PROFILE_04 | Profile Management | Profile upload failure shows one error toast only          | Multi-role      | Bad   | [ ] | [ ] | [ ] |
| SCREEN_01  | Patient Screening  | Upload retinal image and start analysis flow               | Patient         | Happy | [ ] | [ ] | [ ] |
| SCREEN_02  | Patient Screening  | Invalid image is rejected safely                           | Patient         | Bad   | [ ] | [ ] | [ ] |
| SCREEN_03  | Patient Screening  | AI result is displayed and saved to history                | Patient         | Happy | [ ] | [ ] | [ ] |
| TOPUP_01   | Top-up Wallet      | Patient top-up success increases wallet balance            | Patient         | Happy | [ ] | [ ] | [ ] |
| TOPUP_02   | Top-up Wallet      | Organization top-up success increases wallet balance       | OrgAdmin        | Happy | [ ] | [ ] | [ ] |
| TOPUP_03   | Top-up Wallet      | Payment cancellation does not change wallet balance        | Multi-role      | Bad   | [ ] | [ ] | [ ] |

## Group 2: Core Transactions and Connections (18 Cases)

| ID         | Module                       | Scenario                                                 | Role                    | Type  | R1  | R2  | R3  |
| ---------- | ---------------------------- | -------------------------------------------------------- | ----------------------- | ----- | --- | --- | --- |
| QUOTA_01   | Buy Quota                    | Patient buys AI quota when wallet is sufficient          | Patient                 | Happy | [ ] | [ ] | [ ] |
| QUOTA_02   | Buy Quota                    | Organization buys AI quota when wallet is sufficient     | OrgAdmin                | Happy | [ ] | [ ] | [ ] |
| QUOTA_03   | Buy Quota                    | Quota purchase blocked when wallet is insufficient       | Multi-role              | Bad   | [ ] | [ ] | [ ] |
| QUOTA_04   | Buy Quota                    | Updated quota price is applied to new purchase           | Patient                 | Happy | [ ] | [ ] | [ ] |
| CONSULT_01 | Find Doctor and Consultation | Patient finds doctor from screening result               | Patient                 | Happy | [ ] | [ ] | [ ] |
| CONSULT_02 | Find Doctor and Consultation | Patient sends consultation request successfully          | Patient                 | Happy | [ ] | [ ] | [ ] |
| CONSULT_03 | Find Doctor and Consultation | Doctor accepts request and opens consultation room       | Ophthalmologist         | Happy | [ ] | [ ] | [ ] |
| CONSULT_04 | Find Doctor and Consultation | Consultation request blocked without valid screening     | Patient                 | Bad   | [ ] | [ ] | [ ] |
| CONSULT_05 | Find Doctor and Consultation | Consultation request blocked when quota is insufficient  | Patient                 | Bad   | [ ] | [ ] | [ ] |
| DIAG_01    | Diagnosis and Feedback       | Doctor sends diagnosis and patient receives it           | Patient/Ophthalmologist | Happy | [ ] | [ ] | [ ] |
| DIAG_02    | Diagnosis and Feedback       | Patient sends doctor rating feedback successfully        | Patient                 | Happy | [ ] | [ ] | [ ] |
| DIAG_03    | Diagnosis and Feedback       | Patient sends system feedback successfully               | Patient                 | Happy | [ ] | [ ] | [ ] |
| DIAG_04    | Diagnosis and Feedback       | Duplicate feedback submission is blocked                 | Patient                 | Bad   | [ ] | [ ] | [ ] |
| BOOK_01    | Book Appointment at Orga     | Patient finds clinic and views available slots           | Patient                 | Happy | [ ] | [ ] | [ ] |
| BOOK_02    | Book Appointment at Orga     | Patient books offline clinic appointment successfully    | Patient                 | Happy | [ ] | [ ] | [ ] |
| BOOK_03    | Book Appointment at Orga     | Booking fails when selected slot was already taken       | Patient                 | Bad   | [ ] | [ ] | [ ] |
| BOOK_04    | Book Appointment at Orga     | Patient reschedules appointment successfully             | Patient                 | Happy | [ ] | [ ] | [ ] |
| BOOK_05    | Book Appointment at Orga     | Patient cancels appointment and status updates correctly | Patient                 | Happy | [ ] | [ ] | [ ] |

## Group 3: Org, Wallet and Onboarding Operations (17 Cases)

| ID             | Module                      | Scenario                                                      | Role                 | Type  | R1  | R2  | R3  |
| -------------- | --------------------------- | ------------------------------------------------------------- | -------------------- | ----- | --- | --- | --- |
| ORG_PATIENT_01 | Orga Screening and Patients | Organization creates walk-in patient profile                  | OrgAdmin             | Happy | [ ] | [ ] | [ ] |
| ORG_PATIENT_02 | Orga Screening and Patients | Organization runs AI screening for walk-in patient            | OrgAdmin             | Happy | [ ] | [ ] | [ ] |
| ORG_PATIENT_03 | Orga Screening and Patients | Organization can view and manage walk-in patient list         | OrgAdmin             | Happy | [ ] | [ ] | [ ] |
| ORG_PATIENT_04 | Orga Screening and Patients | Organization updates walk-in patient details                  | OrgAdmin             | Happy | [ ] | [ ] | [ ] |
| ORG_PATIENT_05 | Orga Screening and Patients | Walk-in AI screening blocked when org quota is empty          | OrgAdmin             | Bad   | [ ] | [ ] | [ ] |
| WALLET_01      | Wallet Management           | Patient transaction history shows expected entries            | Patient              | Happy | [ ] | [ ] | [ ] |
| WALLET_02      | Wallet Management           | Ophthalmologist submits payout request successfully           | Ophthalmologist      | Happy | [ ] | [ ] | [ ] |
| WALLET_03      | Wallet Management           | Organization submits payout request successfully              | OrgAdmin             | Happy | [ ] | [ ] | [ ] |
| WALLET_04      | Wallet Management           | Payout request blocked when available balance is insufficient | Multi-role           | Bad   | [ ] | [ ] | [ ] |
| OPH_ONBOARD_01 | Ophthalmologist Onboarding  | Doctor registration and email confirmation succeed            | Ophthalmologist      | Happy | [ ] | [ ] | [ ] |
| OPH_ONBOARD_02 | Ophthalmologist Onboarding  | Doctor uploads credentials and certificate successfully       | Ophthalmologist      | Happy | [ ] | [ ] | [ ] |
| OPH_ONBOARD_03 | Ophthalmologist Onboarding  | Admin approves doctor, contract is signed, account activated  | SystemAdmin          | Happy | [ ] | [ ] | [ ] |
| OPH_ONBOARD_04 | Ophthalmologist Onboarding  | Rejected doctor cannot access dashboard                       | Ophthalmologist      | Bad   | [ ] | [ ] | [ ] |
| ORG_ONBOARD_01 | Organization Onboarding     | Organization submits contact form successfully                | OrgAdmin             | Happy | [ ] | [ ] | [ ] |
| ORG_ONBOARD_02 | Organization Onboarding     | Admin creates org account and first login succeeds            | SystemAdmin/OrgAdmin | Happy | [ ] | [ ] | [ ] |
| ORG_ONBOARD_03 | Organization Onboarding     | Organization confirms commission contract successfully        | OrgAdmin             | Happy | [ ] | [ ] | [ ] |
| ORG_ONBOARD_04 | Organization Onboarding     | Rejected organization cannot access org dashboard             | OrgAdmin             | Bad   | [ ] | [ ] | [ ] |

## Group 4: Admin and Network Ecosystem (15 Cases)

| ID            | Module                 | Scenario                                                    | Role            | Type  | R1  | R2  | R3  |
| ------------- | ---------------------- | ----------------------------------------------------------- | --------------- | ----- | --- | --- | --- |
| SYS_ADMIN_01  | System Admin           | Admin locks a user account successfully                     | SystemAdmin     | Happy | [ ] | [ ] | [ ] |
| SYS_ADMIN_02  | System Admin           | Locked user cannot login                                    | Multi-role      | Bad   | [ ] | [ ] | [ ] |
| SYS_ADMIN_03  | System Admin           | Admin unlocks user and login works again                    | SystemAdmin     | Happy | [ ] | [ ] | [ ] |
| SYS_ADMIN_04  | System Admin           | Admin sees expected transaction ledger records              | SystemAdmin     | Happy | [ ] | [ ] | [ ] |
| SYS_ADMIN_05  | System Admin           | Admin approves and rejects withdrawal request correctly     | SystemAdmin     | Happy | [ ] | [ ] | [ ] |
| SYS_ADMIN_06  | System Admin           | Admin updates AI quota price successfully                   | SystemAdmin     | Happy | [ ] | [ ] | [ ] |
| SYS_ADMIN_07  | System Admin           | Audit logs capture critical admin actions                   | SystemAdmin     | Happy | [ ] | [ ] | [ ] |
| NETWORK_01    | Network Core           | User creates post with image successfully                   | Ophthalmologist | Happy | [ ] | [ ] | [ ] |
| NETWORK_02    | Network Core           | User deletes own post successfully                          | Multi-role      | Happy | [ ] | [ ] | [ ] |
| NETWORK_03    | Network Core           | Comment and reaction interactions work correctly            | Multi-role      | Happy | [ ] | [ ] | [ ] |
| NETWORK_04    | Network Core           | Repost flow works correctly                                 | Multi-role      | Happy | [ ] | [ ] | [ ] |
| NETWORK_05    | Network Core           | Admin hides violating post and post disappears in feed      | SystemAdmin     | Happy | [ ] | [ ] | [ ] |
| SHARE_CASE_01 | Share Case Integration | Ophthalmologist share case auto-populates diagnosis data    | Ophthalmologist | Happy | [ ] | [ ] | [ ] |
| SHARE_CASE_02 | Share Case Integration | Organization shares case from AI screening with manual note | OrgAdmin        | Happy | [ ] | [ ] | [ ] |
| SHARE_CASE_03 | Share Case Integration | Share case is blocked when anonymization data is invalid    | Multi-role      | Bad   | [ ] | [ ] | [ ] |

## Totals

- Group 1: 15
- Group 2: 18
- Group 3: 17
- Group 4: 15
- Total: 65
