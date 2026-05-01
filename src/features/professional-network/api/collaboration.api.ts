import { api } from '@/lib/api';

export interface CreateClinicalGroupRequest {
  name?: string;
  consultationSessionId?: string;
  invitedDoctorIds: string[];
  reason?: string;
}

export const collaborationApi = {
  /**
   * Create a new clinical consilium group chat
   */
  async createClinicalGroup(data: CreateClinicalGroupRequest): Promise<string> {
    const response = await api.post('/collaboration/clinical-group', data);
    return response.data.data;
  },

  /**
   * Conclude a clinical consilium
   */
  async concludeConsilium(groupId: string): Promise<boolean> {
    const response = await api.post(
      `/collaboration/conclude-consilium/${groupId}`
    );
    return response.data.data;
  },

  /**
   * Get list of available doctors for consilium
   */
  async getAvailableDoctors(): Promise<any[]> {
    const response = await api.get('/collaboration/available-doctors');
    return response.data.data;
  },
};
