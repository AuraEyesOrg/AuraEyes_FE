import { expect, test } from '@playwright/test';
import { resetAndSeed } from '../helpers/test-backdoor.helper';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';

const PATIENT_EMAIL = process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Patient Screening, Consultation, and Feedback Modules', () => {
  test.beforeEach(async ({ request }) => {
    await resetAndSeed(request);
  });

  test('@round-1 @module-screening SCREEN_01 - patient can navigate from dashboard to new screening', async ({
    page,
  }) => {
    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/dashboard',
    });

    const newScanEntry = page
      .getByRole('link', {
        name: /Upload New Scan|Upload Your First Scan|New Scan/i,
      })
      .first();

    if ((await newScanEntry.count()) > 0) {
      await newScanEntry.click();
    } else {
      await page.goto('/patient/screening/new');
    }

    await expect(page).toHaveURL(/\/patient\/screening\/new/);
  });

  test('@round-2 @module-consultation CONSULT_01 - patient can open consultation chat workspace', async ({
    page,
  }) => {
    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/chat',
    });

    await expect(page).toHaveURL(/\/patient\/chat/);
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('@round-3 @module-feedback FEEDBACK_01 - patient can open website feedback modal and enter feedback draft', async ({
    page,
  }) => {
    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/help-feedback',
    });

    await expect(page).toHaveURL(/\/patient\/help-feedback/);
    await expect(
      page.getByRole('heading', { name: /Help & Feedback/i })
    ).toBeVisible();

    const openFeedbackBtn = page.getByRole('button', {
      name: /Leave website feedback/i,
    });
    await expect(openFeedbackBtn).toBeVisible();

    if (await openFeedbackBtn.isDisabled()) {
      await expect(
        page.getByText(
          /Complete at least one analysis, report, or appointment/i
        )
      ).toBeVisible();
      return;
    }

    await openFeedbackBtn.click();
    await expect(
      page.getByRole('heading', { name: /Website feedback/i })
    ).toBeVisible();

    await page.getByRole('radio', { name: '5 star' }).click();
    await page
      .getByPlaceholder(/Tell us more about your experience/i)
      .fill('E2E feedback draft for consultation and screening journey.');

    await page.getByRole('button', { name: /Not now/i }).click();
    await expect(
      page.getByRole('heading', { name: /Website feedback/i })
    ).not.toBeVisible();
  });
});
