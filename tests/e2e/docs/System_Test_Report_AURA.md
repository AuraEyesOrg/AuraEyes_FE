# DETAILED TEST CASE REPORT - FULL EXECUTIONS

System: AURA Digital Clinic (Standalone Model)
Document scope: Comprehensive system test report covering 8 core modules after architectural pivot.

## Execution Baseline Summary

| Item                      | Value                                                            |
| ------------------------- | ---------------------------------------------------------------- |
| Total Modules             | 8                                                                |
| Total Detailed Test Cases | 82                                                               |
| Overall Pass Rate (R3)    | 98.2%                                                            |
| Reporting Format          | Feature information + Execution Summary + Detailed Rounds Matrix |
| Execution Rounds          | Round 1, Round 2, Round 3                                        |
| Main Tester               | VietN (Senior QC)                                                |

## Test Coverage by Module

| Module    | Feature                              | Total TCs |
| --------- | ------------------------------------ | --------- |
| 1         | Authentication & Authorization       | 12        |
| 2         | User Profile & Leave Management      | 10        |
| 3         | Appointment & Scheduling Management  | 10        |
| 4         | Clinical Operations & AI Integration | 10        |
| 5         | Financial & Checkout Operations      | 10        |
| 6         | Medical Records & Post-Visit Care    | 10        |
| 7         | Internal Knowledge Network           | 10        |
| 8         | System Notification Dispatching      | 10        |
| **Total** |                                      | **82**    |

---

## Module 1: Authentication & Authorization

### Feature Information (Module 1)

| Field            | Content                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Feature Name     | Authentication                                                                                                                 |
| Test requirement | Cover login, Google login, 2FA verify, forgot password, reset password, force change password, logout, role-based route guard. |
| Number of TCs    | 12                                                                                                                             |

### Execution Summary (Module 1)

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 10     | 2      | 0       | 0   |
| Round 2       | 12     | 0      | 0       | 0   |
| Round 3       | 12     | 0      | 0       | 0   |

### Detailed Test Cases (Module 1)

| TC ID   | Test Case Description             | Procedures                                                              | Expected Results                                               | Round 1 | R1 Date    | R2     | R2 Date    | R3     | R3 Date    | Note                      |
| ------- | --------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- | ------- | ---------- | ------ | ---------- | ------ | ---------- | ------------------------- |
| AUTH_01 | Login with valid Patient          | 1. Open /login. 2. Enter Patient creds. 3. Verify recaptcha. 4. Submit. | Access token saved, redirect to /patient/dashboard.            | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| AUTH_02 | Login with valid Ophthalmologist  | 1. Open /login. 2. Enter Doctor creds. 3. Submit.                       | Login success and redirect to /ophthalmologist/dashboard.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| AUTH_03 | Login with Google account         | 1. Click Google login. 2. Complete provider consent.                    | User session is created and routed to role-based landing page. | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Redirect logic error. |
| AUTH_04 | Route to 2FA verification         | 1. Submit creds for 2FA account.                                        | FE redirects to /two-factor-verify, shows OTP form.            | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Security flow.            |
| AUTH_05 | Complete login using 2FA          | 1. Enter valid OTP. 2. Submit.                                          | 2FA token accepted, full session created.                      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| AUTH_06 | Forgot password request flow      | 1. Open `/forgot-password`. 2. Submit email.                            | Success notice is displayed, no sensitive data leaked.         | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Recovery flow.            |
| AUTH_07 | Reset password with valid token   | 1. Open reset link. 2. Enter new password. 3. Submit.                   | Password is updated, old password is rejected.                 | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| AUTH_08 | Reset password with invalid token | 1. Open invalid reset link. 2. Submit new password.                     | FE shows API error state and does not create session.          | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Missing UI error.     |
| AUTH_09 | Logout and session invalidation   | 1. Click Logout. 2. Navigate to private route.                          | Tokens cleared, user is redirected to login.                   | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Session security.         |
| AUTH_10 | Enforce role-based access control | 1. Login as Patient. 2. Open `/system-admin/dashboard`.                 | Access is denied by route guard.                               | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Role guard.               |
| AUTH_11 | Handle expired/invalid 2FA OTP    | 1. Enter wrong OTP at verify page. 2. Submit.                           | UI displays 'Invalid or expired OTP' error message.            | Passed  | 2026-04-15 | Passed | 2026-04-15 | Passed | 2026-04-18 | 2FA negative case.        |
| AUTH_12 | Force-change-password gate        | 1. Login as Staff with force flag. 2. Submit new password.              | User forced to change password before dashboard access.        | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Onboarding gate.          |

---

## Module 2: User Profile & Leave Management

### Feature Information (Module 2)

| Field            | Content                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| Feature Name     | User Profile & Leave Management                                                                                  |
| Test requirement | Manage profiles for all roles, certificates for doctors, and leave request/approval workflow for internal staff. |
| Number of TCs    | 10                                                                                                               |

### Execution Summary (Module 2)

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 8      | 2      | 0       | 0   |
| Round 2       | 10     | 0      | 0       | 0   |
| Round 3       | 10     | 0      | 0       | 0   |

### Detailed Test Cases (Module 2)

| TC ID   | Test Case Description         | Procedures                   | Expected Results                           | Round 1 | R1 Date    | R2     | R2 Date    | R3     | R3 Date    | Note                     |
| ------- | ----------------------------- | ---------------------------- | ------------------------------------------ | ------- | ---------- | ------ | ---------- | ------ | ---------- | ------------------------ |
| PROF_01 | Update Patient Profile        | 1. Edit name/phone. 2. Save. | Profile updated in DB and reflected in UI. | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| PROF_02 | Upload Doctor Certificate     | 1. Upload PDF. 2. Submit.    | File saved in storage, status "Pending".   | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| PROF_03 | Submit Leave Request          | 1. Select dates. 2. Submit.  | Request created, status "Pending".         | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| PROF_04 | Process Leave Request (Admin) | 1. Admin Approve.            | Status "Approved", Doctor slots blocked.   | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Slot block bug.      |
| PROF_05 | Invalid Certificate Format    | 1. Upload .exe.              | System rejects file type.                  | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Error case.              |
| PROF_06 | Update Profile (Unauthorized) | 1. Patient A edit Patient B. | API returns 403 Forbidden.                 | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | RBAC check.              |
| PROF_07 | Certificate Review (Admin)    | 1. Admin Review. 2. Verify.  | Status "Verified", profile badge updated.  | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| PROF_08 | Update Staff Role (Admin)     | 1. Admin edit staff role.    | Permissions update immediately.            | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| PROF_09 | Avatar Upload Size Limit      | 1. Upload 20MB image.        | System shows "File too large" error.       | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Missing limit check. |
| PROF_10 | Leave Conflict Handling       | 1. Leave on appointment day. | System warns about existing bookings.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Exception case.          |

---

## Module 3: Appointment & Scheduling Management

### Feature Information (Module 3)

| Field            | Content                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Feature Name     | Appointment & Scheduling                                                                                                  |
| Test requirement | Search doctors, book slots, verify check-in flow, manage clinic queue, schedule templates and background generation jobs. |
| Number of TCs    | 10                                                                                                                        |

### Execution Summary (Module 3)

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 9      | 1      | 0       | 0   |
| Round 2       | 10     | 0      | 0       | 0   |
| Round 3       | 10     | 0      | 0       | 0   |

### Detailed Test Cases (Module 3)

| TC ID  | Test Case Description       | Procedures                  | Expected Results                        | Round 1 | R1 Date    | R2     | R2 Date    | R3     | R3 Date    | Note                 |
| ------ | --------------------------- | --------------------------- | --------------------------------------- | ------- | ---------- | ------ | ---------- | ------ | ---------- | -------------------- |
| SCH_01 | Search Doctor Availability  | 1. Filter by specialty.     | Real-time slots displayed.              | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.          |
| SCH_02 | Book Appointment (Patient)  | 1. Select slot. 2. Book.    | Status "Booked", email sent.            | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.          |
| SCH_03 | Check-in (Receptionist)     | 1. Search MRN. 2. Check-in. | Visit status "CheckedIn", enters Queue. | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.          |
| SCH_04 | Queue Routing (Coordinator) | 1. Drag patient to room.    | Queue order updated, Doctor notified.   | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.          |
| SCH_05 | Double Booking Race Case    | 1. Simultaneous booking.    | Only 1 succeeds, other gets error.      | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Lock contention. |
| SCH_06 | Block Slot (Coordinator)    | 1. Block slot manually.     | Slot hidden from public search.         | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.          |
| SCH_07 | Schedule Template Job       | 1. Trigger generation.      | New month slots appear in DB.           | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.          |
| SCH_08 | Check-in Wrong Date         | 1. Check-in for tomorrow.   | Error "No appointment today".           | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Exception case.      |
| SCH_09 | Cancel Booking (Patient)    | 1. Click cancel.            | Status "Cancelled", slot released.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.          |
| SCH_10 | Reschedule Conflict         | 1. Move to occupied slot.   | Error "Target slot taken".              | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Bad case.            |

---

## Module 4: Clinical Operations & AI Integration

### Feature Information (Module 4)

| Field            | Content                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Feature Name     | Clinical Operations & AI                                                                                                       |
| Test requirement | Retinal photo upload, AI triggering (Fast/Full), Consent capture, Heatmap visualization, Diagnosis, Prescription, and Roadmap. |
| Number of TCs    | 10                                                                                                                             |

### Execution Summary (Module 4)

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 7      | 3      | 0       | 0   |
| Round 2       | 10     | 0      | 0       | 0   |
| Round 3       | 10     | 0      | 0       | 0   |

### Detailed Test Cases (Module 4)

| TC ID   | Test Case Description       | Procedures                    | Expected Results                      | Round 1 | R1 Date    | R2     | R2 Date    | R3     | R3 Date    | Note                     |
| ------- | --------------------------- | ----------------------------- | ------------------------------------- | ------- | ---------- | ------ | ---------- | ------ | ---------- | ------------------------ |
| CLIN_01 | Upload Retinal Photo        | 1. Upload L/R photos.         | Photos saved and linked to visit.     | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| CLIN_02 | Capture Consent             | 1. Patient signs on tablet.   | Consent status "Signed" in visit.     | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| CLIN_03 | Trigger AI Screening        | 1. Run AI Analysis.           | Risk scores returned in 30s.          | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: AI service timeout.  |
| CLIN_04 | View AI Heatmap             | 1. Toggle layer.              | Anomalies highlighted on canvas.      | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Rendering alignment. |
| CLIN_05 | Finalize Diagnosis          | 1. Input notes. 2. Save.      | Status "WaitingForPayment".           | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| CLIN_06 | Generate Prescription       | 1. Select medications.        | Printable prescription stored.        | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| CLIN_07 | Customize Roadmap           | 1. Add follow-up steps.       | Roadmap visible on patient dashboard. | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| CLIN_08 | AI Analysis (Low Quality)   | 1. Upload blurred photo.      | AI returns "Low Confidence" error.    | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Crash on bad data.   |
| CLIN_09 | Diagnosis w/o Consent       | 1. Finalize diagnosis.        | Error "Consent required".             | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Exception case.          |
| CLIN_10 | Real-time Consultation Chat | 1. Send message during visit. | Peer receives message instantly.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |

---

## Module 5: Financial & Checkout Operations

### Feature Information (Module 5)

| Field            | Content                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| Feature Name     | Financial & Checkout                                                                                            |
| Test requirement | Payment context building, Order creation, Cash/Gateway payment processing, Webhook handling, and Pricing rules. |
| Number of TCs    | 10                                                                                                              |

### Execution Summary (Module 5)

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 9      | 1      | 0       | 0   |
| Round 2       | 10     | 0      | 0       | 0   |
| Round 3       | 10     | 0      | 0       | 0   |

### Detailed Test Cases (Module 5)

| TC ID  | Test Case Description   | Procedures                     | Expected Results                      | Round 1 | R1 Date    | R2     | R2 Date    | R3     | R3 Date    | Note                    |
| ------ | ----------------------- | ------------------------------ | ------------------------------------- | ------- | ---------- | ------ | ---------- | ------ | ---------- | ----------------------- |
| FIN_01 | Build Payment Context   | 1. Finish clinical session.    | Auto-sum fee + medication total.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| FIN_02 | Create Payment Order    | 1. Cashier generate order.     | Order saved with unique ID/QR.        | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| FIN_03 | Cash Payment (Cashier)  | 1. Receive cash. 2. Mark Paid. | Status "Completed", receipt ready.    | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| FIN_04 | Gateway Payment (PayOS) | 1. Scan QR. 2. Pay.            | Webhook success, status updates.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| FIN_05 | Webhook Verification    | 1. Trigger webhook manually.   | System verifies signature correctly.  | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Signature mismatch. |
| FIN_06 | View Order History      | 1. Open history. 2. Filter.    | Accurate transaction logs shown.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| FIN_07 | Update Pricing (Admin)  | 1. Edit consultation price.    | New price applies to new orders.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| FIN_08 | Transaction Export      | 1. Click Export to Excel.      | File generated with correct data.     | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| FIN_09 | Partial Payment (Bad)   | 1. Enter partial amount.       | System prevents "Completed" status.   | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Bad case.               |
| FIN_10 | Payment Timeout         | 1. Gateway timeout.            | Order remains "Pending", notify user. | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Error case.             |

---

## Module 6: Medical Records & Post-Visit Care

### Feature Information (Module 6)

| Field            | Content                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Feature Name     | Medical Records & Post-Care                                                                        |
| Test requirement | View history, EMR 23/BV-01 forms, PDF downloads, post-visit follow-ups, and educational resources. |
| Number of TCs    | 10                                                                                                 |

### Execution Summary (Module 6)

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 9      | 1      | 0       | 0   |
| Round 2       | 10     | 0      | 0       | 0   |
| Round 3       | 10     | 0      | 0       | 0   |

### Detailed Test Cases (Module 6)

| TC ID  | Test Case Description | Procedures                    | Expected Results                       | Round 1 | R1 Date    | R2     | R2 Date    | R3     | R3 Date    | Note                    |
| ------ | --------------------- | ----------------------------- | -------------------------------------- | ------- | ---------- | ------ | ---------- | ------ | ---------- | ----------------------- |
| MED_01 | View Visit History    | 1. Open timeline.             | Full clinical data displayed.          | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| MED_02 | Download PDF Report   | 1. Click Download.            | PDF with clinic logo/charts ready.     | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| MED_03 | Fill EMR 23/BV-01     | 1. Staff input clinical data. | Data saved with field validation.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| MED_04 | Post-Visit Follow-up  | 1. System trigger (3 days).   | Notification sent, chat opened.        | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Trigger timing bug. |
| MED_05 | Follow-up Reply       | 1. Patient reply to chat.     | Doctor dashboard shows update.         | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| MED_06 | Patient Feedback      | 1. Submit rating/comment.     | Feedback saved and notified Admin.     | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| MED_07 | Educational Resource  | 1. View health tip article.   | Content rendered with media correctly. | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.             |
| MED_08 | History Encryption    | 1. Check DB level storage.    | PII data is encrypted at rest.         | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Security check.         |
| MED_09 | Invalid MRN Search    | 1. Search non-existent MRN.   | Error "Record not found".              | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Bad case.               |
| MED_10 | PDF Generation Crash  | 1. Missing diagnosis data.    | PDF shows "N/A" instead of error.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Error case.             |

---

## Module 7: Internal Knowledge Network

### Feature Information (Module 7)

| Field            | Content                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| Feature Name     | Internal Knowledge Network                                                      |
| Test requirement | Share cases, Comment/React, Group chat, Video meetings, and content moderation. |
| Number of TCs    | 10                                                                              |

### Execution Summary (Module 7)

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 8      | 2      | 0       | 0   |
| Round 2       | 10     | 0      | 0       | 0   |
| Round 3       | 10     | 0      | 0       | 0   |

### Detailed Test Cases (Module 7)

| TC ID  | Test Case Description  | Procedures                   | Expected Results                        | Round 1 | R1 Date    | R2     | R2 Date    | R3     | R3 Date    | Note                      |
| ------ | ---------------------- | ---------------------------- | --------------------------------------- | ------- | ---------- | ------ | ---------- | ------ | ---------- | ------------------------- |
| NET_01 | Share Case to Feed     | 1. Anonymize. 2. Post.       | Case visible to internal network.       | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| NET_02 | Comment on Case        | 1. Add professional comment. | Comment visible instantly.              | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| NET_03 | Internal Group Chat    | 1. Create group. 2. Chat.    | Real-time delivery to all members.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| NET_04 | Video Call (Peer)      | 1. Start Meet session.       | Video/Audio established with peer.      | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: WebRTC ICE bug.       |
| NET_05 | Share Media in Chat    | 1. Send DICOM/Retinal photo. | File preview and secure download.       | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| NET_06 | Content Moderation     | 1. Admin delete post.        | Post removed from feed instantly.       | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| NET_07 | Repost Case            | 1. Repost case to group.     | Original source linked correctly.       | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.               |
| NET_08 | Post without Anonymize | 1. Post patient face/name.   | AI blocks post with PII warning.        | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: Detection logic slow. |
| NET_09 | Delete Others' Post    | 1. Try delete non-own post.  | UI hides delete / API returns 403.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Bad case.                 |
| NET_10 | Network Disconnect     | 1. Chat during offline.      | Message queued, auto-send on reconnect. | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Error case.               |

---

## Module 8: System Notification Dispatching

### Feature Information (Module 8)

| Field            | Content                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Feature Name     | Notification Dispatching                                                                             |
| Test requirement | Real-time dispatching to all roles, Inbox management, Deep link routing, and PWA push notifications. |
| Number of TCs    | 10                                                                                                   |

### Execution Summary (Module 8)

| Testing Round | Passed | Failed | Pending | N/A |
| ------------- | ------ | ------ | ------- | --- |
| Round 1       | 9      | 1      | 0       | 0   |
| Round 2       | 10     | 0      | 0       | 0   |
| Round 3       | 10     | 0      | 0       | 0   |

### Detailed Test Cases (Module 8)

| TC ID  | Test Case Description    | Procedures                            | Expected Results                        | Round 1 | R1 Date    | R2     | R2 Date    | R3     | R3 Date    | Note                     |
| ------ | ------------------------ | ------------------------------------- | --------------------------------------- | ------- | ---------- | ------ | ---------- | ------ | ---------- | ------------------------ |
| NOT_01 | Patient Booking Notif    | 1. Confirm booking.                   | Toast and Inbox update instantly.       | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| NOT_02 | Doctor Assignment Notif  | 1. Assign patient.                    | Doctor dashboard badge updates.         | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| NOT_03 | Inbox - Mark All Read    | 1. Click Mark Read.                   | All counts reset to zero instantly.     | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| NOT_04 | Deep Link Navigation     | 1. Click on payment notif.            | Routes to specific Visit Checkout.      | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| NOT_05 | PWA Background Push      | 1. Browser closed.                    | OS level push received via SW.          | Failed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | R1: SW registration bug. |
| NOT_06 | Admin Bulk Dispatch      | 1. Admin broadcast alert.             | All roles receive real-time banner.     | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| NOT_07 | Notification Categories  | 1. Filter by "Clinical".              | Only clinical alerts are shown.         | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| NOT_08 | Dispatch to Offline User | 1. User offline. 2. Login.            | Notifs buffered and delivered at login. | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| NOT_09 | Delete Notification      | 1. Remove from inbox.                 | Data deleted from DB, UI synced.        | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Happy path.              |
| NOT_10 | Notif Deep Link 404      | 1. Click old notif for deleted visit. | Redirect to dashboard with error toast. | Passed  | 2026-03-26 | Passed | 2026-03-31 | Passed | 2026-04-18 | Error case.              |
