import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { resetAndSeed } from '../helpers/test-backdoor.helper';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';
import { query } from '../helpers/postgres';

const PATIENT_EMAIL = process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

test.describe('Flow 04 - Organisation Slot Booking and Offline Appointment', () => {
  test.beforeEach(async ({ request }) => {
    await resetAndSeed(request);
  });

  test('@round-1 @module-booking BOOK_01 - patient reviews organisation slots and completes offline appointment booking from clinics page', async ({
    browser,
  }) => {
    test.setTimeout(240_000);

    const orgRows = await query<{ OrgId: string; OrgName: string }>(
      `SELECT "Id" AS "OrgId", "Name" AS "OrgName" FROM "Organisations" ORDER BY "CreatedAt" DESC LIMIT 1`
    );
    expect(orgRows.length).toBeGreaterThan(0);

    const { OrgId, OrgName } = orgRows[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const slotDate = tomorrow.toISOString().split('T')[0];

    const slotId = randomUUID();

    await query(
      `INSERT INTO "AppointmentSlots" ("Id", "ScheduleTemplateId", "Date", "StartTime", "EndTime", "Status", "Cost", "CreatedAt", "CreatedBy", "IsDeleted", "BookedCount", "MaxCapacity", "OrganisationId", "SlotType")
       VALUES ($1, NULL, $2::date, '14:00:00', '14:30:00', 'Available', 0, NOW(), 'e2e-flow4', false, 0, 1, $3, 'Offline')`,
      [slotId, slotDate, OrgId]
    );

    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/dashboard',
    });

    await page.getByRole('link', { name: /Appointments/i }).click();
    await expect(page).toHaveURL(/\/patient\/appointments/);

    await expect(
      page.getByRole('heading', { name: /Organisation Slots/i })
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('link', { name: /Book More Slot/i }).first()
    ).toBeVisible({ timeout: 10_000 });

    await page
      .getByRole('link', { name: /Book More Slot/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/patient\/clinics/);

    const searchInput = page.getByPlaceholder(
      /Search organisation by name, city, or address/i
    );
    await searchInput.fill(OrgName);

    await page
      .locator('button', { hasText: new RegExp(OrgName, 'i') })
      .first()
      .click();

    await page.locator('input[type="date"]').fill(slotDate);

    const reasonInput = page.getByPlaceholder(
      /Blurred vision, routine follow-up/i
    );
    await reasonInput.fill('Organisation appointment from flow 4');

    await page
      .getByRole('button', { name: /Book Appointment/i })
      .first()
      .click();

    await expect(
      page.getByText(/Đặt lịch thành công|Appointments/i)
    ).toBeVisible({ timeout: 20_000 });

    await page.goto('/patient/appointments');
    await expect(
      page.getByRole('heading', { name: /Organisation Slots/i })
    ).toBeVisible();
    await expect(page.getByText(new RegExp(OrgName, 'i')).first()).toBeVisible({
      timeout: 15_000,
    });

    await ctx.close();
  });

  test('@round-2 @module-booking BOOK_02 - should show validation when booking reason is missing', async ({
    browser,
  }) => {
    const orgRows = await query<{ OrgName: string }>(
      `SELECT "Name" AS "OrgName" FROM "Organisations" ORDER BY "CreatedAt" DESC LIMIT 1`
    );
    expect(orgRows.length).toBeGreaterThan(0);

    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await bypassRecaptcha(page);
    await loginByUi(page, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/clinics',
    });

    await page
      .getByPlaceholder(/Search organisation by name, city, or address/i)
      .fill(orgRows[0].OrgName);
    await page
      .locator('button', { hasText: new RegExp(orgRows[0].OrgName, 'i') })
      .first()
      .click();

    await page
      .getByRole('button', { name: /Book Appointment|Book Clinic Visit/i })
      .first()
      .click();

    await expect(page.getByText(/reason|required/i).first()).toBeVisible();
    await ctx.close();
  });
});
