// Clinic staff dùng chung patient APIs với organisation.
// POST /organisations/patients/walk-in — tạo 1 record Patient (walk-in, không cần AppUser).
import { orgWalkInPatientApi } from '@/features/organisation/api/walkin-patient.api';
import type { CreateWalkInPatientRequest } from '@/features/organisation/api/walkin-patient.api';

export {
  getOrganisationRecentPatients as getClinicPatients,
  updateOrganisationPatient as updateClinicPatient,
  type OrganisationRecentPatientDto as ClinicPatientDto,
  type UpdateOrganisationPatientRequest as UpdateClinicPatientRequest,
} from '@/features/organisation/api/patients.api';

export type { CreateWalkInPatientRequest };

// POST /organisations/patients/walk-in
export const createClinicWalkInPatient = (
  request: CreateWalkInPatientRequest
) => orgWalkInPatientApi.createWalkInPatient(request);
