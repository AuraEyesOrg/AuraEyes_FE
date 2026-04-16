import React, { useEffect } from 'react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import GuestPageContextBar from '../components/GuestPageContextBar';
import MedicalTermTooltip from '../components/MedicalTermTooltip';
import SourceVerificationTag from '../components/SourceVerificationTag';

const TermsOfUsePage = () => {
  const { t } = useSafeTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col">
      <Header />
      <GuestPageContextBar
        currentLabel={t('GuestFooter.terms')}
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
              {t('GuestLegal.terms.header.title')}
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-sm text-white/75">
              {t('GuestEnhancements.subheadings.terms')}
            </p>
            <p className="text-[var(--color-brand-primary)] font-medium tracking-widest uppercase">
              {t('GuestLegal.terms.header.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/20">
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
                {t('GuestLegal.terms.header.lastUpdated')}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)]/20 px-4 py-2 text-sm font-medium text-[var(--color-brand-primary)] ring-1 ring-inset ring-[var(--color-brand-primary)]">
                {t('GuestLegal.terms.header.version')}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 py-10 md:px-16 md:py-14 space-y-12">
            <section
              className="bg-[var(--color-medical-bg)] p-6 md:p-8 rounded-2xl border border-[var(--color-medical-border)] text-center"
              data-guest-reveal
            >
              <p className="text-lg text-[var(--color-brand-dark)] font-medium leading-relaxed">
                {t('GuestLegal.terms.intro.welcome')}
              </p>
              <div className="mt-4 text-base text-[var(--color-text-muted)] leading-relaxed">
                {t('GuestLegal.terms.intro.description')}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-[var(--color-text-muted)]">
                <MedicalTermTooltip
                  term={t('GuestEnhancements.terms.phi')}
                  description={t('GuestEnhancements.tooltips.phi')}
                />
                <MedicalTermTooltip
                  term={t('GuestEnhancements.terms.gdpr')}
                  description={t('GuestEnhancements.tooltips.gdpr')}
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
                {t('GuestLegal.terms.sections.serviceNature.title')}
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                {t('GuestLegal.terms.sections.serviceNature.description')}
              </p>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                <h3 className="flex items-center gap-2 text-red-800 font-bold text-lg mb-2">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  {t(
                    'GuestLegal.terms.sections.serviceNature.disclaimer.title'
                  )}
                </h3>
                <p className="text-red-700 leading-relaxed text-sm">
                  {t(
                    'GuestLegal.terms.sections.serviceNature.disclaimer.descriptionPrefix'
                  )}{' '}
                  <strong className="font-bold">
                    {t(
                      'GuestLegal.terms.sections.serviceNature.disclaimer.highlight'
                    )}
                  </strong>
                  {t(
                    'GuestLegal.terms.sections.serviceNature.disclaimer.descriptionSuffix'
                  )}
                </p>
              </div>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section data-guest-reveal>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  2
                </span>
                {t('GuestLegal.terms.sections.userResponsibilities.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[var(--color-medical-border)] hover:border-[var(--color-brand-primary)] transition-colors shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-3">
                    {t(
                      'GuestLegal.terms.sections.userResponsibilities.cards.patient.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                    {t(
                      'GuestLegal.terms.sections.userResponsibilities.cards.patient.description'
                    )}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[var(--color-medical-border)] hover:border-[var(--color-brand-primary)] transition-colors shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-3">
                    {t(
                      'GuestLegal.terms.sections.userResponsibilities.cards.medicalProfessional.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                    {t(
                      'GuestLegal.terms.sections.userResponsibilities.cards.medicalProfessional.description'
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
                {t('GuestLegal.terms.sections.payment.title')}
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-dark)]"></div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      {t(
                        'GuestLegal.terms.sections.payment.items.paymentGateway.title'
                      )}
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      {t(
                        'GuestLegal.terms.sections.payment.items.paymentGateway.description'
                      )}
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-dark)]"></div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      {t(
                        'GuestLegal.terms.sections.payment.items.financialTransparency.title'
                      )}
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      {t(
                        'GuestLegal.terms.sections.payment.items.financialTransparency.description'
                      )}
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-dark)]"></div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      {t(
                        'GuestLegal.terms.sections.payment.items.withdrawalPolicy.title'
                      )}
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      {t(
                        'GuestLegal.terms.sections.payment.items.withdrawalPolicy.description'
                      )}
                    </span>
                  </div>
                </li>
              </ul>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section data-guest-reveal>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  4
                </span>
                {t('GuestLegal.terms.sections.intellectualProperty.title')}
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                {t(
                  'GuestLegal.terms.sections.intellectualProperty.description'
                )}
              </p>
              <div className="bg-[var(--color-medical-bg)] border border-[var(--color-medical-border)] rounded-xl p-4 text-center">
                <p className="text-[var(--color-brand-dark)] font-bold">
                  {t('GuestLegal.terms.sections.intellectualProperty.notice')}
                </p>
              </div>
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

export default TermsOfUsePage;
