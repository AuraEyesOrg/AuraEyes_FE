# TEST REPORT DOCUMENT

## Overview

| Field            | Value                         | Field       | Value                               |
| ---------------- | ----------------------------- | ----------- | ----------------------------------- |
| Product Metadata | AURA                          | Creator     | QA Automation Team                  |
| Project Name     | AURA Retinal Screening System | Issue Date  | 2026-04-16                          |
| Project Code     | AURA-FE-E2E                   | Version     | v4.0                                |
| Document Code    | AURA-FE-E2E_Test_Report       | Report Type | Module-based (15 modules, 4 groups) |

## Record of Change

| Effective Date | Version | Change Item            | A/D/M | Change Description                                                                                                                   |
| -------------- | ------- | ---------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-04-16     | v4.0    | Phase 1 implemented    | M     | Fixed System Admin locale routes, added Organisation Settings dirty-save behavior, upload spinner overlay, and toast dedupe strategy |
| 2026-04-16     | v4.0    | Phase 2 baseline reset | M     | Rebuilt test plan to 15 modules and 65 test cases with mandatory 3-round execution matrix                                            |

## Phase 1 Quality Gate

| Gate                             | Result                         | Evidence                                                                      |
| -------------------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| FE lint (`npm run lint`)         | Pass (0 errors, warnings only) | Lint output on 2026-04-16                                                     |
| System Admin locale routes       | Completed                      | All `/system-admin/*` now have `/:locale/system-admin/*` equivalents          |
| Organisation Settings Save state | Completed                      | Save button enabled only when form is dirty                                   |
| Avatar upload spinner overlay    | Completed                      | Spinner shown while upload mutation is pending                                |
| Toast dedupe                     | Completed                      | Global dedupe installer + action-specific toastId on critical admin/org flows |

## Test Coverage (Phase 2 Target)

| No  | Module Name                  | Prefix                    | Test Cases | Coverage Summary                                            |
| --- | ---------------------------- | ------------------------- | ---------: | ----------------------------------------------------------- |
| 1   | Authentication               | AUTH\_                    |          5 | Local/Google login, logout, role-based guard                |
| 2   | Profile Management           | PROFILE\_                 |          4 | Update profile/avatar across key roles                      |
| 3   | Patient Screening            | SCREEN\_                  |          3 | Upload, validation, AI result persistence                   |
| 4   | Top-up Wallet                | TOPUP\_                   |          3 | Deposit happy/cancel flows                                  |
| 5   | Buy Quota                    | QUOTA\_                   |          4 | Enough/insufficient balance and price update effect         |
| 6   | Find Doctor and Consultation | CONSULT\_                 |          5 | Discovery, request, acceptance, guard checks                |
| 7   | Diagnosis and Feedback       | DIAG\_                    |          4 | Diagnosis delivery and feedback safety                      |
| 8   | Book Appointment at Orga     | BOOK\_                    |          5 | Search, booking, collision, reschedule/cancel               |
| 9   | Orga Screening and Patients  | ORG*PATIENT*, ORG*SCREEN* |          5 | Walk-in profile and AI screening lifecycle                  |
| 10  | Wallet Management            | WALLET\_                  |          4 | Ledger and payout lifecycle                                 |
| 11  | Ophthalmologist Onboarding   | OPH*ONBOARD*              |          4 | Registration, credential upload, approve/reject             |
| 12  | Organization Onboarding      | ORG*ONBOARD*              |          4 | Contact flow, account provisioning, contract approval       |
| 13  | System Admin                 | SYS*ADMIN*                |          7 | Lock/unlock users, financial checks, pricing and audit logs |
| 14  | Network Core                 | NETWORK\_                 |          5 | Post/repost/comment/reaction and moderation hide            |
| 15  | Share Case Integration       | SHARE*CASE*               |          3 | Diagnosis/screening share-case integrations                 |
|     | **Total**                    |                           |     **65** | **3-round mandatory execution for every testcase**          |

## Group Distribution

| Group   | Name                                  |  Cases |
| ------- | ------------------------------------- | -----: |
| Group 1 | Core User Flows                       |     15 |
| Group 2 | Core Transactions and Connections     |     18 |
| Group 3 | Org, Wallet and Onboarding Operations |     17 |
| Group 4 | Admin and Network Ecosystem           |     15 |
|         | **Total**                             | **65** |

## Test Statistics

| Field                   | Value                           | Field                  | Value                                                      |
| ----------------------- | ------------------------------- | ---------------------- | ---------------------------------------------------------- |
| Total Test Cases        | 65                              | Total Execution Points | 195                                                        |
| Round Policy            | 3 rounds mandatory per testcase | Coverage Ratio         | 100% planned                                               |
| Current Execution State | Ready for Round 1 baseline run  | Blocker                | None from FE side (backend/backdoor availability required) |

| Testing Round | Scope                         | Required Cases | Status  |
| ------------- | ----------------------------- | -------------: | ------- |
| Round 1       | Baseline full run             |             65 | Planned |
| Round 2       | Fix + retest failed cases     |             65 | Planned |
| Round 3       | Full regression stabilization |             65 | Planned |

## Execution Artifacts

- Detailed checklist: tests/e2e/docs/PHASE2_65_CASE_CHECKLIST.md
- Module catalog: tests/e2e/docs/MODULE_TEST_CATALOG_AURA.md
- Regression checklist: tests/e2e/docs/regression-guide-module-and-report.md

## Notes

- Existing specs were reorganized into 4 grouped folders under tests/e2e/specs.
- Legacy booking specs are now tagged with `@module-booking` and round tags.
- Profile module specs now include round tags to align with round scripts.
