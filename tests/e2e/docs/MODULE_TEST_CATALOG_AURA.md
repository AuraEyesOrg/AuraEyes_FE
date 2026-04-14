# AURA Module Test Catalog

## Metadata

| Field            | Value           |
| ---------------- | --------------- |
| Product Metadata | AURA            |
| Catalog Type     | Module Split    |
| Source           | tests/e2e/specs |
| Last Updated     | 2026-04-13      |

## Module to Spec Mapping

| No  | Module                     | Prefix                    | Tag                   | Spec file                                                           |
| --- | -------------------------- | ------------------------- | --------------------- | ------------------------------------------------------------------- |
| 1   | Authentication             | AUTH\_                    | @module-auth          | 01-doctor-registration-full-flow.spec.ts, 02-org-onboarding.spec.ts |
| 2   | E-Contract                 | ECONTRACT\_               | @module-econtract     | 02-org-onboarding.spec.ts                                           |
| 3   | Profile Management         | PROFILE\_                 | @module-profile       | 06-profile-management.spec.ts                                       |
| 4   | Patient Screening          | SCREEN\_                  | @module-screening     | 03-patient-screening-and-consultation-session.spec.ts               |
| 5   | Consultation Chat          | CONSULT\_                 | @module-consultation  | 03-patient-screening-and-consultation-session.spec.ts               |
| 6   | Patient Feedback           | FEEDBACK\_                | @module-feedback      | 03-patient-screening-and-consultation-session.spec.ts               |
| 7   | Wallet Operations          | WALLET\_                  | @module-wallet        | 05-buy-quota.spec.ts                                                |
| 8   | Organisation Screening     | ORG*PATIENT*, ORG*SCREEN* | @module-org-screening | 08-organisation-patient-screening.spec.ts                           |
| 9   | Professional Network       | NETWORK\_                 | @module-network       | 07-professional-network.spec.ts                                     |
| 10  | Booking (legacy migration) | LEGACY*BOOK*              | no module tag yet     | 04-offline-booking.spec.ts                                          |

## Migration Backlog

| Item           | Current state                    | Target state                              |
| -------------- | -------------------------------- | ----------------------------------------- |
| Booking test 1 | Untagged test title              | Add BOOK_01 + @module-booking + round tag |
| Booking test 2 | Untagged test title              | Add BOOK_02 + @module-booking + round tag |
| Profile tests  | Have module tag but no round tag | Add @round-2 or @round-3 by strategy      |

## Naming Rules

1. Keep testcase ID as PREFIX_XX.
2. Keep one business behavior per testcase title.
3. Keep module tag and round tag in every migrated testcase.
4. Do not use old flow naming in new documents.
