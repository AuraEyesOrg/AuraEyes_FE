import { expect, test } from '@playwright/test';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';
import { resetAndSeed } from '../helpers/test-backdoor.helper';

const DOCTOR_EMAIL =
  process.env.E2E_ROLE_EMAIL_OPHTHALMOLOGIST ?? 'ophthalmologist@gmail.com';
const ORG_ADMIN_EMAIL =
  process.env.E2E_ROLE_EMAIL_ORG_ADMIN ?? 'orgadmin@gmail.com';
const PATIENT_EMAIL = process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Flow 07 - Professional Network Collaboration', () => {
  test.beforeEach(async ({ request }) => {
    await resetAndSeed(request);
  });

  test('ophthalmologist creates a case presentation post with media', async ({
    browser,
  }) => {
    test.setTimeout(180_000);

    const postText = `E2E Case Presentation ${Date.now()}`;

    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await bypassRecaptcha(page);
    await loginByUi(
      page,
      DOCTOR_EMAIL,
      DEFAULT_PASSWORD,
      /\/ophthalmologist\//,
      {
        postLoginPath: '/network/feed',
      }
    );

    await expect(page).toHaveURL(/\/network\/feed/);

    const composer = page.getByPlaceholder(
      'Share insights with your network...'
    );
    await composer.fill(postText);

    await page.getByRole('button', { name: 'Case Presentation' }).click();

    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles({
        name: 'case-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from(''),
      });

    await page
      .getByText(
        /Tôi cam kết hình ảnh đính kèm không chứa thông tin định danh của bệnh nhân/i
      )
      .locator('..')
      .locator('input[type="checkbox"]')
      .check();

    await page
      .getByText(/I confirm this case is anonymized/i)
      .locator('..')
      .locator('input[type="checkbox"]')
      .check();

    await page.getByRole('button', { name: /^Post$/ }).click();

    await expect(page.getByText(postText)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Case Presentation/i).first()).toBeVisible();

    await ctx.close();
  });

  test('organisation creates announcement and comment on post detail', async ({
    browser,
  }) => {
    test.setTimeout(180_000);

    const postText = `E2E Announcement ${Date.now()}`;
    const commentText = `E2E comment ${Date.now()}`;

    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await bypassRecaptcha(page);
    await loginByUi(
      page,
      ORG_ADMIN_EMAIL,
      DEFAULT_PASSWORD,
      /\/organisation\//,
      {
        postLoginPath: '/network/feed',
      }
    );

    await expect(page).toHaveURL(/\/network\/feed/);

    await page
      .getByPlaceholder('Share insights with your network...')
      .fill(postText);
    await page.getByRole('button', { name: 'Announcement' }).click();
    await page.getByRole('button', { name: /^Post$/ }).click();

    await expect(page.getByText(postText)).toBeVisible({ timeout: 20_000 });

    const detailLink = page.locator('a[href*="/network/post/"]').first();
    await detailLink.click();

    await expect(page).toHaveURL(/\/network\/post\//);

    await page.getByPlaceholder('Add a comment...').fill(commentText);
    await page
      .getByRole('button', { name: /^Post$/ })
      .last()
      .click();

    await expect(page.getByText(commentText)).toBeVisible({ timeout: 20_000 });

    await ctx.close();
  });

  test('patient is blocked from accessing /network/feed', async ({
    browser,
  }) => {
    test.setTimeout(90_000);

    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/dashboard',
    });

    await page.goto('/network/feed');

    await expect(page).not.toHaveURL(/\/network\//);
    await expect(page).toHaveURL(/\/(patient|$)/);

    await ctx.close();
  });
});
