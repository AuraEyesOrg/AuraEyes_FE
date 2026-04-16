import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { LocaleSync } from '@/i18n/LocaleSync';
import {
  isSupportedLocale,
  stripLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { GuestTourProvider } from './tour';
import { detectPreferredLocale } from '@/i18n/middleware';
import GuestScrollProgress from './components/GuestScrollProgress';
import { prefersReducedMotion } from './utils/motion';

export const GuestLayout = () => {
  const { locale } = useParams();
  const location = useLocation();

  useEffect(() => {
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
  }, [location.pathname]);

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
    <div className="min-h-screen bg-[var(--color-medical-bg)]" data-guest-shell>
      <GuestScrollProgress />
      <LocaleSync />
      <Outlet />
    </div>
    <GuestTourProvider>
      <div className="min-h-screen bg-[var(--color-medical-bg)]">
        <LocaleSync />
        <Outlet />
      </div>
    </GuestTourProvider>
  );
};

export default GuestLayout;
