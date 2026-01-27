/**
 * Auth Feature API Exports
 */

// Auth API
export {
  login,
  verifyTwoFactorLogin,
  registerPatient,
  registerOphthalmologist,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  confirmEmail,
  getCurrentUser,
  isTwoFactorRequired,
  saveAuthTokens,
  saveUser,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  clearAuthData,
} from './auth.api';

// Two-Factor API
export {
  getTwoFactorStatus,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  generateRecoveryCodes,
} from './two-factor.api';
