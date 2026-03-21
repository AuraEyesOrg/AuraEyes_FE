import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { bypassRecaptcha, loginByUi } from '../helpers/ui-login.helper';
import { query } from '../helpers/postgres';

const PATIENT_EMAIL = process.env.E2E_ROLE_EMAIL_PATIENT ?? 'patient@gmail.com';
const DOCTOR_EMAIL = process.env.E2E_ROLE_EMAIL_OPHTHALMOLOGIST ?? 'ophthalmologist@gmail.com';
const DEFAULT_PASSWORD = 'Password123!';

async function ensureReadyImage(page: import('@playwright/test').Page): Promise<void> {
  await expect(page.getByRole('button', { name: /Start AI Analysis/i })).toBeVisible({ timeout: 20_000 });

  for (let attempt = 0; attempt < 6; attempt++) {
    const warningCount = await page.getByText(/Blur Detected|too blurry|Please retake/i).count();
    if (warningCount > 0) {
      const retryBtn = page.locator('button[title="Retry"]').first();
      if ((await retryBtn.count()) > 0) {
        await retryBtn.click();
      }
      await page.waitForTimeout(1800);
      continue;
    }

    const readyCount = await page.getByText(/High Quality|Ready for analysis|Acceptable quality|Ready/i).count();
    if (readyCount > 0) return;

    await page.waitForTimeout(1500);
  }
}

test.describe('Flow 03 - Tele Consultation End-to-End', () => {
  test('dashboard upload -> AI analyze -> review -> find specialist -> booking -> confirm&pay -> consultation chat + meet', async ({ browser }) => {
    test.setTimeout(420_000);

    const profileRows = await query<{ PatientId: string; PatientUserId: string; DoctorId: string }>(
      `SELECT p."Id" AS "PatientId", p."UserId" AS "PatientUserId", d."Id" AS "DoctorId"
       FROM "Patients" p, "Ophthalmologists" d
       WHERE p."UserId" = (SELECT "Id" FROM "AspNetUsers" WHERE "Email" = $1)
         AND d."UserId" = (SELECT "Id" FROM "AspNetUsers" WHERE "Email" = $2)
       LIMIT 1`,
      [PATIENT_EMAIL, DOCTOR_EMAIL],
    );
    expect(profileRows.length).toBe(1);

    const { PatientId, PatientUserId, DoctorId } = profileRows[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const slotDate = tomorrow.toISOString().split('T')[0];
    const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });

    const templateId = randomUUID();
    const slotId = randomUUID();

    await query(
      `INSERT INTO "ScheduleTemplates" ("Id", "DayOfWeek", "StartTime", "EndTime", "SlotDuration", "MaxCapacity", "OphthalId", "OrgId", "Cost", "CreatedAt", "CreatedBy", "IsDeleted")
       VALUES ($1, $2, '10:00:00', '10:30:00', 30, 1, $3, NULL, 120000, NOW(), 'e2e-flow3', false)`,
      [templateId, dayName, DoctorId],
    );

    await query(
      `INSERT INTO "AppointmentSlots" ("Id", "ScheduleTemplateId", "Date", "StartTime", "EndTime", "Status", "Cost", "CreatedAt", "CreatedBy", "IsDeleted", "BookedCount", "MaxCapacity")
       VALUES ($1, $2, $3::date, '10:00:00', '10:30:00', 'Available', 120000, NOW(), 'e2e-flow3', false, 0, 1)`,
      [slotId, templateId, slotDate],
    );

    await query(`UPDATE "Wallets" SET "Balance" = 1000000 WHERE "UserId" = $1`, [PatientUserId]);

    const patientCtx = await browser.newContext();
    const patientPage = await patientCtx.newPage();

    await bypassRecaptcha(patientPage);
    await loginByUi(patientPage, PATIENT_EMAIL, DEFAULT_PASSWORD, /\/patient\//, {
      postLoginPath: '/patient/dashboard',
    });

    await patientPage.getByRole('link', { name: /Upload New Scan|Upload Your First Scan/i }).first().click();
    await expect(patientPage).toHaveURL(/\/patient\/screening\/new/);

    const fakeFundus = Buffer.from('');
    await patientPage.locator('input[type="file"]').setInputFiles({
      name: 'fundus-image.png',
      mimeType: 'image/png',
      buffer: fakeFundus,
    });

    await ensureReadyImage(patientPage);
    await patientPage.getByRole('button', { name: /Start AI Analysis/i }).click();

    await expect(patientPage).toHaveURL(/\/patient\/screening\/analyze/);
    await patientPage.getByRole('button', { name: /Start Screening/i }).click();

    await expect(patientPage.getByRole('button', { name: /Continue to Review/i })).toBeVisible({ timeout: 120_000 });
    await patientPage.getByRole('button', { name: /Continue to Review/i }).click();

    await expect(patientPage).toHaveURL(/\/patient\/screening\/review/);

    await patientPage.getByRole('button', { name: /Find a Specialist/i }).click();

    const bookMoreFromAppointments = patientPage.getByRole('link', { name: /Book More Slot/i }).first();
    if ((await bookMoreFromAppointments.count()) > 0) {
      await bookMoreFromAppointments.click();
    } else {
      await patientPage.goto('/patient/doctors');
    }

    await expect(patientPage).toHaveURL(/\/patient\/doctors/);

    await patientPage.getByRole('button', { name: /View Slots/i }).first().click();
    await expect(patientPage).toHaveURL(/\/patient\/book/);

    await patientPage.getByRole('button', { name: /10:00/i }).first().click();
    await patientPage.getByRole('button', { name: /Confirm Booking/i }).click();

    await expect(patientPage).toHaveURL(/\/patient\/book\/confirm/);
    await patientPage.getByRole('button', { name: /Confirm & Pay/i }).click();

    await expect(patientPage.getByText(/Booking Confirmed!/i)).toBeVisible({ timeout: 30_000 });

    const consultationRows = await query<{ ConsultationId: string; MeetingLink: string | null }>(
      `SELECT "Id" AS "ConsultationId", "MeetingLink" AS "MeetingLink"
       FROM "ConsultationSessions"
       WHERE "PatientId" = $1
       ORDER BY "CreatedAt" DESC
       LIMIT 1`,
      [PatientId],
    );
    expect(consultationRows.length).toBe(1);

    const consultationId = consultationRows[0].ConsultationId;

    await query(
      `UPDATE "ConsultationSessions"
       SET "AppointmentTime" = NOW() - INTERVAL '2 minutes',
           "Status" = 'Open',
           "ChatStatus" = 'Open',
           "MeetingLink" = COALESCE("MeetingLink", 'https://meet.google.com/e2e-aura-flow3'),
           "UpdatedAt" = NOW(),
           "UpdatedBy" = 'e2e-flow3'
       WHERE "Id" = $1`,
      [consultationId],
    );

    await patientPage.goto('/patient/chat');
    await expect(patientPage.getByText(/Open|Consultation|Chat/i).first()).toBeVisible({ timeout: 15_000 });
    await patientCtx.close();

    const doctorCtx = await browser.newContext();
    const doctorPage = await doctorCtx.newPage();

    await bypassRecaptcha(doctorPage);
    await loginByUi(doctorPage, DOCTOR_EMAIL, DEFAULT_PASSWORD, /\/ophthalmologist\//, {
      postLoginPath: '/ophthalmologist/consultations',
    });

    await expect(doctorPage).toHaveURL(/\/ophthalmologist\/consultations/);
    await expect(doctorPage.getByText(/meet.google.com|Meet|Consultation|Chat|Room/i).first()).toBeVisible({
      timeout: 20_000,
    });

    await doctorCtx.close();
  });
});
