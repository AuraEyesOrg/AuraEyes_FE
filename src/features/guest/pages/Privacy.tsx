import React, { useEffect } from 'react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const PrivacyPage = () => {
  const { t } = useSafeTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col">
      <Header />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[var(--color-medical-border)] overflow-hidden">
          {/* Header Area */}
          <div className="bg-[var(--color-brand-dark)] px-8 py-12 md:px-16 md:py-16 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              {t('GuestLegal.privacy.header.title')}
            </h1>
            <p className="text-[var(--color-brand-primary)] font-medium tracking-widest uppercase">
              {t('GuestLegal.privacy.header.subtitle')}
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
              {t('GuestLegal.privacy.header.lastUpdated')}
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 py-10 md:px-16 md:py-14 space-y-12">
            <section className="bg-[var(--color-medical-bg)] p-6 rounded-2xl border border-[var(--color-medical-border)]">
              <p className="text-base text-[var(--color-text-muted)] leading-relaxed mb-4">
                <strong className="text-[var(--color-brand-dark)]">
                  {t('GuestLegal.privacy.intro.complianceLabel')}
                </strong>{' '}
                {t('GuestLegal.privacy.intro.complianceDescription')}
              </p>
              <div className="w-12 h-1 bg-[var(--color-brand-primary)] rounded-full mb-4"></div>
              <p className="text-lg text-[var(--color-brand-dark)] font-medium leading-relaxed">
                {t('GuestLegal.privacy.intro.commitment')}
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  1
                </span>
                {t('GuestLegal.privacy.sections.classification.title')}
              </h2>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                {t('GuestLegal.privacy.sections.classification.description')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-[var(--color-medical-border)]">
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.privacy.sections.classification.cards.pii.title'
                    )}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.privacy.sections.classification.cards.pii.description'
                    )}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[var(--color-medical-border)]">
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.privacy.sections.classification.cards.phi.title'
                    )}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.privacy.sections.classification.cards.phi.description'
                    )}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[var(--color-medical-border)]">
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.privacy.sections.classification.cards.professional.title'
                    )}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.privacy.sections.classification.cards.professional.description'
                    )}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[var(--color-medical-border)]">
                  <h3 className="text-base font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.privacy.sections.classification.cards.financial.title'
                    )}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.privacy.sections.classification.cards.financial.description'
                    )}
                  </p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  2
                </span>
                {t('GuestLegal.privacy.sections.usage.title')}
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      {t(
                        'GuestLegal.privacy.sections.usage.items.coreOperations.title'
                      )}
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      {t(
                        'GuestLegal.privacy.sections.usage.items.coreOperations.description'
                      )}
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      {t(
                        'GuestLegal.privacy.sections.usage.items.medicalCoordination.title'
                      )}
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      {t(
                        'GuestLegal.privacy.sections.usage.items.medicalCoordination.description'
                      )}
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
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
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      {t(
                        'GuestLegal.privacy.sections.usage.items.aiTraining.title'
                      )}
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      {t(
                        'GuestLegal.privacy.sections.usage.items.aiTraining.description'
                      )}
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
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
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <strong className="text-[var(--color-brand-dark)] block mb-1">
                      {t(
                        'GuestLegal.privacy.sections.usage.items.communication.title'
                      )}
                    </strong>
                    <span className="text-[var(--color-text-muted)]">
                      {t(
                        'GuestLegal.privacy.sections.usage.items.communication.description'
                      )}
                    </span>
                  </div>
                </li>
              </ul>
            </section>

            <div className="w-full h-px bg-[var(--color-medical-border)]"></div>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-brand-dark)] mb-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-lg">
                  3
                </span>
                {t('GuestLegal.privacy.sections.commitments.title')}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.privacy.sections.commitments.items.noCommercialization.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.privacy.sections.commitments.items.noCommercialization.descriptionPrefix'
                    )}{' '}
                    <span className="font-bold text-red-500">
                      {t(
                        'GuestLegal.privacy.sections.commitments.items.noCommercialization.highlight'
                      )}
                    </span>{' '}
                    {t(
                      'GuestLegal.privacy.sections.commitments.items.noCommercialization.descriptionSuffix'
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.privacy.sections.commitments.items.storageStandards.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.privacy.sections.commitments.items.storageStandards.description'
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t(
                      'GuestLegal.privacy.sections.commitments.items.dataSubjectRights.title'
                    )}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {t(
                      'GuestLegal.privacy.sections.commitments.items.dataSubjectRights.description'
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

export default PrivacyPage;
