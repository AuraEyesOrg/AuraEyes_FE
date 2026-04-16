import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import GuestPageContextBar from '../components/GuestPageContextBar';
import MedicalTermTooltip from '../components/MedicalTermTooltip';
import SourceVerificationTag from '../components/SourceVerificationTag';
import { prefersReducedMotion } from '../utils/motion';

gsap.registerPlugin(ScrollTrigger);

const CompliancePage = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        '.compliance-hero-title',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.compliance-hero-desc',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' }
      );

      // Features cards
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.features-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const securityFeatures = [
    {
      icon: (
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: t('Compliance.security.encryption.title'),
      description: t('Compliance.security.encryption.description'),
    },
    {
      icon: (
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
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
      title: t('Compliance.security.mfa.title'),
      description: t('Compliance.security.mfa.description'),
    },
    {
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      title: t('Compliance.security.auditLogs.title'),
      description: t('Compliance.security.auditLogs.description'),
    },
    {
      icon: (
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      title: t('Compliance.security.backups.title'),
      description: t('Compliance.security.backups.description'),
    },
    {
      icon: (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: t('Compliance.security.uptime.title'),
      description: t('Compliance.security.uptime.description'),
    },
    {
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: t('Compliance.security.rbac.title'),
      description: t('Compliance.security.rbac.description'),
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[var(--color-medical-bg)]"
    >
      <Header />
      <GuestPageContextBar
        currentLabel={t('Navigation.compliance')}
        readingTimeMinutes={5}
        complexity="moderate"
        sourceLabel={t('GuestEnhancements.source.auraGovernance')}
      />
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 text-center">
            <h1 className="compliance-hero-title text-4xl font-bold leading-tight tracking-tight text-[var(--color-brand-dark)] sm:text-5xl lg:text-6xl mb-6">
              {t('Compliance.hero.titlePrefix')}{' '}
              <span className="text-[var(--color-brand-primary)]">
                {t('Compliance.hero.titleHighlight')}
              </span>
            </h1>

            <p className="compliance-hero-desc max-w-3xl mx-auto text-lg text-[var(--color-text-muted)] mb-12">
              {t('Compliance.hero.description')}
            </p>

            <div className="mb-8 flex flex-wrap justify-center gap-2 text-xs text-[var(--color-text-muted)]">
              <MedicalTermTooltip
                term={t('GuestEnhancements.terms.hipaa')}
                description={t('GuestEnhancements.tooltips.hipaa')}
              />
              <MedicalTermTooltip
                term={t('GuestEnhancements.terms.mfa')}
                description={t('GuestEnhancements.tooltips.mfa')}
              />
              <MedicalTermTooltip
                term={t('GuestEnhancements.terms.rbac')}
                description={t('GuestEnhancements.tooltips.rbac')}
              />
            </div>

            <div className="mb-8 flex justify-center">
              <SourceVerificationTag
                label={t('GuestEnhancements.source.auraGovernance')}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#security"
                className="inline-flex min-h-12 flex-col items-start justify-center rounded-lg bg-[var(--color-brand-primary)] px-6 py-2 text-left text-base font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <span>{t('Compliance.hero.primaryCta')}</span>
                <span className="guest-cta-subtext">
                  {t('GuestEnhancements.ctaSubtext.quickAction')}
                </span>
              </a>
              <Link
                to={resolvePathWithLocale('/contact')}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--color-medical-border)] bg-white px-6 text-base font-semibold text-[var(--color-brand-dark)] hover:bg-gray-50 transition-colors"
              >
                {t('Compliance.hero.secondaryCta')}
              </Link>
            </div>
          </div>
        </section>

        {/* Security Features Section */}
        <section id="security" className="features-section py-20 bg-gray-50">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-4">
                {t('Compliance.security.title')}
              </h2>
              <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
                {t('Compliance.security.description')}
              </p>
              <div className="mt-4 flex justify-center">
                <SourceVerificationTag
                  label={t('GuestEnhancements.source.auraGovernance')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-[var(--color-brand-primary)]/30 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                    {feature.icon}
                  </div>
                  <div>
                    <span className="mb-2 inline-flex rounded-full bg-[var(--color-brand-primary)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-brand-primary)]">
                      {t('GuestEnhancements.badges.securityControl')}
                    </span>
                    <h3 className="text-lg font-semibold text-[var(--color-brand-dark)] mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 text-center">
            <h2 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-4">
              {t('Compliance.cta.title')}
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8">
              {t('Compliance.cta.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={resolvePathWithLocale('/contact')}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-6 text-base font-semibold text-white hover:opacity-90 transition-opacity"
              >
                {t('Compliance.cta.primary')}
              </Link>
              <Link
                to={resolvePathWithLocale('/privacy')}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--color-medical-border)] bg-white px-6 text-base font-semibold text-[var(--color-brand-dark)] hover:bg-gray-50 transition-colors"
              >
                {t('Compliance.cta.secondary')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CompliancePage;
