import { create } from 'zustand';
import { logger } from './logger';
import { getItem, setItem } from '@/lib/local-storage';
import { queryClient } from '@/lib/react-query';
import { resolveAvatarUrl, resolvePreferredAvatarUrl } from '@/lib/user-avatar';
import useNotificationStore from './useNotificationStore';

export interface AuthUser {
  id: string;
  roleId?: string | null;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  uploadedAvatarUrl?: string | null;
  providerAvatarUrl?: string | null;
  roles: string[];
  emailConfirmed: boolean;
  organizationId?: string | null;
  employmentType?: 'FullTime' | 'PartTime' | null;
  twoFactorEnabled: boolean;
  mustChangePassword?: boolean | null;
  isVerified?: boolean | null;
  verificationStatus?: string | null;
  contractStatus?: string | null;
}

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AUTH_USER_KEY = 'user';

const normalizeAuthUser = (user: AuthUser): AuthUser => {
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

const hydrateAuthUser = (): AuthUser | null => {
  const storedUser = getItem<AuthUser>(AUTH_USER_KEY);
  return storedUser ? normalizeAuthUser(storedUser) : null;
};

const hydratedUser = hydrateAuthUser();

const useAuthStore = create<AuthState>()(
  logger<AuthState>(
    (set) => ({
      isAuthenticated: !!hydratedUser,
      user: hydratedUser,

      setIsAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },

      setUser: (user) => {
        if (user) {
          const normalizedUser = normalizeAuthUser(user);
          setItem(AUTH_USER_KEY, normalizedUser);
          set({ user: normalizedUser, isAuthenticated: true });
        } else {
          window.localStorage.removeItem(AUTH_USER_KEY);
          set({ user: null, isAuthenticated: false });
        }
      },

      login: (user) => {
        const normalizedUser = normalizeAuthUser(user);
        setItem(AUTH_USER_KEY, normalizedUser);
        set({ isAuthenticated: true, user: normalizedUser });
      },

      logout: () => {
        useNotificationStore.getState().clearNotifications();
        queryClient.clear();
        window.localStorage.removeItem(AUTH_USER_KEY);
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('refreshToken');
        set({ isAuthenticated: false, user: null });
      },
    }),
    'authStore'
  )
);

export default useAuthStore;
