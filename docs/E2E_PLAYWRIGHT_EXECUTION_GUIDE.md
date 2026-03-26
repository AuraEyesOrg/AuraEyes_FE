# E2E Playwright Execution Guide

## 1) Required Environment

Create `.env.test` in FE root with:

```bash
# Frontend URL for Playwright navigation
E2E_FE_BASE_URL=http://localhost:3000

# Backend URL for backdoor + API arrange/assert steps
E2E_API_BASE_URL=http://localhost:5101

# Required by test backdoor endpoints
E2E_BACKDOOR_KEY=your_test_backdoor_key

# PostgreSQL used by backend (for direct DB assertions)
E2E_DB_CONNECTION_STRING=Host=localhost;Port=5432;Database=AuraEyes;Username=postgres;Password=postgres

# Optional explicit role emails
E2E_ROLE_EMAIL_PATIENT=patient@gmail.com
E2E_ROLE_EMAIL_OPHTHALMOLOGIST=ophthalmologist@gmail.com
E2E_ROLE_EMAIL_ORG_ADMIN=orgadmin@gmail.com
E2E_ROLE_EMAIL_SYSTEM_ADMIN=systemadmin@gmail.com
```

Also ensure backend runs in `Test` environment so `api/test-backdoor/*` is enabled.

## 2) Default Test Accounts

All 4 seeded users are created by backend `reset-and-seed` with password:

- `systemadmin@gmail.com` / `Password123!`
- `orgadmin@gmail.com` / `Password123!`
- `ophthalmologist@gmail.com` / `Password123!`
- `patient@gmail.com` / `Password123!`

## 3) Auth Helper Flow (`injectAuthState`)

E2E authentication uses 2 stages:

1. `global-auth.setup.ts` calls backdoor `auth/magic-login` and saves role payloads into `tests/.auth/*.json`.
2. Each spec calls `injectAuthState(page, roleName)` from `tests/e2e/helpers/auth.helper.ts`.

`injectAuthState` writes localStorage keys expected by FE runtime:

- `token`
- `refreshToken`
- `user`

This avoids UI-login friction and keeps E2E deterministic while still testing real FE screens and backend state changes.

## 4) Run Commands

From FE root:

```bash
# Install deps (if needed)
npm install

# Run all e2e tests in headed UI mode
npx playwright test --ui

# Run all e2e tests headless
npx playwright test

# Run one specific spec
npx playwright test tests/e2e/specs/03-book-appointment-slot.spec.ts
```

## 5) Implemented Flow Files

- `tests/e2e/specs/01-register-email-verification.spec.ts`
- `tests/e2e/specs/02-buy-ai-quota.spec.ts`
- `tests/e2e/specs/03-book-appointment-slot.spec.ts`
- `tests/e2e/specs/04-accept-consultation-session.spec.ts`
- `tests/e2e/specs/05-complete-ai-screening.spec.ts`
