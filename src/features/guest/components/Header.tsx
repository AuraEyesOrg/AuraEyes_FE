import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuraLogo } from '@/components/ui/aura-logo';
import { PremiumLanguageSwitcher } from '@/components/ui/PremiumLanguageSwitcher';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  stripLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { useGuestTour } from '../tour';

export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { startTourFromHelp } = useGuestTour();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;

  const navLinks = [
    { href: '/', label: t('Navigation.home') },
    { href: '/about', label: t('Navigation.about') },
    { href: '/how-it-works', label: t('Navigation.howItWorks') },
    { href: '/ethics', label: t('Navigation.ethicsPrivacy') },
    { href: '/contact', label: t('Navigation.contact') },
  ];

  const isActive = (href: string) => {
    const currentPath = stripLocaleFromPathname(location.pathname);

    if (href === '/') {
      return currentPath === '/';
    }

    return currentPath.startsWith(href);
  };

  const getTourSelectorByHref = (href: string) => {
    if (href === '/about') return 'guest-nav-about';
    if (href === '/how-it-works') return 'guest-nav-how-it-works';
    if (href === '/contact') return 'guest-nav-contact-orga';
    return undefined;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div data-tour="guest-logo-home">
          <AuraLogo variant="dark" size="md" to={withLocalePathname(locale)} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={withLocalePathname(locale, link.href)}
              data-tour={getTourSelectorByHref(link.href)}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-[#319795] font-semibold'
                  : 'text-[#718096] hover:text-[#2C5282]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={startTourFromHelp}
            className="inline-flex items-center justify-center rounded-lg border border-[#D6E3F0] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#2C5282] hover:border-[#A6C2DC] hover:bg-[#F7FAFC] transition-colors"
          >
            {t('Common.helpTour', { defaultValue: 'Hướng dẫn' })}
          </button>

          <PremiumLanguageSwitcher className="hidden sm:inline-flex" />

          <Link
            to="/login"
            data-tour="guest-cta-get-started"
            className="magnetic-btn inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-6 text-base font-bold text-white hover:brightness-110 transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/30"
          >
            {t('Common.getStarted')}
          </Link>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-[#718096] hover:text-[#1A202C]">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
