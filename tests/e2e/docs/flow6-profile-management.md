# AURA - Profile Management Flow

## 1. Objective

- Verify patient can update profile data and avatar from /patient/profile.
- Verify change-password flow for both success and negative validation.

## 2. Source of Truth

- FE routes/pages/components:
  - /patient/profile
  - src/features/patient/pages/profile.tsx
  - src/features/patient/schemas/profile.schema.ts
  - src/features/patient/hooks/useProfile.ts
- BE endpoints/services:
  - GET /api/patient/profile
  - PUT /api/patient/profile
  - POST /api/patient/profile/avatar
  - POST /api/patient/profile/change-password (or equivalent profile password endpoint)

## 3. Hybrid AAA Test Design

- Arrange (Backdoor/API + DB):
  - POST /api/test-backdoor/reset-and-seed
  - Magic login/auth fixture for patient account
  - Optional SQL baseline setup for patient fullName/phone fields
- Act (UI):
  - Login from /login
  - Navigate to /patient/profile
  - Update personal information, upload avatar, submit password change
- Assert (UI + DB):
  - UI success/error message states
  - DB row updated for profile fields
  - Password change negative branch rejected

## 4. UI Journey (Main)

1. Login as patient.
2. Open /patient/profile.
3. Click Edit in Personal Information card.
4. Update Full Name and Phone Number.
5. Click Save and verify success state.
6. Click camera button to open Update Profile Photo modal.
7. Upload image and click Save Photo.
8. Open Change Password modal from Security Settings.
9. Submit with wrong current password for negative path.

## 5. Backdoor and Data Setup

- Required:
  - POST /api/test-backdoor/reset-and-seed
  - GET /api/test-backdoor/auth/magic-login?email=patient@gmail.com
- Optional DB setup:
  - Update baseline patient profile data before UI actions.

## 6. Recommended Locators

- Heading:
  - getByRole('heading', { name: /My Profile/i })
- Edit/Save profile:
  - getByRole('button', { name: 'Edit' })
  - locator('input[name="fullName"]')
  - locator('input[name="phone"]')
  - getByRole('button', { name: /^Save$/ })
- Avatar:
  - locator('button:has(svg.lucide-camera)')
  - locator('input[type="file"][accept="image/*"]')
  - getByRole('button', { name: /Save Photo/i })
- Change password:
  - getByRole('button', { name: 'Change' }).first()
  - getByLabel(/Current Password/i)
  - getByLabel(/New Password/i)
  - getByLabel(/Confirm New Password/i)
  - getByRole('button', { name: /Change Password/i })

## 7. Assertions

- Profile update success banner/toast is shown.
- Updated fullName/phone values are visible after reload.
- Avatar upload success state is shown.
- Wrong current password is blocked and error feedback is shown.

## 8. Risks / Notes

- Profile page has multiple buttons with similar text (Change/Manage), use narrow scope selectors.
- Avatar uploader accepts only image/\* and max 5MB; use small png/jpg in E2E.
- Password negative test should assert explicit error, not only modal visibility.
