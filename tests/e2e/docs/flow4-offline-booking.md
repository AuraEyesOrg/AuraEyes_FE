# AURA - Organisation Slot Booking and Offline Appointment Flow

## 1. Objective

- Verify patient can book an offline clinic appointment at an organisation facility.

## 2. Source of Truth

- FE routes:
  - `/patient/dashboard`
  - `/patient/appointments`
  - `/patient/clinics`
- FE pages/hooks:
  - `src/features/patient/components/PatientSidebar.tsx`
  - `src/features/patient/pages/appointments.tsx`
  - `src/features/patient/pages/clinics.tsx`
  - `src/features/patient/hooks/use-clinic-booking.ts`
- BE endpoints:
  - Clinic booking endpoint used by patient clinic booking hook
  - Persistence via `AppointmentSlots` and booking entities

## 3. Business State Machine

- Offline slot lifecycle:
  - `Available` -> `Reserved/Booked` based on booking submit path

## 4. UI Journey (Main)

1. Patient logs in at `/patient/dashboard`.
2. Click sidebar tab `Appointments` -> `/patient/appointments`.
3. In section `Organisation Slots`, review completed/upcoming organisation appointments.
4. Click link `Book More Slot` -> `/patient/clinics`.
5. Search organisation (example: Auski Hospital) and select clinic card.
6. Select visit date and input reason.
7. Click `Book Appointment` on available offline slot.
8. Success message appears and booking is visible again in `/patient/appointments` under `Organisation Slots`.

## 5. Allowed Setup / Bypass

- SQL setup for deterministic organisation + slot seed.
- reCAPTCHA bypass in test:
  - mock `**/recaptcha/api2/userverify*`
  - override `window.grecaptcha`

## 6. Assertions

- Clinic search returns target organisation.
- Booking action succeeds and success feedback appears.
- New organisation appointment appears in `Organisation Slots` list.
- Optional DB assertion: booking row linked to patient and organisation slot.

## 7. Risks / Notes

- Slots are date-sensitive; create tomorrow slot to avoid same-day cutoffs.
