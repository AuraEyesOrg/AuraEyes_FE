import {
  expect,
  type Locator,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import { injectAuthState } from '../helpers/auth.helper';
import { query } from '../helpers/postgres';
import { getApiBaseUrl, getBackdoorKey } from '../helpers/test-backdoor.helper';

type MagicLoginResponse = {
  success: boolean;
  tokenType: string;
  accessToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    contractStatus?: string | null;
    isVerified?: boolean | null;
  };
};

async function slowType(
  locator: Locator,
  value: string,
  delay = 110
): Promise<void> {
  await locator.click();
  await locator.fill('');
  await locator.type(value, { delay });
}

async function setFakeCredentialUploads(page: Page): Promise<void> {
  await page.getByTestId('degree-file-0').setInputFiles({
    name: 'degree.jpg',
    mimeType: 'image/jpeg',
    // Zero-byte file: satisfies required client-side selection but skips
    // backend storage upload path (Length > 0 check) in test env.
    buffer: Buffer.alloc(0),
  });

  await page.getByTestId('certificate-file-0').setInputFiles({
    name: 'license.jpg',
    mimeType: 'image/jpeg',
    // Zero-byte file: satisfies required client-side selection but skips
    // backend storage upload path (Length > 0 check) in test env.
    buffer: Buffer.alloc(0),
  });

  await expect(page.getByText('degree.jpg')).toBeVisible();
  await expect(page.getByText('license.jpg')).toBeVisible();
}

async function waitForDoctorUser(email: string): Promise<void> {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const users = await query<{ Count: string }>(
      'SELECT COUNT(*)::text AS "Count" FROM "AspNetUsers" WHERE "Email" = $1',
      [email]
    );

    if (users[0]?.Count === '1') {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Doctor account was not persisted in DB for email: ${email}`);
}

async function magicLogin(
  request: APIRequestContext,
  email: string
): Promise<MagicLoginResponse> {
  const response = await request.get(
    `${getApiBaseUrl()}/api/test-backdoor/auth/magic-login?email=${encodeURIComponent(email)}`,
    {
      headers: {
        'X-Test-Key': getBackdoorKey(),
      },
    }
  );

  if (!response.ok()) {
    throw new Error(
      `magic-login failed for ${email}: ${response.status()} ${await response.text()}`
    );
  }

  return (await response.json()) as MagicLoginResponse;
}

async function injectMagicAuth(
  page: Page,
  auth: MagicLoginResponse
): Promise<void> {
  await page.evaluate((payload: MagicLoginResponse) => {
    window.localStorage.setItem('token', JSON.stringify(payload.accessToken));
    window.localStorage.setItem('refreshToken', JSON.stringify(null));
    window.localStorage.setItem('user', JSON.stringify(payload.user));
  }, auth);
}

test.describe('Flow 01 - Ophthalmologist Onboarding and Verification', () => {
  test('should complete ophthalmologist onboarding, admin verification, and protected access', async ({
    page,
    request,
  }) => {
    test.setTimeout(240_000);

    const doctorEmail = `dr_aura_${Date.now()}@gmail.com`;
    const password = 'Password123!';
    const doctorName = 'Dr. Playwright E2E';

    // Step 1: Doctor registers with slow typing and fake upload payload.
    await page.goto('/register-doctor');
    await expect(
      page.getByRole('heading', { name: 'Doctor Registration' })
    ).toBeVisible();

    await slowType(page.getByPlaceholder('Dr. John Smith'), doctorName);
    await slowType(page.getByPlaceholder('dr.smith@hospital.org'), doctorEmail);
    await slowType(page.getByPlaceholder('+84 (123) 456-7890'), '0987654321');
    await slowType(page.getByPlaceholder('Minimum 8 characters'), password);
    await slowType(page.getByPlaceholder('Re-enter your password'), password);
    await slowType(page.locator('input[name="yearsOfExperience"]'), '10');
    await slowType(
      page.getByPlaceholder(
        'Brief introduction about your practice and expertise...'
      ),
      'Toi la bac si test tu dong cho e2e flow.'
    );

    await slowType(
      page.locator('input[name="degrees.0.name"]'),
      'Bac si da khoa'
    );
    await slowType(
      page.locator('input[name="degrees.0.issuingAuthority"]'),
      'Dai hoc Y Duoc'
    );
    await page.locator('input[name="degrees.0.issuedDate"]').fill('2016-06-01');

    await slowType(
      page.locator('input[name="certificates.0.name"]'),
      'Giay phep hanh nghe'
    );
    await slowType(
      page.locator('input[name="certificates.0.issuingAuthority"]'),
      'So Y te TP.HCM'
    );
    await page
      .locator('input[name="certificates.0.issuedDate"]')
      .fill('2018-08-01');

    await setFakeCredentialUploads(page);

    await page.getByRole('button', { name: 'Submit Application' }).click();
    await expect(page.getByText('Application Submitted!')).toBeVisible();

    // Step 2: Bypass email verification via SQL.
    await waitForDoctorUser(doctorEmail);
    await query(
      'UPDATE "AspNetUsers" SET "EmailConfirmed" = true WHERE "Email" = $1',
      [doctorEmail]
    );

    const emailConfirmedRows = await query<{ EmailConfirmed: boolean }>(
      'SELECT "EmailConfirmed" FROM "AspNetUsers" WHERE "Email" = $1',
      [doctorEmail]
    );
    expect(emailConfirmedRows[0]?.EmailConfirmed).toBe(true);

    // Step 3: Admin approves verification request (auth-injected to avoid reCAPTCHA on login UI).
    await page.goto('/login');
    await injectAuthState(page, 'SystemAdmin');
    await page.goto('/system-admin/verifications');

    await expect(
      page.getByRole('heading', { name: 'Verification Requests' })
    ).toBeVisible();
    await page.getByPlaceholder('Tìm theo tên, email...').fill(doctorEmail);

    const doctorRow = page.locator('tr', { hasText: doctorEmail }).first();
    await expect(doctorRow).toBeVisible();
    await doctorRow.getByRole('button', { name: 'Duyệt' }).click();

    await page.getByRole('button', { name: 'Xác nhận phê duyệt' }).click();
    await expect(
      page.getByText('Không có hồ sơ nào đang chờ xét duyệt')
    ).toBeVisible();

    // Step 4: Doctor logs in again (magic-login + localStorage injection) and reaches protected area.
    await page.evaluate(() => window.localStorage.clear());
    const doctorAuth = await magicLogin(request, doctorEmail);
    await page.goto('/login');
    await injectMagicAuth(page, doctorAuth);
    await page.goto('/ophthalmologist/dashboard');

    await expect(page).toHaveURL(/\/ophthalmologist\/(dashboard|contract)/);
    await expect(
      page.getByText(/Hợp đồng hợp tác|Dashboard/i).first()
    ).toBeVisible();
  });
});
