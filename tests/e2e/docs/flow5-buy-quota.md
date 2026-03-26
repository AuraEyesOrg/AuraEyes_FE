# AURA - AI Quota Purchase for Screening Service Flow

## 1. Objective

- Verify patient purchases AI screening quota from UI and system updates quota and wallet transaction.

## 2. Source of Truth

- FE routes/pages/components:
  - `/patient/screening/new`
  - `src/features/patient/components/QuotaBadge.tsx`
  - `src/features/patient/components/TopUpQuotaModal.tsx`
  - `src/features/patient/api/quota.api.ts`
  - `src/features/patient/hooks/use-quota.ts`
- BE endpoints/services:
  - `POST /api/quotas/buy`
  - quota/wallet updates handled by quota services and wallet transaction records

## 3. Business State Machine

- Patient quota:
  - `PurchasedAiQuota = n` -> `n + packageAmount`
- Quota exhaustion gate:
  - When `UsedAiQuota = 3` and `PurchasedAiQuota = 0`, patient cannot run `Start Screening`.
  - After successful purchase, patient can continue AI screening flow.
- Wallet:
  - balance decreases by package price
  - new `WalletTransactions` row recorded

## 4. UI Journey (Main)

1. Patient logs in.
2. Open `/patient/screening/new`.
3. Upload image and click `Start AI Analysis` -> `/patient/screening/analyze`.
4. If quota exhausted (`UsedAiQuota = 3`), UI shows out-of-quota warning and blocks screening.
5. Click `Purchase Quota` / `Mua lượt`.
6. In purchase modal, pick package and confirm.
7. Success message appears, quota increases, and screening can continue.

## 5. Allowed Setup / Bypass

- SQL setup for wallet minimum balance and before/after assertions.
- reCAPTCHA bypass in test:
  - mock `**/recaptcha/api2/userverify*`
  - override `window.grecaptcha`

## 6. Assertions

- Purchase success toast/message visible.
- `PurchasedAiQuota` increases.
- Exhausted state is visible before purchase when `UsedAiQuota = 3` and `PurchasedAiQuota = 0`.
- Wallet balance decreases after purchase.
- `WalletTransactions` count increases.

## 7. Risks / Notes

- Package labels can vary; selector should match regex `Mua \d+ luot`.
