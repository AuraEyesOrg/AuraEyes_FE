import { expect, test } from '@playwright/test';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';
import { resetAndSeed } from '../helpers/test-backdoor.helper';
import { query } from '../helpers/postgres';

const PATIENT_EMAIL = process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Flow 06 - Profile Management (Standardized)', () => {
  test.beforeEach(async ({ request }) => {
    await resetAndSeed(request);
  });

  test('@round-2 @module-profile PROFILE_01 - patient updates profile information and avatar from /patient/profile', async ({
    browser,
  }) => {
    test.setTimeout(180_000);

    const updatedName = `Patient E2E ${Date.now()}`;
    const updatedPhone = `09${Date.now().toString().slice(-8)}`;

    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/profile',
    });

    await expect(
      page.getByRole('heading', { name: /My Profile/i })
    ).toBeVisible();

    // Act: update profile fields.
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.locator('input[name="fullName"]').fill(updatedName);
    await page.locator('input[name="phone"]').fill(updatedPhone);
    await page.getByRole('button', { name: /^Save$/ }).click();

    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible({
      timeout: 15_000,
    });

    // Act: update avatar.
    await page.locator('button:has(svg.lucide-camera)').first().click();
    await expect(
      page.getByRole('heading', { name: /Update Profile Photo/i })
    ).toBeVisible();

    await page.locator('input[type="file"][accept="image/*"]').setInputFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from(''),
    });

    await page.getByRole('button', { name: /Save Photo/i }).click();
    await expect(
      page.getByText(/Profile photo updated successfully/i)
    ).toBeVisible({
      timeout: 15_000,
    });

    // Assert via DB for profile fields.
    const rows = await query<{ FullName: string; PhoneNumber: string | null }>(
      'SELECT "FullName", "PhoneNumber" FROM "AspNetUsers" WHERE "Email" = $1 LIMIT 1',
      [PATIENT_EMAIL]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].FullName).toBe(updatedName);
    expect(rows[0].PhoneNumber ?? '').toContain(updatedPhone);

    await ctx.close();
  });

  test('@round-3 @module-profile PROFILE_02 - patient cannot change password with wrong current password', async ({
    browser,
  }) => {
    test.setTimeout(120_000);

    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/profile',
    });

    await page.getByRole('button', { name: 'Change' }).first().click();
    await expect(
      page.getByRole('heading', { name: /Change Password/i })
    ).toBeVisible();

    await page.getByLabel(/Current Password/i).fill('WrongPassword123!');
    await page.getByLabel(/New Password/i).fill('NewPassword123!');
    await page.getByLabel(/Confirm New Password/i).fill('NewPassword123!');
    await page.getByRole('button', { name: /^Change Password$/ }).click();

    await expect(
      page.getByText(/Failed to change password|Current password/i)
    ).toBeVisible({ timeout: 15_000 });

    await ctx.close();
  });
});
