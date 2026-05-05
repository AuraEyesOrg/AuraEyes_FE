import { api } from '@/lib/api';

/**
 * Matches backend AvailableDoctorDto record from GetAvailableDoctorsForConsiliumQuery.
 * Availability is computed in real-time by checking AppointmentSlots + OphthalmologistLeaveRequests.
 */
export interface AvailableDoctorForConsiliumDto {
  id: string;
  name: string;
  avatar: string | null;
  degreeLevel: string | null;
}

export interface CreateClinicalGroupRequest {
  name?: string;
  consultationSessionId?: string;
  invitedDoctorIds: string[];
  reason?: string;
  /** Marks this consilium as high-priority. Affects notification title and system message prefix. */
  isEmergency?: boolean;
  /** Medical Record ID to deep-link in the first system message. */
  medicalRecordId?: string;
}

export const collaborationApi = {
  /**
   * Create a new clinical consilium group chat.
   * The backend automatically injects a first system message with:
   *   - Emergency tag (if isEmergency = true)
   *   - Consilium reason
   *   - Deep-link to the associated Medical Record
   */
  async createClinicalGroup(data: CreateClinicalGroupRequest): Promise<string> {
    const response = await api.post('/collaboration/clinical-group', data);
    return response.data.data;
  },

  /**
   * Conclude a clinical consilium.
   */
  async concludeConsilium(groupId: string): Promise<boolean> {
    const response = await api.post(
      `/collaboration/conclude-consilium/${groupId}`
    );
    return response.data.data;
  },

  /**
   * Get list of ophthalmologists available for a real-time Hot Consilium.
   * Availability is derived from the [Now, Now+25min] window:
   *   - Excludes doctors with approved leave overlapping today
   *   - Excludes doctors with busy/booked appointment slots in the window
   * Returns sorted candidates — sort by degree level client-side.
   */
  async getAvailableDoctors(): Promise<AvailableDoctorForConsiliumDto[]> {
    const response = await api.get('/collaboration/available-doctors');
    return response.data.data ?? [];
  },
};
