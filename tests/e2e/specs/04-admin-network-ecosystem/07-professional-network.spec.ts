import { expect, test } from '@playwright/test';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';
import { resetAndSeed } from '../helpers/test-backdoor.helper';

const DOCTOR_EMAIL =
  process.env.E2E_ROLE_EMAIL_OPHTHALMOLOGIST ?? 'ophthalmologist@gmail.com';
const ORG_ADMIN_EMAIL =
  process.env.E2E_ROLE_EMAIL_ORG_ADMIN ?? 'orgadmin@gmail.com';
const PATIENT_EMAIL = process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Professional Network Post, Comment, Reaction, Reply Modules', () => {
  test.beforeEach(async ({ request }) => {
    await resetAndSeed(request);
  });

  test('@round-1 @module-network NETWORK_01 - ophthalmologist creates a case presentation post with media', async ({
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

  test('@round-2 @module-network NETWORK_02 - organisation can comment, react, and reply on a network post', async ({
    browser,
  }) => {
    test.setTimeout(180_000);

    const postText = `E2E Announcement ${Date.now()}`;
    const commentText = `E2E comment ${Date.now()}`;
    const replyText = `E2E reply ${Date.now()}`;

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

    const reactionTrigger = page
      .locator('article')
      .first()
      .locator(
        'button:has(svg.lucide-lightbulb), button:has(svg.lucide-thumbs-up)'
      )
      .first();
    await reactionTrigger.hover();
    await page.locator('button[title="Agree"]').first().click();

    await page.getByPlaceholder('Add a comment...').fill(commentText);
    await page
      .getByRole('button', { name: /^Post$/ })
      .last()
      .click();

    await expect(page.getByText(commentText)).toBeVisible({ timeout: 20_000 });

    const postedComment = page
      .locator('div.hover-animation', { hasText: commentText })
      .first();
    await postedComment.getByRole('button', { name: /^Reply$/i }).click();
    await page.getByPlaceholder(/Reply to/i).fill(replyText);
    await postedComment.locator('button:has(svg.lucide-send)').click();

    await expect(page.getByText(replyText)).toBeVisible({ timeout: 20_000 });

    await ctx.close();
  });

  test('@round-3 @module-network NETWORK_03 - patient is blocked from accessing /network/feed', async ({
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
