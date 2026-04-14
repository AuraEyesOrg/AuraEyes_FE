import { expect, test, type Locator, type Page } from '@playwright/test';
import { injectAuthState } from '../helpers/auth.helper';
import { resetAndSeed } from '../helpers/test-backdoor.helper';

async function slowType(
  locator: Locator,
  value: string,
  delay = 70
): Promise<void> {
  await locator.click();
  await locator.fill('');
  await locator.type(value, { delay });
}

async function setFakeCredentialUploads(page: Page): Promise<void> {
  await page.getByTestId('degree-file-0').setInputFiles({
    name: 'degree.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.alloc(0),
  });

  await page.getByTestId('certificate-file-0').setInputFiles({
    name: 'license.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.alloc(0),
  });
}

test.describe('Flow 01 - Ophthalmologist Onboarding and Verification (Split)', () => {
  test.beforeEach(async ({ request }) => {
    await resetAndSeed(request);
  });

  test('@round-1 @module-auth AUTH_01 - submit doctor onboarding with valid required fields', async ({
    page,
  }) => {
    const doctorEmail = `dr_auth01_${Date.now()}@gmail.com`;

    await page.goto('/register-doctor');
    await expect(
      page.getByRole('heading', { name: 'Doctor Registration' })
    ).toBeVisible();

    await slowType(page.getByPlaceholder('Dr. John Smith'), 'Dr. Auth 01');
    await slowType(page.getByPlaceholder('dr.smith@hospital.org'), doctorEmail);
    await slowType(page.getByPlaceholder('+84 (123) 456-7890'), '0987654321');
    await slowType(
      page.getByPlaceholder('Minimum 8 characters'),
      'Password123!'
    );
    await slowType(
      page.getByPlaceholder('Re-enter your password'),
      'Password123!'
    );
    await slowType(page.locator('input[name="yearsOfExperience"]'), '8');

    await slowType(
      page.locator('input[name="degrees.0.name"]'),
      'Bac si da khoa'
    );
    await slowType(
      page.locator('input[name="degrees.0.issuingAuthority"]'),
      'Dai hoc Y Duoc'
    );
    await page.locator('input[name="degrees.0.issuedDate"]').fill('2018-06-01');

    await slowType(
      page.locator('input[name="certificates.0.name"]'),
      'Giay phep hanh nghe'
    );
    await slowType(
      page.locator('input[name="certificates.0.issuingAuthority"]'),
      'So Y te TPHCM'
    );
    await page
      .locator('input[name="certificates.0.issuedDate"]')
      .fill('2019-08-01');

    await setFakeCredentialUploads(page);

    await page.getByRole('button', { name: 'Submit Application' }).click();
    await expect(page.getByText('Application Submitted!')).toBeVisible();
  });

  test('@round-1 @module-auth AUTH_02 - block onboarding submit when required fields are missing', async ({
    page,
  }) => {
    await page.goto('/register-doctor');
    await expect(
      page.getByRole('heading', { name: 'Doctor Registration' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Submit Application' }).click();
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('@round-2 @module-auth AUTH_03 - system admin can open verification queue', async ({
    page,
  }) => {
    await page.goto('/login');
    await injectAuthState(page, 'SystemAdmin');
    await page.goto('/system-admin/verifications');

    await expect(
      page.getByRole('heading', { name: 'Verification Requests' })
    ).toBeVisible();
    await expect(page.getByPlaceholder('Tìm theo tên, email...')).toBeVisible();
  });

  test('@round-2 @module-auth AUTH_04 - unverified ophthalmologist is redirected to pending-approval', async ({
    page,
  }) => {
    await page.goto('/login');
    await injectAuthState(page, 'Ophthalmologist');

    await page.evaluate(() => {
      const rawUser = window.localStorage.getItem('user');
      if (!rawUser) return;
      const user = JSON.parse(rawUser) as {
        isVerified?: boolean | null;
        verificationStatus?: string | null;
      };
      user.isVerified = false;
      user.verificationStatus = 'PendingVerification';
      window.localStorage.setItem('user', JSON.stringify(user));
    });

    await page.goto('/ophthalmologist/dashboard');
    await expect(page).toHaveURL(/\/ophthalmologist\/pending-approval/);
  });

  test('@round-3 @module-auth AUTH_05 - verified ophthalmologist can access dashboard route', async ({
    page,
  }) => {
    await page.goto('/login');
    await injectAuthState(page, 'Ophthalmologist');
    await page.goto('/ophthalmologist/dashboard');

    await expect(page).toHaveURL(/\/ophthalmologist\/(dashboard|contract)/);
  });
});
