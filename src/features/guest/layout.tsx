import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { LocaleSync } from '@/i18n/LocaleSync';
import {
  isSupportedLocale,
  stripLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { GuestTourProvider } from './tour';
import { detectPreferredLocale } from '@/i18n/middleware';

export const GuestLayout = () => {
  const { locale } = useParams();
  const location = useLocation();

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
      <div className="min-h-screen bg-[var(--color-medical-bg)]">
        <LocaleSync />
        <Outlet />
      </div>
    </GuestTourProvider>
  );
};

export default GuestLayout;
