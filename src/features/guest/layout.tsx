import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { LocaleSync } from '@/i18n/LocaleSync';
import {
  isSupportedLocale,
  stripLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { GuestTourProvider } from './tour';
import {
  detectPreferredLocale,
  resolvePathWithLocale,
} from '@/i18n/middleware';
import GuestScrollProgress from './components/GuestScrollProgress';
import GuestTourFAB from './components/GuestTourFAB';
import { prefersReducedMotion } from './utils/motion';
import useAuthStore from '@/store/auth-store';

/**
 * Maps a user's roles to their home dashboard path.
 * Mirrors the same logic in public-route.tsx so both stay consistent.
 */
const resolveDashboardPath = (roles: string[]): string => {
  if (roles.includes('SystemAdmin')) return '/system-admin/dashboard';
  if (roles.includes('OrgAdmin') || roles.includes('Organization'))
    return '/organisation/dashboard';
  if (roles.includes('ClinicStaff')) return '/clinic-staff/dashboard';
  if (roles.includes('Ophthalmologist')) return '/ophthalmologist/dashboard';
  return '/patient/dashboard';
};

export const GuestLayout = () => {
  const { locale } = useParams();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore((state) => state);

  // Must call all hooks before any conditional returns (Rules of Hooks)
  useEffect(() => {
    // Skip animation setup when the user is authenticated — they will be
    // redirected before the guest shell renders.
    if (isAuthenticated) return;

    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-guest-reveal]')
    );

    if (revealTargets.length === 0) {
      return;
    }

    const hasReducedMotionPreference = prefersReducedMotion();

    if (hasReducedMotionPreference) {
      revealTargets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    revealTargets.forEach((target) => target.classList.remove('is-visible'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    revealTargets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, [location.pathname, isAuthenticated]);

  // ── Auth guard: redirect logged-in users straight to their dashboard ──
  // This comes AFTER hooks to satisfy the Rules of Hooks.
  if (isAuthenticated && user) {
    const roles = user.roles ?? [];
    const dashboardPath = resolveDashboardPath(roles);
    return <Navigate to={resolvePathWithLocale(dashboardPath)} replace />;
  }

  if (!locale || !isSupportedLocale(locale)) {
    const preferredLocale = detectPreferredLocale();
    const pathnameWithoutLocale = stripLocaleFromPathname(location.pathname);
    const redirectPath = withLocalePathname(
      preferredLocale,
      pathnameWithoutLocale
    );

    return (
      <Navigate
        replace
        to={`${redirectPath}${location.search ?? ''}${location.hash ?? ''}`}
      />
    );
  }

  return (
    <GuestTourProvider>
      <div
        className="min-h-screen bg-[var(--color-medical-bg)] relative"
        data-guest-shell
      >
        <GuestScrollProgress />
        <LocaleSync />
        <Outlet />
        <GuestTourFAB />
      </div>
    </GuestTourProvider>
  );
};

export default GuestLayout;
