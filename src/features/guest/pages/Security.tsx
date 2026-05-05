import React, { useEffect } from 'react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import GuestPageContextBar from '../components/GuestPageContextBar';
import MedicalTermTooltip from '../components/MedicalTermTooltip';
import SourceVerificationTag from '../components/SourceVerificationTag';
import { SeoMeta } from '@/hooks/useSeoMeta';

const SecurityPage = () => {
  const { t } = useSafeTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col">
      <SeoMeta
        title="Security — AURA Data Protection"
        description="AURA secures all patient data with AES-256 encryption, RBAC access control, MFA, and continuous security monitoring. Enterprise-grade protection for medical data."
        canonical="https://web.auraeyes.site/en/security"
        noIndex={false}
      />
      <Header />
      <GuestPageContextBar
        currentLabel={t('GuestFooter.security')}
        readingTimeMinutes={7}
        complexity="advanced"
        sourceLabel={t('GuestEnhancements.source.auraGovernance')}
      />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div
          className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[var(--color-medical-border)] overflow-hidden"
          data-guest-reveal
        >
          {/* Header Area */}
          <div
            className="bg-[var(--color-brand-dark)] px-8 py-12 md:px-16 md:py-16 text-center"
            data-guest-reveal
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              {t('GuestLegal.security.header.title')}
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-sm text-white/75">
              {t('GuestEnhancements.subheadings.security')}
            </p>
            <p className="text-[var(--color-brand-primary)] font-medium tracking-widest uppercase">
              {t('GuestLegal.security.header.subtitle')}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/20">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {t('GuestLegal.security.header.lastUpdated')}
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 py-10 md:px-16 md:py-14 space-y-12">
            <section
              className="bg-[var(--color-medical-bg)] p-6 md:p-8 rounded-2xl border border-[var(--color-medical-border)] text-center"
              data-guest-reveal
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className="text-lg text-[var(--color-brand-dark)] font-medium leading-relaxed">
                {t('GuestLegal.security.intro.title')}
              </p>
              <p className="mt-4 text-base text-[var(--color-text-muted)] leading-relaxed">
                {t('GuestLegal.security.intro.description')}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-[var(--color-text-muted)]">
                <MedicalTermTooltip
                  term={t('GuestEnhancements.terms.mfa')}
                  description={t('GuestEnhancements.tooltips.mfa')}
                />
                <MedicalTermTooltip
                  term={t('GuestEnhancements.terms.rbac')}
                  description={t('GuestEnhancements.tooltips.rbac')}
                />
                <MedicalTermTooltip
                  term={t('GuestEnhancements.terms.hipaa')}
                  description={t('GuestEnhancements.tooltips.hipaa')}
                />
              </div>
              <div className="mt-4 flex justify-center">
                <SourceVerificationTag
                  label={t('GuestEnhancements.source.auraGovernance')}
                />
              </div>
            </section>

            <section data-guest-reveal>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  1
                </span>
                {t('GuestLegal.security.sections.encryption.title')}
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                {t('GuestLegal.security.sections.encryption.description')}
              </p>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[var(--color-brand-primary)] transition-colors shadow-sm">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[var(--color-brand-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    {t(
                      'GuestLegal.security.sections.encryption.cards.dataAtRest.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.security.sections.encryption.cards.dataAtRest.description'
                    )}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[var(--color-brand-primary)] transition-colors shadow-sm">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[var(--color-brand-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    {t(
                      'GuestLegal.security.sections.encryption.cards.dataInTransit.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.security.sections.encryption.cards.dataInTransit.description'
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <SourceVerificationTag
                  label={t('GuestEnhancements.source.auraGovernance')}
                />
              </div>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section data-guest-reveal>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  2
                </span>
                {t('GuestLegal.security.sections.accessControl.title')}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.security.sections.accessControl.items.rbac.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.security.sections.accessControl.items.rbac.description'
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.security.sections.accessControl.items.mfa.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.security.sections.accessControl.items.mfa.description'
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.security.sections.accessControl.items.sessionManagement.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.security.sections.accessControl.items.sessionManagement.description'
                    )}
                  </p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section data-guest-reveal>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  3
                </span>
                {t('GuestLegal.security.sections.infrastructure.title')}
              </h2>
              <ul className="space-y-4 text-[var(--color-text-muted)] leading-relaxed list-disc pl-5">
                <li>
                  <strong className="text-[var(--color-brand-dark)]">
                    {t(
                      'GuestLegal.security.sections.infrastructure.items.certifications.label'
                    )}
                  </strong>{' '}
                  {t(
                    'GuestLegal.security.sections.infrastructure.items.certifications.description'
                  )}
                </li>
                <li>
                  <strong className="text-[var(--color-brand-dark)]">
                    {t(
                      'GuestLegal.security.sections.infrastructure.items.waf.label'
                    )}
                  </strong>{' '}
                  {t(
                    'GuestLegal.security.sections.infrastructure.items.waf.description'
                  )}
                </li>
                <li>
                  <strong className="text-[var(--color-brand-dark)]">
                    {t(
                      'GuestLegal.security.sections.infrastructure.items.isolation.label'
                    )}
                  </strong>{' '}
                  {t(
                    'GuestLegal.security.sections.infrastructure.items.isolation.description'
                  )}
                </li>
              </ul>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section data-guest-reveal>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  4
                </span>
                {t('GuestLegal.security.sections.monitoring.title')}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.security.sections.monitoring.items.auditLogs.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.security.sections.monitoring.items.auditLogs.description'
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.security.sections.monitoring.items.continuousMonitoring.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.security.sections.monitoring.items.continuousMonitoring.description'
                    )}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SecurityPage;
