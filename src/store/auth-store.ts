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
  employmentType?: 'FullTime' | 'PartTime' | null;
  twoFactorEnabled: boolean;
  contractStatus?: string | null;
  permissions?: string[];
  subRoles?: string[];
  mustUpdateProfile: boolean;
}

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: any) => void;
  setStoredUser: (user: any) => void;
  login: (user: any) => void;
  logout: () => void;
};

const areStringArraysEqual = (a: string[] = [], b: string[] = []): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
};

const isSameAuthUser = (a: AuthUser, b: AuthUser): boolean => {
  return (
    a.id === b.id &&
    a.roleId === b.roleId &&
    a.email === b.email &&
    a.fullName === b.fullName &&
    a.avatarUrl === b.avatarUrl &&
    a.uploadedAvatarUrl === b.uploadedAvatarUrl &&
    a.providerAvatarUrl === b.providerAvatarUrl &&
    a.emailConfirmed === b.emailConfirmed &&
    a.employmentType === b.employmentType &&
    a.twoFactorEnabled === b.twoFactorEnabled &&
    a.contractStatus === b.contractStatus &&
    areStringArraysEqual(a.roles, b.roles) &&
    areStringArraysEqual(a.permissions ?? [], b.permissions ?? []) &&
    areStringArraysEqual(a.subRoles ?? [], b.subRoles ?? []) &&
    a.mustUpdateProfile === b.mustUpdateProfile
  );
};

const AUTH_USER_KEY = 'user';

const normalizeAuthUser = (user: any): AuthUser => {
  const uploadedAvatarUrl = resolveAvatarUrl(user.uploadedAvatarUrl) ?? null;
  const providerAvatarUrl = resolveAvatarUrl(user.providerAvatarUrl) ?? null;

  // Normalize roles to match frontend expectations (PascalCase)
  const normalizedRoles = (user.roles ?? []).map((role: any) => {
    const r = role.toLowerCase().replace(/[\s_-]/g, '');
    if (r === 'systemadmin' || r === 'admin') return 'SystemAdmin';
    if (r === 'ophthalmologist' || r === 'doctor') return 'Ophthalmologist';
    if (r === 'clinicstaff') return 'ClinicStaff';
    if (r === 'patient') return 'Patient';
    return role; // Fallback
  });

  return {
    ...user,
    roles: normalizedRoles,
    subRoles: (user as any).staffSubRoles
      ? (user as any).staffSubRoles
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [],
    uploadedAvatarUrl,
    providerAvatarUrl,
    avatarUrl:
      resolvePreferredAvatarUrl({
        uploadedAvatarUrl,
        providerAvatarUrl,
        avatarUrl: user.avatarUrl,
      }) ?? null,
    mustUpdateProfile: !!(user.mustUpdateProfile || user.MustUpdateProfile),
  };
};

const hydrateAuthUser = (): AuthUser | null => {
  const storedUser = getItem<AuthUser>(AUTH_USER_KEY);
  return storedUser ? normalizeAuthUser(storedUser) : null;
};

const hydratedUser = hydrateAuthUser();

const useAuthStore = create<AuthState>()(
  logger<AuthState>(
    (set, get) => ({
      isAuthenticated: !!hydratedUser,
      user: hydratedUser,

      setIsAuthenticated: (isAuthenticated) => {
        if (get().isAuthenticated === isAuthenticated) {
          return;
        }

        set({ isAuthenticated });
      },

      setUser: (user) => {
        if (user) {
          const normalizedUser = normalizeAuthUser(user);

          const currentState = get();
          if (
            currentState.user &&
            currentState.isAuthenticated &&
            isSameAuthUser(currentState.user, normalizedUser)
          ) {
            return;
          }

          setItem(AUTH_USER_KEY, normalizedUser);
          set({ user: normalizedUser, isAuthenticated: true });
        } else {
          const currentState = get();
          if (!currentState.user && !currentState.isAuthenticated) {
            return;
          }

          window.localStorage.removeItem(AUTH_USER_KEY);
          set({ user: null, isAuthenticated: false });
        }
      },

      setStoredUser: (user) => get().setUser(user),

      login: (user) => {
        const normalizedUser = normalizeAuthUser(user);

        const currentState = get();
        if (
          currentState.user &&
          currentState.isAuthenticated &&
          isSameAuthUser(currentState.user, normalizedUser)
        ) {
          return;
        }

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
