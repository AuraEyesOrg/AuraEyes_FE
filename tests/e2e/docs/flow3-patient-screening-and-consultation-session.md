# AURA - AI Screening, Appointment Booking, and Consultation Session Flow

## 1. Objective

- Verify full patient screening service journey from default dashboard to analysis and review.
- Verify that after review navigation (including roadmap access), patient can request consultation session, complete appointment booking, open chat, and use Google Meet handoff.

## 2. Source of Truth

- FE routes:
  - `/patient/dashboard`
  - `/patient/screening/new`
  - `/patient/analysis`
  - `/patient/screening/review`
  - `/patient/roadmap`
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
5. Click `Start AI Analysis` -> route `/patient/analysis`.
6. Click `Start Screening`, wait AI result, then click `Continue to Review` -> `/patient/screening/review`.
7. Validate review content and educational disease resources.
8. Open `/patient/roadmap` and validate roadmap page, then return to review flow.
9. Click `Find a Specialist`, open `/patient/doctors`, and click `View Slots`.
10. Choose slot in `/patient/book` -> `Confirm Booking` -> `/patient/book/confirm`.
11. At confirmation page, click `Confirm & Pay`.
12. At appointment time, patient opens `/patient/chat`; ophthalmologist opens `/ophthalmologist/consultations`.
13. Ophthalmologist side provides or opens Google Meet link (`meet.google.com`) and consultation chat is `Open`.

## 5. Allowed Setup / Bypass

- SQL setup for deterministic slot/session timing and wallet preconditions.
- SQL can update consultation timestamp/state (`Status`, `ChatStatus`, `AppointmentTime`) to simulate "đến giờ khám".
- reCAPTCHA bypass in test:
  - mock `**/recaptcha/api2/userverify*`
  - override `window.grecaptcha`

## 6. Assertions

- Flow reaches `/patient/analysis` and `/patient/screening/review` in order.
- Patient can open `/patient/roadmap` after review stage.
- Booking reaches `/patient/book/confirm` and `Confirm & Pay` succeeds.
- A `ConsultationSessions` row exists for booked slot/patient.
- Patient chat page shows consultation status context.
- Doctor can open consultation page and observe open consultation with Google Meet handoff.

## 7. Risks / Notes

- Time-gated meeting button visibility depends on appointment timestamp and local clock.
- Keep assertions focused on route/state labels if media device permissions block full call join.
