/**
 * Authentication API
 * API functions for user authentication, registration, and token management
 */

import { api } from '@/lib/api';
import { setItem, getItem } from '@/lib/local-storage';
import type {
  LoginRequest,
  RegisterPatientRequest,
  RegisterOphthalmologistRequest,
  VerifyTwoFactorRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ConfirmEmailRequest,
  AuthResponse,
  TwoFactorRequiredResponse,
  UserInfoResponse,
} from '../types';

interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
  errors?: string[];
}

// ==================== Type Guards ====================

export const isTwoFactorRequired = (
  response: AuthResponse | TwoFactorRequiredResponse
): response is TwoFactorRequiredResponse => {
  return 'requiresTwoFactor' in response && response.requiresTwoFactor === true;
};

// ==================== Storage Keys ====================

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// ==================== Token Management ====================

export const saveAuthTokens = (
  accessToken: string,
  refreshToken: string
): void => {
  setItem(TOKEN_KEY, accessToken);
  setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const saveUser = (user: UserInfoResponse): void => {
  setItem(USER_KEY, user);
};

export const getAccessToken = (): string | null => {
  return getItem<string>(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return getItem<string>(REFRESH_TOKEN_KEY);
};

export const getStoredUser = (): UserInfoResponse | null => {
  return getItem<UserInfoResponse>(USER_KEY);
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ==================== API Functions ====================

const AUTH_BASE_URL = '/auth';

/**
 * Login with email and password
 * Returns AuthResponse on success, or TwoFactorRequiredResponse if 2FA is enabled
 */
export const login = async (
  data: LoginRequest
): Promise<AuthResponse | TwoFactorRequiredResponse> => {
  const response = await api.post<
    ApiResponse<AuthResponse | TwoFactorRequiredResponse>
  >(`${AUTH_BASE_URL}/login`, {
    ...data,
    deviceInfo: data.deviceInfo || navigator.userAgent,
  });

  const result = response.data.data;

  // If login successful (not 2FA required), save tokens
  if (
    !isTwoFactorRequired(result) &&
    result.succeeded &&
    result.accessToken &&
    result.refreshToken
  ) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      saveUser(result.user);
    }
  }

  return result;
};

/**
 * Verify 2FA code and complete login
 */
export const verifyTwoFactorLogin = async (
  data: VerifyTwoFactorRequest
): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    `${AUTH_BASE_URL}/login/verify-2fa`,
    {
      ...data,
      deviceInfo: data.deviceInfo || navigator.userAgent,
    }
  );

  const result = response.data.data;

  // Save tokens on successful 2FA verification
  if (result.succeeded && result.accessToken && result.refreshToken) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      saveUser(result.user);
    }
  }

  return result;
};

/**
 * Register a new patient account
 */
export const registerPatient = async (
  data: RegisterPatientRequest
): Promise<{ userId: string }> => {
  const response = await api.post<ApiResponse<{ userId: string }>>(
    `${AUTH_BASE_URL}/register/patient`,
    data
  );
  return response.data.data;
};

/**
 * Register a new ophthalmologist account
 */
export const registerOphthalmologist = async (
  data: RegisterOphthalmologistRequest
): Promise<{ userId: string }> => {
  const response = await api.post<ApiResponse<{ userId: string }>>(
    `${AUTH_BASE_URL}/register/ophthalmologist`,
    data
  );
  return response.data.data;
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  const accessToken = getAccessToken();
  const refreshTokenValue = getRefreshToken();

  if (!accessToken || !refreshTokenValue) {
    throw new Error('No tokens available for refresh');
  }

  const response = await api.post<ApiResponse<AuthResponse>>(
    `${AUTH_BASE_URL}/refresh`,
    {
      accessToken,
      refreshToken: refreshTokenValue,
    }
  );

  const result = response.data.data;

  // Update stored tokens
  if (result.succeeded && result.accessToken && result.refreshToken) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      saveUser(result.user);
    }
  }

  return result;
};

/**
 * Logout - revoke refresh token
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post(`${AUTH_BASE_URL}/logout`);
  } finally {
    clearAuthData();
  }
};

/**
 * Request password reset email
 */
export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<void> => {
  await api.post(`${AUTH_BASE_URL}/forgot-password`, data);
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<void> => {
  await api.post(`${AUTH_BASE_URL}/reset-password`, data);
};

/**
 * Confirm email address
 */
export const confirmEmail = async (
  data: ConfirmEmailRequest
): Promise<void> => {
  await api.post(`${AUTH_BASE_URL}/confirm-email`, data);
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<UserInfoResponse> => {
  const response = await api.get<ApiResponse<UserInfoResponse>>(
    `${AUTH_BASE_URL}/me`
  );
  return response.data.data;
};
