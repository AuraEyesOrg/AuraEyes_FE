import { create } from 'zustand';
import { logger } from './logger';
import { getItem, setItem } from '@/lib/local-storage';

export interface AuthUser {
  id: string;
  roleId?: string | null;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  roles: string[];
  emailConfirmed: boolean;
  organizationId?: string | null;
  twoFactorEnabled: boolean;
  isVerified?: boolean | null;
  verificationStatus?: string | null;
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

const useAuthStore = create<AuthState>()(
  logger<AuthState>(
    (set) => ({
      isAuthenticated: !!getItem<AuthUser>(AUTH_USER_KEY),
      user: getItem<AuthUser>(AUTH_USER_KEY),

      setIsAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },

      setUser: (user) => {
        if (user) {
          setItem(AUTH_USER_KEY, user);
        } else {
          window.localStorage.removeItem(AUTH_USER_KEY);
        }
        set({ user });
      },

      login: (user) => {
        setItem(AUTH_USER_KEY, user);
        set({ isAuthenticated: true, user });
      },

      logout: () => {
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
