/**
 * Authentication API
 * API functions for user authentication, registration, and token management
 */

import { api } from '@/lib/api';
import { setItem, getItem } from '@/lib/local-storage';
import useAuthStore from '@/store/auth-store';
import type { ApiResponse } from '@/types/api-response';
import { unwrapApiData } from '@/types/api-response';
import { resolveAvatarUrl, resolvePreferredAvatarUrl } from '@/lib/user-avatar';
import type {
  LoginRequest,
  GoogleLoginRequest,
  RegisterPatientRequest,
  RegisterOrganisationRequest,
  VerifyTwoFactorRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ConfirmEmailRequest,
  AuthResponse,
  TwoFactorRequiredResponse,
  UserInfoResponse,
} from '../types';

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

const parseProfileIdFromToken = (token: string): string | null => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized)) as { profile_id?: string };
    return payload.profile_id ?? null;
  } catch {
    return null;
  }
};

const parsePermissionsFromToken = (token: string): string[] => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return [];

    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized)) as {
      permission?: string | string[];
    };

    if (Array.isArray(payload.permission)) {
      return payload.permission;
    }

    if (typeof payload.permission === 'string') {
      return [payload.permission];
    }

    return [];
  } catch {
    return [];
  }
};

const enrichUserWithPermissions = (
  user: UserInfoResponse,
  accessToken?: string
): UserInfoResponse => {
  const normalizedUser = normalizeUserAvatar(user);

  if (!accessToken) return normalizedUser;

  const profileId = parseProfileIdFromToken(accessToken);
  const permissions = parsePermissionsFromToken(accessToken);

  return {
    ...normalizedUser,
    roleId: normalizedUser.roleId || profileId,
    permissions: permissions,
  };
};

const normalizeUserAvatar = (user: UserInfoResponse): UserInfoResponse => {
  const uploadedAvatarUrl = resolveAvatarUrl(user.uploadedAvatarUrl) ?? null;
  const providerAvatarUrl = resolveAvatarUrl(user.providerAvatarUrl) ?? null;

  return {
    ...user,
    uploadedAvatarUrl,
    providerAvatarUrl,
    avatarUrl:
      resolvePreferredAvatarUrl({
        uploadedAvatarUrl,
        providerAvatarUrl,
        avatarUrl: user.avatarUrl,
      }) ?? null,
  };
};

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
  const captchaToken = data.turnstileToken;
  const response = await api.post<
    ApiResponse<AuthResponse | TwoFactorRequiredResponse>
  >(`${AUTH_BASE_URL}/login`, {
    ...data,
    recaptchaToken: captchaToken,
    deviceInfo: data.deviceInfo || navigator.userAgent,
  });

  const result = unwrapApiData<AuthResponse | TwoFactorRequiredResponse>(
    response.data
  );

  // If login successful (not 2FA required), save tokens
  if (
    !isTwoFactorRequired(result) &&
    result.succeeded &&
    result.accessToken &&
    result.refreshToken
  ) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      const enrichedUser = enrichUserWithPermissions(
        result.user,
        result.accessToken
      );
      result.user = enrichedUser;
      saveUser(enrichedUser);
    }
  }

  return result;
};

/**
 * Returns AuthResponse on success, or TwoFactorRequiredResponse if 2FA is enabled
 */
export const googleLogin = async (
  data: GoogleLoginRequest
): Promise<AuthResponse | TwoFactorRequiredResponse> => {
  const response = await api.post<
    ApiResponse<AuthResponse | TwoFactorRequiredResponse>
  >(`${AUTH_BASE_URL}/google-login`, {
    ...data,
    deviceInfo: data.deviceInfo || navigator.userAgent,
  });

  const result = unwrapApiData<AuthResponse | TwoFactorRequiredResponse>(
    response.data
  );

  // If login successful (not 2FA required), save tokens
  if (
    !isTwoFactorRequired(result) &&
    result.succeeded &&
    result.accessToken &&
    result.refreshToken
  ) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      const enrichedUser = enrichUserWithPermissions(
        result.user,
        result.accessToken
      );
      result.user = enrichedUser;
      saveUser(enrichedUser);
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

  const result = unwrapApiData<AuthResponse>(response.data);

  // Save tokens on successful 2FA verification
  if (result.succeeded && result.accessToken && result.refreshToken) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      const enrichedUser = enrichUserWithPermissions(
        result.user,
        result.accessToken
      );
      result.user = enrichedUser;
      saveUser(enrichedUser);
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
  return unwrapApiData<{ userId: string }>(response.data);
};

/**
 * Register a new organisation account
 */
export const registerOrganisation = async (
  data: RegisterOrganisationRequest
): Promise<{ requestId: string; email: string; message: string }> => {
  const response = await api.post<
    ApiResponse<{ requestId: string; email: string; message: string }>
  >(`${AUTH_BASE_URL}/register/organisation`, data);
  return unwrapApiData<{ requestId: string; email: string; message: string }>(
    response.data
  );
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

  const result = unwrapApiData<AuthResponse>(response.data);

  // Update stored tokens
  if (result.succeeded && result.accessToken && result.refreshToken) {
    saveAuthTokens(result.accessToken, result.refreshToken);
    if (result.user) {
      const enrichedUser = enrichUserWithPermissions(
        result.user,
        result.accessToken
      );
      result.user = enrichedUser;
      saveUser(enrichedUser);
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
    useAuthStore.getState().logout();
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
 * Confirm email address via token link
 */
export const confirmEmail = async (
  data: ConfirmEmailRequest
): Promise<void> => {
  await api.get(`${AUTH_BASE_URL}/confirm-email`, { params: data });
};

/**
 * Resend email confirmation link
 */
export const resendConfirmation = async (
  data: ForgotPasswordRequest
): Promise<void> => {
  await api.post(`${AUTH_BASE_URL}/resend-confirmation`, data);
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<UserInfoResponse> => {
  const response = await api.get<ApiResponse<UserInfoResponse>>(
    `${AUTH_BASE_URL}/me`
  );
  return normalizeUserAvatar(unwrapApiData<UserInfoResponse>(response.data));
};
