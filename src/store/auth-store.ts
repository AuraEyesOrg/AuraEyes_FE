import { create } from 'zustand';
import { logger } from './logger';
import { getItem, setItem } from '@/lib/local-storage';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  avatarUrl?: string;
  organizationId?: string;
}

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: AuthUser | null) => void;
};

const useAuthStore = create<AuthState>()(
  logger<AuthState>(
    (set) => ({
      isAuthenticated: true,
      user: getItem<AuthUser>('user'),
      setIsAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },
      setUser: (user) => {
        if (user) {
          setItem('user', user);
        }
        set({ user });
      },
    }),
    'authStore'
  )
);

export default useAuthStore;
