/**
 * Two-Factor Authentication API
 * API functions for 2FA management
 */

import { api } from '@/lib/api';
import type {
  TwoFactorStatusResponse,
  TwoFactorSetupResponse,
  EnableTwoFactorRequest,
  EnableTwoFactorResponse,
  DisableTwoFactorRequest,
  GenerateRecoveryCodesRequest,
  RecoveryCodesResponse,
} from '../types';

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

const TWO_FACTOR_BASE_URL = '/two-factor';

/**
 * Get 2FA status for the current user
 */
export const getTwoFactorStatus =
  async (): Promise<TwoFactorStatusResponse> => {
    const response = await api.get<ApiResponse<TwoFactorStatusResponse>>(
      `${TWO_FACTOR_BASE_URL}/status`
    );
    return response.data.data;
  };

/**
 * Setup 2FA: Generate authenticator key and QR code URI
 */
export const setupTwoFactor = async (): Promise<TwoFactorSetupResponse> => {
  const response = await api.post<ApiResponse<TwoFactorSetupResponse>>(
    `${TWO_FACTOR_BASE_URL}/setup`
  );
  return response.data.data;
};

/**
 * Enable 2FA after verifying the TOTP code
 */
export const enableTwoFactor = async (
  data: EnableTwoFactorRequest
): Promise<EnableTwoFactorResponse> => {
  const response = await api.post<ApiResponse<EnableTwoFactorResponse>>(
    `${TWO_FACTOR_BASE_URL}/enable`,
    data
  );
  return response.data.data;
};

/**
 * Disable 2FA for the current user
 */
export const disableTwoFactor = async (
  data: DisableTwoFactorRequest
): Promise<void> => {
  await api.post(`${TWO_FACTOR_BASE_URL}/disable`, data);
};

/**
 * Generate new recovery codes
 */
export const generateRecoveryCodes = async (
  data: GenerateRecoveryCodesRequest
): Promise<RecoveryCodesResponse> => {
  const response = await api.post<ApiResponse<RecoveryCodesResponse>>(
    `${TWO_FACTOR_BASE_URL}/recovery-codes`,
    data
  );
  return response.data.data;
};
