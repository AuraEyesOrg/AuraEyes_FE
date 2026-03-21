import { expect, type Page } from '@playwright/test';

async function completeRecaptcha(page: Page): Promise<void> {
  await page.waitForSelector('iframe[title*="reCAPTCHA"]', { timeout: 30_000 });

  const recaptchaFrame = page.frameLocator('iframe[title*="reCAPTCHA"]');
  const checkbox = recaptchaFrame.locator('#recaptcha-anchor');

  await checkbox.click({ timeout: 30_000 });
  await expect(checkbox).toHaveAttribute('aria-checked', 'true', {
    timeout: 30_000,
  });
}

export async function bypassRecaptcha(page: Page): Promise<void> {
  // Keep the exact bypass route requested for E2E stability.
  await page.route('**/*recaptcha/api2/userverify*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        score: 0.9,
        action: 'submit',
      }),
    });
  });

  await page.route('**/*recaptcha/api/siteverify*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.addInitScript(() => {
    const token = 'mock-recaptcha-token';

    (window as any).grecaptcha = {
      ready: (cb: any) => cb(),
      execute: async () => token,
      getResponse: () => token,
      reset: () => undefined,
      render: (_container: unknown, params?: { callback?: (value: string) => void }) => {
        if (params?.callback) {
          setTimeout(() => params.callback?.(token), 0);
        }
        return 0;
      },
    };
  });
}

export async function loginByUi(
  page: Page,
  email: string,
  password: string,
  expectedUrlPattern: RegExp,
  options?: {
    postLoginPath?: string;
  },
): Promise<void> {
  await page.goto('/login');

  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);

  const recaptchaIframe = page.locator('iframe[title*="reCAPTCHA"]');
  const hasRealRecaptcha = (await recaptchaIframe.count()) > 0;
  if (hasRealRecaptcha) {
    await completeRecaptcha(page).catch(() => undefined);
  }

  await page.getByRole('button', { name: /Secure Sign In|Signing In/i }).click();

  try {
    await expect(page).toHaveURL(expectedUrlPattern, { timeout: 15_000 });
    if (options?.postLoginPath) {
      await page.goto(options.postLoginPath);
    }
    return;
  } catch {
    const recaptchaError = page.getByText(/Please complete the reCAPTCHA verification/i);
    if ((await recaptchaError.count()) > 0) {
      await completeRecaptcha(page);
      await page.getByRole('button', { name: /Secure Sign In|Signing In/i }).click();
    }
    await expect(page).toHaveURL(expectedUrlPattern, { timeout: 15_000 });
    if (options?.postLoginPath) {
      await page.goto(options.postLoginPath);
    }
  }
}
