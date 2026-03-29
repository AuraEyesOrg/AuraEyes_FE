import { expect, test } from '@playwright/test';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';
import { query } from '../helpers/postgres';

const PATIENT_EMAIL = process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Flow 05 - AI Quota Purchase for Screening Service', () => {
  test('patient purchases additional ai quota from screening service and quota is updated', async ({
    browser,
  }) => {
    test.setTimeout(180_000);

    const patientRows = await query<{
      PatientUserId: string;
      PatientId: string;
    }>(
      `SELECT p."UserId" AS "PatientUserId", p."Id" AS "PatientId"
       FROM "Patients" p
       WHERE p."UserId" = (SELECT "Id" FROM "AspNetUsers" WHERE "Email" = $1)
       LIMIT 1`,
      [PATIENT_EMAIL]
    );
    expect(patientRows.length).toBe(1);

    const { PatientUserId, PatientId } = patientRows[0];

    await query(`UPDATE "Wallets" SET "Balance" = 800000 WHERE "UserId" = $1`, [
      PatientUserId,
    ]);

    // Force exhausted free quota state: UsedAiQuota = 3 and no purchased quota.
    await query(
      `UPDATE "Patients" SET "UsedAiQuota" = 3, "PurchasedAiQuota" = 0 WHERE "Id" = $1`,
      [PatientId]
    );

    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/screening/new',
    });

    await expect(
      page.getByRole('button', { name: /Start AI Analysis/i })
    ).toBeVisible({ timeout: 15_000 });

    const imageBuffer = Buffer.from('');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'fundus-quota.png',
      mimeType: 'image/png',
      buffer: imageBuffer,
    });

    await page.getByRole('button', { name: /Start AI Analysis/i }).click();
    await expect(page).toHaveURL(/\/patient\/screening\/analyze/);

    await expect(
      page.getByText(/Out of quota|Bạn đã dùng hết lượt AI/i)
    ).toBeVisible({ timeout: 20_000 });

    const quotaPurchaseBtn = page
      .locator('button', { hasText: /Mua|Buy|Quota|lượt/i })
      .first();
    if ((await quotaPurchaseBtn.count()) > 0) {
      await quotaPurchaseBtn.click();
    } else {
      await page.goto('/patient/screening/new');
      await page
        .locator('button', { hasText: /Mua|Buy|Quota|lượt/i })
        .first()
        .click();
    }

    await expect(page.locator('[role="dialog"]')).toBeVisible({
      timeout: 15_000,
    });

    const packageBtn = page
      .locator('button, div[role="button"]', { hasText: /\d+\s*lượt|\d+/i })
      .first();
    await packageBtn.click();

    await page
      .locator('button', { hasText: /Confirm|Pay|Purchase|Mua/i })
      .first()
      .click();
    await expect(page.getByText(/success|thành công|purchased/i)).toBeVisible({
      timeout: 20_000,
    });

    const quotaAfterBuy = await query<{
      UsedAiQuota: number;
      PurchasedAiQuota: number;
    }>(
      `SELECT "UsedAiQuota", "PurchasedAiQuota" FROM "Patients" WHERE "Id" = $1`,
      [PatientId]
    );

    expect(quotaAfterBuy[0].PurchasedAiQuota).toBeGreaterThan(0);

    await ctx.close();
  });
});
