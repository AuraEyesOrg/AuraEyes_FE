/**
 * System Admin Organisation & Device API
 * Handles API calls for organisation and device management
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  ApiResponse,
  ApproveOrganisationOnboardingResult,
  Device,
  Organisation,
  OrganisationDetail,
  OrganisationOnboardingRequestDto,
  PaginatedResponse,
  CalibrationLog,
} from '../types/system-admin.types';

export const organisationApi = {
  /**
   * Fetch all organisations with pagination
   */
  async getOrganisations(
    pageNumber = 1,
    pageSize = 10,
    searchTerm?: string,
    orgType?: string
  ) {
    try {
      const response = await api.get<
        ApiResponse<PaginatedResponse<Organisation>>
      >(API_ENDPOINTS.SYSTEM_ADMIN.ORGANISATIONS.LIST, {
        params: {
          pageNumber,
          pageSize,
          searchTerm: searchTerm || undefined,
          orgType: orgType || undefined,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch organisations:', error);
      throw error;
    }
  },

  /**
   * Fetch organisation details
   */
  async getOrganisationDetail(id: string) {
    try {
      const response = await api.get<ApiResponse<OrganisationDetail>>(
        API_ENDPOINTS.SYSTEM_ADMIN.ORGANISATIONS.DETAIL(id)
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch organisation detail:', error);
      throw error;
    }
  },

  /**
   * Create new organisation
   */
  async createOrganisation(data: Omit<Organisation, 'id' | 'createdAt'>) {
    try {
      const response = await api.post<ApiResponse<Organisation>>(
        API_ENDPOINTS.SYSTEM_ADMIN.ORGANISATIONS.CREATE,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create organisation:', error);
      throw error;
    }
  },

  /**
   * Update organisation
   */
  async updateOrganisation(id: string, data: Partial<Organisation>) {
    try {
      const response = await api.put<ApiResponse<Organisation>>(
        API_ENDPOINTS.SYSTEM_ADMIN.ORGANISATIONS.UPDATE(id),
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to update organisation:', error);
      throw error;
    }
  },

  /**
   * Toggle organisation status
   */
  async toggleOrganisationStatus(
    id: string,
    status: 'active' | 'inactive' | 'suspended'
  ) {
    try {
      const response = await api.post<ApiResponse<Organisation>>(
        API_ENDPOINTS.SYSTEM_ADMIN.ORGANISATIONS.TOGGLE_STATUS(id),
        { status }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to toggle organisation status:', error);
      throw error;
    }
  },

  /**
   * Delete organisation
   */
  async deleteOrganisation(id: string) {
    try {
      await api.delete(API_ENDPOINTS.SYSTEM_ADMIN.ORGANISATIONS.DELETE(id));
    } catch (error) {
      console.error('Failed to delete organisation:', error);
      throw error;
    }
  },

  async getOnboardingRequests() {
    const response = await api.get<
      ApiResponse<OrganisationOnboardingRequestDto[]>
    >(API_ENDPOINTS.SYSTEM_ADMIN.ORGANISATIONS.ONBOARDING_REQUESTS);
    return response.data.data;
  },

  async approveOnboardingRequest(id: string) {
    const response = await api.post<
      ApiResponse<ApproveOrganisationOnboardingResult>
    >(API_ENDPOINTS.SYSTEM_ADMIN.ORGANISATIONS.APPROVE_ONBOARDING(id));
    return response.data.data;
  },
};

export const deviceApi = {
  /**
   * Fetch all devices with pagination
   */
  async getDevices(page = 1, pageSize = 10) {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Device>>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DEVICES.LIST,
        { params: { page, pageSize } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      throw error;
    }
  },

  /**
   * Fetch device details
   */
  async getDeviceDetail(id: string) {
    try {
      const response = await api.get<ApiResponse<Device>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DEVICES.DETAIL(id)
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch device detail:', error);
      throw error;
    }
  },

  /**
   * Fetch devices by organisation
   */
  async getDevicesByOrganisation(orgId: string) {
    try {
      const response = await api.get<ApiResponse<Device[]>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DEVICES.BY_ORGANISATION(orgId)
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch devices by organisation:', error);
      throw error;
    }
  },

  /**
   * Toggle device status
   */
  async toggleDeviceStatus(
    id: string,
    status: 'active' | 'inactive' | 'maintenance' | 'error'
  ) {
    try {
      const response = await api.post<ApiResponse<Device>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DEVICES.TOGGLE_STATUS(id),
        { status }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to toggle device status:', error);
      throw error;
    }
  },

  /**
   * Fetch device calibration logs
   */
  async getCalibrationLogs(deviceId: string) {
    try {
      const response = await api.get<ApiResponse<CalibrationLog[]>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DEVICES.CALIBRATION_LOGS(deviceId)
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch calibration logs:', error);
      throw error;
    }
  },

  /**
   * Fetch device alerts
   */
  async getDeviceAlerts() {
    try {
      const response = await api.get<ApiResponse<unknown[]>>(
        API_ENDPOINTS.SYSTEM_ADMIN.DEVICES.ALERTS
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch device alerts:', error);
      throw error;
    }
  },
};
