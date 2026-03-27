import { expect, test } from '@playwright/test';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';

const SYSTEM_ADMIN_EMAIL =
  process.env.E2E_ROLE_EMAIL_SYSTEM_ADMIN ?? 'systemadmin@gmail.com';
const ORG_ADMIN_EMAIL_FALLBACK =
  process.env.E2E_ROLE_EMAIL_ORG_ADMIN ?? 'orgadmin@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Flow 02 - Organisation Onboarding and Contract Activation', () => {
  test('system admin approves onboarding, organisation uploads contract, and contract is activated', async ({
    browser,
  }) => {
    test.setTimeout(300_000);

    // ==== STEP 1: Admin approves a pending onboarding request ====
    const ctxAdmin = await browser.newContext();
    const pageAdmin = await ctxAdmin.newPage();

    await bypassRecaptcha(pageAdmin);
    await loginByUi(
      pageAdmin,
      SYSTEM_ADMIN_EMAIL,
      DEFAULT_PASSWORD,
      /\/system-admin/
    );

    // Navigate to organisations approval page
    await pageAdmin.goto('/system-admin/organisations');
    await expect(
      pageAdmin.getByRole('heading', { name: /Organisation|Onboarding/i })
    ).toBeVisible({
      timeout: 10_000,
    });

    const approveBtn = pageAdmin
      .getByRole('button', {
        name: /Xác nhận\s*&\s*cấp tài khoản|Approve|cap tai khoan/i,
      })
      .first();

    await expect(approveBtn).toBeVisible({ timeout: 10_000 });

    const approvalResponsePromise = pageAdmin.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response
          .url()
          .includes('/system-admin/organisations/onboarding-requests/') &&
        response.url().includes('/approve') &&
        response.status() < 400,
      { timeout: 20_000 }
    );

    await approveBtn.click();

    type ApprovalResult = {
      orgAdminEmail?: string;
      temporaryPassword?: string;
    };

    let approvalResult: ApprovalResult | null = null;
    const approvalResponse = await approvalResponsePromise;
    try {
      approvalResult = (await approvalResponse.json()) as ApprovalResult;
    } catch {
      approvalResult = null;
    }

    await expect(
      pageAdmin.getByText(/Đã cấp tài khoản thành công|approved|success/i)
    ).toBeVisible({
      timeout: 15_000,
    });

    await ctxAdmin.close();

    const provisionedOrgEmail =
      approvalResult?.orgAdminEmail ?? ORG_ADMIN_EMAIL_FALLBACK;
    const provisionedOrgPassword =
      approvalResult?.temporaryPassword ?? DEFAULT_PASSWORD;

    // ==== STEP 2: OrgAdmin logs in with provisioned account ====
    const ctxOrg = await browser.newContext();
    const pageOrg = await ctxOrg.newPage();

    await bypassRecaptcha(pageOrg);
    await loginByUi(
      pageOrg,
      provisionedOrgEmail,
      provisionedOrgPassword,
      /\/organisation/
    );

    // Should land on contract page
    await expect(pageOrg).toHaveURL(/\/organisation\/contract/, {
      timeout: 10_000,
    });

    // ==== STEP 3: OrgAdmin uploads signed contract ====
    const contractBuffer = Buffer.from('Mock contract');
    await pageOrg.locator('input[type="file"]').first().setInputFiles({
      name: 'contract.pdf',
      mimeType: 'application/pdf',
      buffer: contractBuffer,
    });

    await expect(
      pageOrg.getByText(/Đã upload|Đang chờ admin xác nhận|pending/i)
    ).toBeVisible({
      timeout: 15_000,
    });

    await ctxOrg.close();

    // ==== STEP 4: Admin verifies uploaded contract ====
    const ctxAdmin2 = await browser.newContext();
    const pageAdmin2 = await ctxAdmin2.newPage();

    await bypassRecaptcha(pageAdmin2);
    await loginByUi(
      pageAdmin2,
      SYSTEM_ADMIN_EMAIL,
      DEFAULT_PASSWORD,
      /\/system-admin/
    );

    // Navigate to contracts verification page
    await pageAdmin2.goto('/system-admin/contracts');
    await expect(
      pageAdmin2.getByRole('heading', { name: /Contract|Verification/i })
    ).toBeVisible({
      timeout: 10_000,
    });

    const verifyBtn = pageAdmin2
      .getByRole('button', { name: /Xác nhận|Xác nhận hợp đồng|Verify/i })
      .first();
    await expect(verifyBtn).toBeVisible({ timeout: 10_000 });
    await verifyBtn.click();

    await expect(
      pageAdmin2.getByText(/Hiệu lực|Active|verified|success/i).first()
    ).toBeVisible({
      timeout: 15_000,
    });

    await ctxAdmin2.close();

    // ==== STEP 5: OrgAdmin logs in again and reaches dashboard ====
    const ctxOrg2 = await browser.newContext();
    const pageOrg2 = await ctxOrg2.newPage();

    await bypassRecaptcha(pageOrg2);
    await loginByUi(
      pageOrg2,
      provisionedOrgEmail,
      provisionedOrgPassword,
      /\/organisation/
    );

    // Contract gate should be cleared.
    await expect(pageOrg2).not.toHaveURL(/\/organisation\/contract/);
    await expect(pageOrg2).toHaveURL(
      /\/organisation\/(dashboard|slot-management|appointments|doctors)/
    );

    await ctxOrg2.close();
  });
});
