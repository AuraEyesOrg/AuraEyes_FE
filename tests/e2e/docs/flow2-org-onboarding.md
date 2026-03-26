# AURA - Organisation Onboarding & Contract Activation Flow

## 1. Objective

- Verify onboarding lifecycle from pending request approval to contract activation.
- Confirm two-level approval chain:
  - Step 1: System admin approves onboarding request.
  - Step 2: Organisation uploads signed contract and system admin verifies contract.

## 2. Source of Truth

- FE routes:
  - `/system-admin/organisations`
  - `/organisation/contract`
  - `/system-admin/contracts`
  - `/organisation/dashboard`
- FE pages/components:
  - `src/features/system-admin/pages/organisations.tsx`
  - `src/features/organisation/pages/contract.tsx`
  - `src/features/system-admin/pages/contracts.tsx`
- BE endpoints/services:
  - `POST /api/system-admin/organisations/onboarding-requests/{id}/approve`
  - Contract lifecycle under `/api/system-admin/contracts/*`
  - `OrganisationOnboardingService.ApproveAsync(...)`

## 3. Business State Machine

- `OrganisationOnboardingRequest.Status`:
  - `Pending` -> `Approved` or `Rejected`
- Contract status (from admin/org contract modules):
  - `PendingSignature` -> `PendingVerification` -> `Active`

## 4. UI Journey (Main)

1. Guest/org contact submits cooperation information outside the new FE flow (public form/channel); system has `OrganisationOnboardingRequest` in `Pending`.
2. System admin opens `/system-admin/organisations` and clicks `Xác nhận & cấp tài khoản`.
3. API response returns `orgAdminEmail` + `temporaryPassword` and email is sent.
4. Organisation admin signs in and is gated to `/organisation/contract` while contract is not active.
5. Organisation uploads signed contract file on `/organisation/contract`.
6. System admin opens `/system-admin/contracts` and clicks `Xác nhận` (verify contract).
7. Organisation signs in again and lands at `/organisation/dashboard` (contract gate cleared).

## 5. Allowed Setup / Bypass

- SQL setup/assertions only for deterministic test data where needed.
- reCAPTCHA bypass in test:
  - mock `**/recaptcha/api2/userverify*`
  - override `window.grecaptcha` client-side

## 6. Assertions

- Approved API payload includes non-empty temporary credentials.
- Organisation login redirects to `/organisation/contract` before activation.
- Contract upload produces pending verification state.
- Admin contract verification updates row state to active/effective.
- Post-verification organisation login redirects to dashboard.

## 7. Risks / Notes

- UI text may differ by locale; selectors prefer role/placeholder/URL/state.
- Contract verification action can appear in row action or detail modal.
