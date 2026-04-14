import { expect, test } from '@playwright/test';
import { injectAuthState } from '../helpers/auth.helper';
import { resetAndSeed } from '../helpers/test-backdoor.helper';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';

const SYSTEM_ADMIN_EMAIL =
  process.env.E2E_ROLE_EMAIL_SYSTEM_ADMIN ?? 'systemadmin@gmail.com';
const ORG_ADMIN_EMAIL =
  process.env.E2E_ROLE_EMAIL_ORG_ADMIN ?? 'orgadmin@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Flow 02 - Organisation Onboarding and Contract Activation (Split)', () => {
  test.beforeEach(async ({ request }) => {
    await resetAndSeed(request);
  });

  test('@round-1 @module-auth AUTH_06 - system admin can open organisation onboarding list', async ({
    page,
  }) => {
    await page.goto('/login');
    await injectAuthState(page, 'SystemAdmin');
    await page.goto('/system-admin/organisations');

    await expect(
      page.getByRole('heading', { name: /Organisation|Onboarding/i })
    ).toBeVisible();
  });

  test('@round-1 @module-econtract ECONTRACT_01 - org admin can open organisation contract page', async ({
    page,
  }) => {
    await page.goto('/login');
    await injectAuthState(page, 'OrgAdmin');
    await page.goto('/organisation/contract');

    await expect(
      page.getByText(/Hợp đồng tổ chức|Contract/i).first()
    ).toBeVisible();
  });

  test('@round-2 @module-auth AUTH_07 - org login lands on organisation dashboard by default', async ({
    page,
  }) => {
    await bypassRecaptcha(page);
    await loginByUi(
      page,
      ORG_ADMIN_EMAIL,
      DEFAULT_PASSWORD,
      /\/organisation\//,
      {
        postLoginPath: '/organisation/dashboard',
      }
    );

    await expect(page).toHaveURL(/\/organisation\/dashboard/);
  });

  test('@round-2 @module-auth AUTH_08 - org routes are no longer forced to contract gate', async ({
    page,
  }) => {
    await page.goto('/login');
    await injectAuthState(page, 'OrgAdmin');

    await page.evaluate(() => {
      const rawUser = window.localStorage.getItem('user');
      if (!rawUser) return;
      const user = JSON.parse(rawUser) as { contractStatus?: string | null };
      user.contractStatus = 'PendingSignature';
      window.localStorage.setItem('user', JSON.stringify(user));
    });

    await page.goto('/organisation/patients');
    await expect(page).not.toHaveURL(/\/organisation\/contract/);
    await expect(page).toHaveURL(/\/organisation\/patients/);
  });

  test('@round-3 @module-econtract ECONTRACT_02 - system admin can open contract management page', async ({
    page,
  }) => {
    await bypassRecaptcha(page);
    await loginByUi(
      page,
      SYSTEM_ADMIN_EMAIL,
      DEFAULT_PASSWORD,
      /\/system-admin\//,
      {
        postLoginPath: '/system-admin/contracts',
      }
    );

    await expect(page).toHaveURL(/\/system-admin\/contracts/);
    await expect(
      page.getByRole('heading', { name: /Contract|Hợp đồng/i })
    ).toBeVisible();
  });
});
