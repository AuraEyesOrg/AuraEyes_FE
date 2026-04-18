import React, { useEffect } from 'react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import GuestPageContextBar from '../components/GuestPageContextBar';
import MedicalTermTooltip from '../components/MedicalTermTooltip';
import SourceVerificationTag from '../components/SourceVerificationTag';
import { SeoMeta } from '@/hooks/useSeoMeta';

const PersonalDataPage = () => {
  const { t } = useSafeTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col">
      <SeoMeta
        title="Personal Data Rights — AURA"
        description="Understand your personal data rights with AURA: access, rectification, erasure and consent withdrawal. Full GDPR compliance for all users."
        canonical="https://web.auraeyes.site/en/personal-data"
        noIndex={false}
      />
      <Header />
      <GuestPageContextBar
        currentLabel={t('GuestFooter.personalData')}
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
              {t('GuestLegal.personalData.header.title')}
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-sm text-white/75">
              {t('GuestEnhancements.subheadings.personalData')}
            </p>
            <p className="text-[var(--color-brand-primary)] font-medium tracking-widest uppercase">
              {t('GuestLegal.personalData.header.subtitle')}
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
              {t('GuestLegal.personalData.header.lastUpdated')}
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 py-10 md:px-16 md:py-14 space-y-12">
            <section
              className="bg-[var(--color-medical-bg)] p-6 rounded-2xl border border-[var(--color-medical-border)]"
              data-guest-reveal
            >
              <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
                <strong className="text-[var(--color-brand-dark)]">
                  {t('GuestLegal.personalData.intro.referenceLabel')}
                </strong>{' '}
                {t('GuestLegal.personalData.intro.referenceDescription')}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                <MedicalTermTooltip
                  term={t('GuestEnhancements.terms.gdpr')}
                  description={t('GuestEnhancements.tooltips.gdpr')}
                />
                <MedicalTermTooltip
                  term={t('GuestEnhancements.terms.phi')}
                  description={t('GuestEnhancements.tooltips.phi')}
                />
              </div>
              <div className="mt-4">
                <SourceVerificationTag
                  label={t('GuestEnhancements.source.auraGovernance')}
                />
              </div>
              <div className="my-4 w-12 h-1 bg-[var(--color-brand-primary)] rounded-full"></div>
              <p className="text-lg text-[var(--color-brand-dark)] font-medium leading-relaxed">
                {t('GuestLegal.personalData.intro.commitment')}
              </p>
            </section>

            <section data-guest-reveal>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  1
                </span>
                {t('GuestLegal.personalData.sections.rights.title')}
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                {t('GuestLegal.personalData.sections.rights.description')}
              </p>
              <div className="space-y-6">
                <div className="pl-6 border-l-2 border-[var(--color-medical-border)]">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.personalData.sections.rights.items.access.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.personalData.sections.rights.items.access.description'
                    )}
                  </p>
                </div>
                <div className="pl-6 border-l-2 border-[var(--color-medical-border)]">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.personalData.sections.rights.items.rectification.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.personalData.sections.rights.items.rectification.description'
                    )}
                  </p>
                </div>
                <div className="pl-6 border-l-2 border-[var(--color-medical-border)]">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.personalData.sections.rights.items.erasure.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.personalData.sections.rights.items.erasure.description'
                    )}
                  </p>
                </div>
                <div className="pl-6 border-l-2 border-[var(--color-medical-border)]">
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.personalData.sections.rights.items.withdrawConsent.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.personalData.sections.rights.items.withdrawConsent.description'
                    )}
                  </p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section data-guest-reveal>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  2
                </span>
                {t('GuestLegal.personalData.sections.retention.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.personalData.sections.retention.cards.active.title'
                    )}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.personalData.sections.retention.cards.active.description'
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.personalData.sections.retention.cards.deleted.title'
                    )}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.personalData.sections.retention.cards.deleted.description'
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.personalData.sections.retention.cards.legalFinancial.title'
                    )}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.personalData.sections.retention.cards.legalFinancial.description'
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
                {t('GuestLegal.personalData.sections.breach.title')}
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                {t('GuestLegal.personalData.sections.breach.description')}
              </p>
              <ul className="space-y-4 text-[var(--color-text-muted)] leading-relaxed">
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <span>
                    {t(
                      'GuestLegal.personalData.sections.breach.items.incidentResponse'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <span>
                    {t(
                      'GuestLegal.personalData.sections.breach.items.notifyAffectedUsers'
                    )}
                  </span>
                </li>
              </ul>
              <div className="mt-6">
                <SourceVerificationTag
                  label={t('GuestEnhancements.source.auraGovernance')}
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalDataPage;
