// Clinic staff dùng chung patient APIs với organisation.
// POST /organisations/patients/walk-in — tạo 1 record Patient (walk-in, không cần AppUser).
import { orgWalkInPatientApi } from '@/features/organisation/api/walkin-patient.api';
import type { CreateWalkInPatientRequest } from '@/features/organisation/api/walkin-patient.api';

export {
  getClinicRecentPatients as getClinicPatients,
  updateClinicPatient,
  type ClinicRecentPatientDto as ClinicPatientDto,
  type UpdateClinicPatientRequest,
} from '@/features/organisation/api/patients.api';

export type { CreateWalkInPatientRequest };

// POST /organisations/patients/walk-in
export const createClinicWalkInPatient = (
  request: CreateWalkInPatientRequest
) => orgWalkInPatientApi.createWalkInPatient(request);
