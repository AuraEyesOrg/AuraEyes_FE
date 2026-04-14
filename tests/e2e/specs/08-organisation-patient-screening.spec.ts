import { expect, test } from '@playwright/test';
import { resetAndSeed } from '../helpers/test-backdoor.helper';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';

const ORG_ADMIN_EMAIL =
  process.env.E2E_ROLE_EMAIL_ORG_ADMIN ?? 'orgadmin@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Organisation Patient Creation and Screening Modules', () => {
  test.beforeEach(async ({ request }) => {
    await resetAndSeed(request);
  });

  test('@round-1 @module-org-screening ORG_PATIENT_01 - organisation can create walk-in patient', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    await bypassRecaptcha(page);
    await loginByUi(
      page,
      ORG_ADMIN_EMAIL,
      DEFAULT_PASSWORD,
      /\/organisation\//,
      {
        postLoginPath: '/organisation/patients',
      }
    );

    await expect(page).toHaveURL(/\/organisation\/patients/);

    const uniqueSuffix = Date.now().toString().slice(-6);
    const patientName = `Walkin E2E ${uniqueSuffix}`;

    await page.getByRole('button', { name: /Walk-in Patient/i }).click();
    await expect(
      page.getByRole('heading', { name: /Create Walk-in Patient/i })
    ).toBeVisible();

    await page
      .getByPlaceholder('e.g. 001099000000')
      .fill(`001099${uniqueSuffix}`);
    await page.getByPlaceholder('e.g. John Doe').fill(patientName);
    await page.locator('input[type="date"]').fill('1990-01-01');
    await page.getByPlaceholder('+1 (555) 000-0000').fill(`090${uniqueSuffix}`);

    await page.getByRole('button', { name: /Create Patient/i }).click();

    await expect(
      page.getByText(/Walk-in patient created successfully/i)
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole('heading', { name: /Create Walk-in Patient/i })
    ).not.toBeVisible();

    const createdPatientRow = page
      .locator('tr', { hasText: patientName })
      .first();
    await expect(createdPatientRow).toBeVisible({ timeout: 20_000 });
  });

  test('@round-2 @module-org-screening ORG_SCREEN_01 - organisation can open screening flow for selected patient', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    await bypassRecaptcha(page);
    await loginByUi(
      page,
      ORG_ADMIN_EMAIL,
      DEFAULT_PASSWORD,
      /\/organisation\//,
      {
        postLoginPath: '/organisation/patients',
      }
    );

    await expect(page).toHaveURL(/\/organisation\/patients/);

    const firstScreenNowBtn = page
      .getByRole('button', { name: /Screen Now/i })
      .first();
    await expect(firstScreenNowBtn).toBeVisible({ timeout: 20_000 });
    await firstScreenNowBtn.click();

    await expect(page).toHaveURL(/\/organisation\/screening\?patientId=/);
    await expect(
      page.getByRole('heading', { name: /AI Retinal Screening/i })
    ).toBeVisible({ timeout: 15_000 });
  });
});
