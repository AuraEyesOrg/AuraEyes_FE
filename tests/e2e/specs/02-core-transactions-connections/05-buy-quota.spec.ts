import { expect, test } from '@playwright/test';
import { resetAndSeed } from '../helpers/test-backdoor.helper';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';

const PATIENT_EMAIL = process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com';
const DOCTOR_EMAIL =
  process.env.E2E_ROLE_EMAIL_OPHTHALMOLOGIST ?? 'ophthalmologist@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Wallet Top-up and Withdrawal Modules', () => {
  test.beforeEach(async ({ request }) => {
    await resetAndSeed(request);
  });

  test('@round-1 @module-wallet WALLET_01 - patient can open top-up modal and proceed to pay callback', async ({
    page,
  }) => {
    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/wallet',
    });

    await expect(page).toHaveURL(/\/patient\/wallet/);

    await page.route('**/wallets/deposit', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      const orderCode = `E2E-WALLET-${Date.now()}`;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            paymentUrl: `${new URL(page.url()).origin}/patient/wallet/payment-callback?orderCode=${orderCode}`,
            orderCode,
          },
        }),
      });
    });

    const topupBtn = page
      .getByRole('button', { name: /Top up|Top-up|Nạp/i })
      .first();
    await expect(topupBtn).toBeVisible();
    await topupBtn.click();

    await expect(
      page.getByRole('heading', { name: /Deposit|Top up|Nạp/i })
    ).toBeVisible();

    await page
      .locator('button')
      .filter({ hasText: /100,000|100000/ })
      .first()
      .click();
    await page.getByRole('button', { name: /PayOS/i }).first().click();
    await page
      .getByRole('button', { name: /Proceed to pay|Proceed|Thanh toán/i })
      .click();

    await expect(page).toHaveURL(/\/patient\/wallet\/payment-callback/);
  });

  test('@round-2 @module-wallet WALLET_02 - ophthalmologist can submit withdrawal request', async ({
    page,
  }) => {
    await bypassRecaptcha(page);
    await loginByUi(
      page,
      DOCTOR_EMAIL,
      DEFAULT_PASSWORD,
      /\/ophthalmologist\//,
      {
        postLoginPath: '/ophthalmologist/wallet',
      }
    );

    await expect(page).toHaveURL(/\/ophthalmologist\/wallet/);

    await page.route('**/wallets/withdraw-requests', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      const now = new Date().toISOString();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: `wd-${Date.now()}`,
            userId: 'e2e-user',
            walletId: 'e2e-wallet',
            amount: 120000,
            status: 'Pending',
            bankName: 'Vietinbank',
            bankAccountNumber: '123456789',
            accountHolderName: 'E2E Doctor',
            bankBin: '970415',
            contractNumber: 'AURA-OPH-E2E',
            note: 'E2E withdraw request',
            createdAt: now,
          },
        }),
      });
    });

    await page
      .getByRole('button', { name: /Create withdrawal request|withdraw/i })
      .click();

    await expect(
      page.getByRole('heading', { name: /Create Withdrawal Request/i })
    ).toBeVisible();

    await page.getByPlaceholder(/Example:\s*500000/i).fill('120000');
    await page.getByRole('button', { name: /Search and select bank/i }).click();
    await page.getByPlaceholder(/Search bank name or BIN/i).fill('970415');
    await page
      .getByRole('button', { name: /Vietinbank|CTG/i })
      .first()
      .click();

    await page.getByPlaceholder(/Enter account number/i).fill('123456789');
    await page.getByPlaceholder(/As stated in contract/i).fill('E2E Doctor');
    await page
      .getByPlaceholder(/Additional note for admin/i)
      .fill('E2E withdraw request');

    await page.getByRole('button', { name: /Submit Request/i }).click();

    await expect(
      page.getByText(/Withdrawal request submitted|submitted/i)
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: /Create Withdrawal Request/i })
    ).not.toBeVisible();
  });
});
