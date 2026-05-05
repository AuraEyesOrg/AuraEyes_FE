/**
 * Auth Feature API Exports
 */

// Auth API
export {
  login,
  googleLogin,
  verifyTwoFactorLogin,
  registerPatient,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  confirmEmail,
  resendConfirmation,
  getCurrentUser,
  isTwoFactorRequired,
  saveAuthTokens,
  saveUser,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  clearAuthData,
  onboardOphthalmologist,
  onboardClinicStaff,
  changePassword,
} from './auth.api';

// Two-Factor API
export {
  getTwoFactorStatus,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  generateRecoveryCodes,
} from './two-factor.api';
