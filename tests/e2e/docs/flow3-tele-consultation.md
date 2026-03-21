# AURA - Tele Consultation (Online) Flow

## 1. Objective

- Verify full tele-consultation journey from dashboard upload to consultation chat + Google Meet handoff.
- Validate the exact UI path: upload fundus image, AI analysis, review, find specialist, slot booking, wallet payment, consultation opening.

## 2. Source of Truth

- FE routes:
  - `/patient/dashboard`
  - `/patient/screening/new`
  - `/patient/screening/analyze`
  - `/patient/screening/review`
  - `/patient/doctors`
  - `/patient/book`
  - `/patient/book/confirm`
  - `/patient/chat`
  - `/ophthalmologist/appointments`
  - `/ophthalmologist/consultations`
- FE pages/hooks:
  - `src/features/patient/pages/dashboard.tsx`
  - `src/features/patient/pages/screening-new.tsx`
  - `src/features/patient/pages/retinal-analysis.tsx`
  - `src/features/patient/pages/doctors.tsx`
  - `src/features/patient/pages/booking-confirmation.tsx`
  - `src/features/patient/pages/review.tsx`
  - `src/features/patient/pages/chat.tsx`
  - `src/features/ophthalmologist/pages/appointments.tsx`
  - `src/features/ophthalmologist/pages/consultations.tsx`
  - `src/features/ophthalmologist/pages/ConsultationsChatView.tsx`
  - `src/features/consultation/hooks/use-consultation-phase.ts`
- BE endpoints/services:
  - Appointment booking under `/api/appointment-slots/*`
  - Consultation APIs under `/api/consultation-sessions/*`
  - `ConsultationStateWorker` for timed state transitions

## 3. Business State Machine

- Appointment slot:
  - `Available` -> `Reserved` -> `Booked`
- Consultation session:
  - `Pending` -> `Open` -> `Archived`
- Chat/meeting availability is time-gated around appointment window (pre-join and active window).

## 4. UI Journey (Main)

1. Patient logs in and starts at `/patient/dashboard`.
2. Click `Upload New Scan` -> route `/patient/screening/new`.
3. Upload into fundus dropzone (`Drag & Drop fundus images here`) and wait validation queue.
4. If image shows `Blur Detected`, click retry/reload until status is `Ready`.
5. Click `Start AI Analysis` -> route `/patient/screening/analyze`.
6. Click `Start Screening`, wait AI result, then click `Continue to Review` -> `/patient/screening/review`.
7. Click `Find a Specialist`, then open `/patient/doctors` and click `View Slots`.
8. Choose slot in `/patient/book` -> `Confirm Booking` -> `/patient/book/confirm`.
9. At confirmation page, review terms and click `Confirm & Pay` (wallet debit, no external gateway bypass).
10. At appointment time, patient opens `/patient/chat`; doctor opens `/ophthalmologist/consultations`.
11. Doctor side provides/opens Google Meet link (`meet.google.com`) and consultation chat is `Open`.

## 5. Allowed Setup / Bypass

- SQL setup for deterministic slot/session timing and wallet preconditions.
- SQL can update consultation timestamp/state (`Status`, `ChatStatus`, `AppointmentTime`) to simulate "đến giờ khám".
- reCAPTCHA bypass in test:
  - mock `**/recaptcha/api2/userverify*`
  - override `window.grecaptcha`

## 6. Assertions

- Flow reaches `/patient/screening/analyze` and `/patient/screening/review` in order.
- Booking reaches `/patient/book/confirm` and `Confirm & Pay` succeeds.
- A `ConsultationSessions` row exists for booked slot/patient.
- Patient chat page shows consultation status context.
- Doctor can open consultation page and observe open consultation with Google Meet handoff.

## 7. Risks / Notes

- Time-gated meeting button visibility depends on appointment timestamp and local clock.
- Keep assertions focused on route/state labels if media device permissions block full call join.
