# AURA Regression Guide (Module and Report)

## 1. Purpose

This guide defines regression checks for module-split E2E documentation.

Artifacts in scope:

- tests/e2e/specs/\*.spec.ts
- tests/e2e/docs/System_Test_Report_AURA.md
- tests/e2e/docs/MODULE_TEST_CATALOG_AURA.md

Goal:

- Keep module IDs, spec tags, and report content synchronized.

## 2. Module Baseline

| Module                 | Prefix                    | Required tag          |
| ---------------------- | ------------------------- | --------------------- |
| Authentication         | AUTH\_                    | @module-auth          |
| E-Contract             | ECONTRACT\_               | @module-econtract     |
| Profile Management     | PROFILE\_                 | @module-profile       |
| Patient Screening      | SCREEN\_                  | @module-screening     |
| Consultation Chat      | CONSULT\_                 | @module-consultation  |
| Patient Feedback       | FEEDBACK\_                | @module-feedback      |
| Wallet Operations      | WALLET\_                  | @module-wallet        |
| Organisation Screening | ORG*PATIENT*, ORG*SCREEN* | @module-org-screening |
| Professional Network   | NETWORK\_                 | @module-network       |
| Booking                | BOOK\_                    | @module-booking       |

## 3. Trigger Conditions

Run this checklist when:

1. New E2E tests are added or removed.
2. Test title IDs are renamed.
3. Module tags or round tags are edited.
4. System test report is updated.

## 4. Validation Checklist

1. Each module testcase ID in report exists in a real spec title.
2. Prefix matches module name.
3. Round tags remain consistent with report matrix.
4. Deprecated flow docs are not reintroduced.
5. Legacy tests without module tags are listed as migration items.

## 5. Recommended Commands

1. npm run test:e2e:module:auth
2. npm run test:e2e:module:screening
3. npm run test:e2e:module:consultation
4. npm run test:e2e:module:feedback
5. npm run test:e2e:module:wallet
6. npm run test:e2e:module:booking
7. npm run test:e2e:module:org-screening
8. npm run test:e2e:module:network
9. npm run test:e2e:round1
10. npm run test:e2e:round2
11. npm run test:e2e:round3

## 6. Exit Criteria

Regression update is complete when:

1. Report totals match spec inventory.
2. Module map is up to date.
3. No legacy flow narrative remains in docs.
4. Open execution blockers are clearly documented.
