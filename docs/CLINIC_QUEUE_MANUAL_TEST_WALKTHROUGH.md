# Clinic Queue Manual Test Walkthrough

## Overview

This document provides a step-by-step manual testing guide for the 4-step clinic flow:
**Receptionist → Coordinator → Doctor → Finalized**

## Prerequisites

- Backend API running on configured port
- Frontend application running
- Test user accounts for each role:
  - Receptionist account
  - Coordinator account
  - Doctor (Ophthalmologist) account
- At least one patient with an appointment scheduled

---

## Test Flow

### Step 1: Receptionist - Check-In Patient

**Role:** Receptionist  
**Flow State:** `CheckedIn`

#### Actions:

1. **Login as Receptionist**
   - Navigate to login page
   - Enter receptionist credentials
   - Verify successful login and redirect to receptionist dashboard

2. **View Appointments**
   - Navigate to appointments list
   - Verify you can see scheduled appointments for today

3. **Check-In Patient**
   - Find a patient with an upcoming appointment
   - Click "Check In" button
   - Verify success message appears
   - Verify patient appears in the clinic queue

4. **Verify Queue State**
   - Navigate to clinic queue page
   - Verify patient shows with:
     - `FlowState: "CheckedIn"`
     - `VisitStatus: "CheckedIn"`
     - `CheckedInAt` timestamp is populated
     - No screening or consultation data yet

**Expected Result:**

- Patient successfully checked in
- Patient visible in queue with "CheckedIn" state
- Ready for coordinator to initiate screening

---

### Step 2: Coordinator - Initiate AI Screening

**Role:** Coordinator  
**Flow State:** `CheckedIn` → `ScreeningPending` → `AICompleted`

#### Actions:

1. **Login as Coordinator**
   - Navigate to login page
   - Enter coordinator credentials
   - Verify successful login and redirect to coordinator dashboard

2. **View Clinic Queue**
   - Navigate to clinic queue page
   - Verify you can see the checked-in patient from Step 1
   - Patient should show `FlowState: "CheckedIn"`

3. **Initiate AI Screening**
   - Click on the patient in the queue
   - Click "Start AI Screening" button
   - Upload retinal images (left and right eye)
   - Submit for AI analysis

4. **Monitor Screening Progress**
   - Verify `FlowState` changes to `"ScreeningPending"`
   - Wait for AI processing to complete
   - Verify `FlowState` changes to `"AICompleted"`

5. **Review AI Results**
   - View screening results
   - Verify risk level is displayed (Low/Medium/High)
   - Verify AI recommendations are shown

6. **Send to Doctor**
   - Click "Send to Doctor" button
   - Select an available ophthalmologist from dropdown
   - Add any notes for the doctor (optional)
   - Click "Confirm" to assign

**Expected Result:**

- Screening successfully completed
- AI results visible with risk assessment
- Patient assigned to doctor
- `FlowState: "SentToDoctor"`
- `AssignedDoctorId` populated

---

### Step 3: Doctor - Consultation

**Role:** Doctor (Ophthalmologist)  
**Flow State:** `SentToDoctor` → `ConsultationInProgress` → `Completed`

#### Actions:

1. **Login as Doctor**
   - Navigate to login page
   - Enter doctor credentials
   - Verify successful login and redirect to doctor dashboard

2. **View Assigned Patients**
   - Navigate to clinic queue or doctor's patient list
   - Verify you can see patients assigned to you
   - Patient should show `FlowState: "SentToDoctor"`

3. **Start Consultation**
   - Click on the patient
   - Review AI screening results and risk assessment
   - Click "Start Consultation" button
   - Verify `FlowState` changes to `"ConsultationInProgress"`
   - Verify `ConsultationStatus: "Confirmed"`

4. **Conduct Examination**
   - Review patient history
   - Review AI screening images and analysis
   - Add examination notes
   - Record diagnosis
   - Prescribe treatment if needed

5. **Complete Consultation**
   - Fill in all required consultation fields
   - Add final diagnosis and recommendations
   - Click "Complete Consultation" button
   - Confirm completion

**Expected Result:**

- Consultation session created and completed
- `FlowState: "Finalized"`
- `ConsultationStatus: "Completed"`
- `VisitStatus: "Completed"`
- All consultation data saved

---

### Step 4: Verify Finalized State

**Role:** Any clinic staff  
**Flow State:** `Finalized`

#### Actions:

1. **View Completed Visit**
   - Navigate to clinic queue
   - Filter or search for completed visits
   - Verify patient shows `FlowState: "Finalized"`

2. **Verify Data Completeness**
   - Check that all data is present:
     - ✓ Check-in timestamp
     - ✓ Screening ID and results
     - ✓ Consultation session ID
     - ✓ Assigned doctor ID
     - ✓ Visit completion timestamp

3. **View Visit History**
   - Navigate to patient's visit history
   - Verify the completed visit is recorded
   - Verify all timestamps are correct
   - Verify consultation notes are accessible

**Expected Result:**

- Visit marked as completed
- All flow stages documented
- Data available for reporting and history
- Patient ready for checkout/billing

---

## Flow State Reference

| State                    | Description                               | Visible To  | Actions Available              |
| ------------------------ | ----------------------------------------- | ----------- | ------------------------------ |
| `CheckedIn`              | Patient checked in, awaiting screening    | Coordinator | Start AI Screening             |
| `ScreeningPending`       | AI screening in progress                  | Coordinator | Monitor progress               |
| `AICompleted`            | AI screening completed                    | Coordinator | Review results, Send to Doctor |
| `SentToDoctor`           | Assigned to doctor, awaiting consultation | Doctor      | Start Consultation             |
| `ConsultationInProgress` | Doctor actively consulting                | Doctor      | Complete Consultation          |
| `Finalized`              | Visit completed                           | All staff   | View history only              |

---

## API Endpoints Used

### Get Clinic Queue

```
GET /api/clinic-queue
```

Returns list of patients in queue with their current flow state.

### Send to Doctor

```
POST /api/clinic-queue/send-to-doctor
Body: {
  "visitId": "guid",
  "doctorId": "guid",
  "notes": "string"
}
```

### Start Consultation

```
POST /api/consultations/start
Body: {
  "visitId": "guid",
  "patientId": "guid"
}
```

### Complete Consultation

```
POST /api/consultations/{id}/complete
Body: {
  "diagnosis": "string",
  "notes": "string",
  "prescriptions": []
}
```

---

## Troubleshooting

### Patient Not Appearing in Queue

- Verify patient has a valid appointment
- Check that appointment is for today
- Verify patient is checked in (`CheckedInAt` is not null)
- Check organisation filter is correct

### Cannot Send to Doctor

- Verify screening is completed (`AICompleted` state)
- Verify doctor is available and active
- Check doctor belongs to same organisation

### Consultation Not Starting

- Verify patient is in `SentToDoctor` state
- Verify doctor is logged in with correct account
- Check patient is assigned to the logged-in doctor

### Flow State Not Updating

- Refresh the page
- Check browser console for errors
- Verify WebSocket/polling is working for real-time updates
- Check backend logs for errors

---

## Test Data Setup

### Create Test Appointment

```sql
-- Example SQL to create test data (adjust for your schema)
INSERT INTO Appointments (Id, PatientId, AppointmentSlotId, Status, CreatedAt)
VALUES (NEWID(), @PatientId, @SlotId, 'Confirmed', GETUTCDATE());
```

### Create Test Users

Ensure you have test accounts for:

- `receptionist@test.com` (Role: Receptionist)
- `coordinator@test.com` (Role: Coordinator)
- `doctor@test.com` (Role: Ophthalmologist)

---

## Success Criteria

✅ Patient successfully moves through all 4 flow states  
✅ Each role can perform their designated actions  
✅ Data persists correctly at each stage  
✅ Flow state updates are reflected in real-time  
✅ All timestamps are recorded accurately  
✅ Consultation data is complete and accessible  
✅ No errors in browser console or backend logs

---

## Notes

- Test with multiple patients simultaneously to verify queue management
- Test edge cases (e.g., patient leaves before consultation)
- Verify permissions - each role should only see/do what they're authorized for
- Test on different browsers and devices
- Monitor performance with multiple concurrent users

---

**Last Updated:** 2026-04-25  
**Version:** 1.0
