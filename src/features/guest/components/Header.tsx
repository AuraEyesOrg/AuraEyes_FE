import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuraLogo } from '@/components/ui/aura-logo';
import { PremiumLanguageSwitcher } from '@/components/ui/PremiumLanguageSwitcher';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  stripLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';

export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <AuraLogo variant="dark" size="md" to={withLocalePathname(locale)} />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={withLocalePathname(locale, link.href)}
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
          <ThemeToggleButton className="hidden sm:inline-flex" />
          <PremiumLanguageSwitcher className="hidden sm:inline-flex" />

          <Link
            to={withLocalePathname(locale, '/login')}
            className="magnetic-btn inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-6 text-base font-bold text-white hover:brightness-110 transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/30"
          >
            {t('Common.getStarted')}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="md:hidden p-2 text-[#718096] hover:text-[#1A202C]"
            aria-label={t('Common.toggleMenu')}
            aria-expanded={isMobileMenuOpen}
          >
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

      {isMobileMenuOpen ? (
        <div className="border-t border-[#E2E8F0] bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={withLocalePathname(locale, link.href)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-[#E6FFFA] text-[#319795]'
                    : 'text-[#718096] hover:bg-[#F7FAFC] hover:text-[#2C5282]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 flex items-center gap-2">
              <PremiumLanguageSwitcher className="flex-1" />
              <ThemeToggleButton />
            </div>

            <Link
              to={withLocalePathname(locale, '/login')}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-4 text-sm font-bold text-white hover:brightness-110 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('Common.getStarted')}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
