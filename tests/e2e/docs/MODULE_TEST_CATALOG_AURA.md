# AURA Module Test Catalog

## Metadata

| Field            | Value           |
| ---------------- | --------------- |
| Product Metadata | AURA            |
| Catalog Type     | Module Split    |
| Source           | tests/e2e/specs |
| Last Updated     | 2026-04-16      |

## Current Spec Structure (4 Groups)

| Group   | Folder                                           | Current Specs                                                                                           |
| ------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Group 1 | tests/e2e/specs/01-core-user-flows               | 01-doctor-registration-full-flow.spec.ts, 06-profile-management.spec.ts                                 |
| Group 2 | tests/e2e/specs/02-core-transactions-connections | 03-patient-screening-and-consultation-session.spec.ts, 04-offline-booking.spec.ts, 05-buy-quota.spec.ts |
| Group 3 | tests/e2e/specs/03-org-wallet-onboarding         | 02-org-onboarding.spec.ts, 08-organisation-patient-screening.spec.ts                                    |
| Group 4 | tests/e2e/specs/04-admin-network-ecosystem       | 07-professional-network.spec.ts                                                                         |

## Module to Spec Mapping (Implemented)

| No  | Module                 | Prefix                    | Tag                   | Spec File                                                                                                       |
| --- | ---------------------- | ------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | Authentication         | AUTH\_                    | @module-auth          | 01-core-user-flows/01-doctor-registration-full-flow.spec.ts, 03-org-wallet-onboarding/02-org-onboarding.spec.ts |
| 2   | E-Contract             | ECONTRACT\_               | @module-econtract     | 03-org-wallet-onboarding/02-org-onboarding.spec.ts                                                              |
| 3   | Profile Management     | PROFILE\_                 | @module-profile       | 01-core-user-flows/06-profile-management.spec.ts                                                                |
| 4   | Patient Screening      | SCREEN\_                  | @module-screening     | 02-core-transactions-connections/03-patient-screening-and-consultation-session.spec.ts                          |
| 5   | Consultation Chat      | CONSULT\_                 | @module-consultation  | 02-core-transactions-connections/03-patient-screening-and-consultation-session.spec.ts                          |
| 6   | Patient Feedback       | FEEDBACK\_                | @module-feedback      | 02-core-transactions-connections/03-patient-screening-and-consultation-session.spec.ts                          |
| 7   | Wallet Operations      | WALLET\_                  | @module-wallet        | 02-core-transactions-connections/05-buy-quota.spec.ts                                                           |
| 8   | Organisation Screening | ORG*PATIENT*, ORG*SCREEN* | @module-org-screening | 03-org-wallet-onboarding/08-organisation-patient-screening.spec.ts                                              |
| 9   | Professional Network   | NETWORK\_                 | @module-network       | 04-admin-network-ecosystem/07-professional-network.spec.ts                                                      |
| 10  | Booking                | BOOK\_                    | @module-booking       | 02-core-transactions-connections/04-offline-booking.spec.ts                                                     |

## Migration Status

| Item          | Old State              | New State                                         |
| ------------- | ---------------------- | ------------------------------------------------- |
| Booking tests | Untagged legacy titles | BOOK_01/BOOK_02 with @module-booking + round tags |
| Profile tests | Missing round tags     | Added @round-2 and @round-3 tags                  |
| Spec folders  | Flat specs folder      | Grouped into 4 business folders                   |

## Phase 2 Planning Artifacts

- Detailed 65-case plan: tests/e2e/docs/PHASE2_65_CASE_CHECKLIST.md
- System report matrix: tests/e2e/docs/System_Test_Report_AURA.md
- Regression process baseline: tests/e2e/docs/regression-guide-module-and-report.md

## Naming Rules

1. Keep testcase ID format as PREFIX_XX.
2. Keep one business behavior per testcase title.
3. Keep module tag and round tag in every testcase.
4. Keep module catalog and report synchronized whenever test IDs are added or renamed.
