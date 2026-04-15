import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const EthicsPrivacyPage = () => {
  const { t } = useSafeTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        '.hero-content > *',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' }
      );

      // Pillar cards
      gsap.fromTo(
        '.pillar-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.pillars-section',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Data journey steps
      gsap.fromTo(
        '.journey-step',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.journey-section',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Timeline line
      gsap.fromTo(
        '.timeline-line-fill',
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          duration: 1,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: '.journey-section',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // FAQ items
      gsap.fromTo(
        '.faq-item',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.faq-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const pillars = [
    {
      title: t('EthicsPrivacy.pillars.privacy.title'),
      description: t('EthicsPrivacy.pillars.privacy.description'),
      icon: (
        <svg
          className="w-7 h-7"
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
    },
    {
      title: t('EthicsPrivacy.pillars.ethicalAi.title'),
      description: t('EthicsPrivacy.pillars.ethicalAi.description'),
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      ),
    },
    {
      title: t('EthicsPrivacy.pillars.transparency.title'),
      description: t('EthicsPrivacy.pillars.transparency.description'),
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
    },
  ];

  const dataJourney = [
    {
      step: 1,
      title: t('EthicsPrivacy.dataJourney.upload.title'),
      description: t('EthicsPrivacy.dataJourney.upload.description'),
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      step: 2,
      title: t('EthicsPrivacy.dataJourney.anonymization.title'),
      description: t('EthicsPrivacy.dataJourney.anonymization.description'),
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
          />
        </svg>
      ),
    },
    {
      step: 3,
      title: t('EthicsPrivacy.dataJourney.analysis.title'),
      description: t('EthicsPrivacy.dataJourney.analysis.description'),
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      step: 4,
      title: t('EthicsPrivacy.dataJourney.delivery.title'),
      description: t('EthicsPrivacy.dataJourney.delivery.description'),
      icon: (
        <svg
          className="w-7 h-7"
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
      ),
    },
  ];

  const faqs = [
    {
      question: t('EthicsPrivacy.faq.datasets.question'),
      answer: t('EthicsPrivacy.faq.datasets.answer'),
    },
    {
      question: t('EthicsPrivacy.faq.humanLoop.question'),
      answer: t('EthicsPrivacy.faq.humanLoop.answer'),
    },
    {
      question: t('EthicsPrivacy.faq.edgeCases.question'),
      answer: t('EthicsPrivacy.faq.edgeCases.answer'),
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--color-medical-bg)]"
    >
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden">
          {/* Subtle pattern background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23319795' fill-opacity='0.08' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='2'/%3E%3Ccircle cx='13' cy='13' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative z-10">
            <div className="mx-auto max-w-4xl">
              {/* Left Content */}
              <div className="hero-content text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--color-brand-primary)] mb-6 ring-1 ring-inset ring-[var(--color-brand-primary)]/20">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-brand-primary)]"></span>
                  {t('EthicsPrivacy.hero.badge')}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--color-brand-dark)] leading-tight mb-6">
                  {t('EthicsPrivacy.hero.titleLine1')}
                  <br />
                  <span className="text-[var(--color-brand-primary)]">
                    {t('EthicsPrivacy.hero.titleLine2')}
                  </span>
                </h1>

                <p className="text-lg text-[var(--color-text-muted)] leading-relaxed mb-8 max-w-xl mx-auto">
                  {t('EthicsPrivacy.hero.description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById('principles')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-lg text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)] transition-colors"
                  >
                    {t('EthicsPrivacy.hero.primaryCta')}
                  </button>
                  <Link
                    to={resolvePathWithLocale('/privacy')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg text-[var(--color-brand-dark)] border border-[var(--color-medical-border)] hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-medical-bg)] transition-colors"
                  >
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
                        d="M12 3l7 4v5c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V7l7-4z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                    {t('EthicsPrivacy.hero.secondaryCta')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Pillars Section */}
        <section
          id="principles"
          className="pillars-section py-20 bg-[var(--color-medical-bg)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)] mb-4">
                {t('EthicsPrivacy.pillarsSection.title')}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)]">
                {t('EthicsPrivacy.pillarsSection.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="pillar-card group bg-white rounded-2xl p-8 border border-[var(--color-medical-border)] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-[var(--color-brand-primary)]/10 rounded-xl flex items-center justify-center mb-6 text-[var(--color-brand-primary)] group-hover:bg-[var(--color-brand-primary)]/20 transition-colors">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-brand-dark)] mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Journey Section */}
        <section className="journey-section py-20 bg-white border-t border-[var(--color-medical-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Sticky Left Side */}
              <div className="md:w-1/3 md:sticky md:top-24">
                <h2 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-4">
                  {t('EthicsPrivacy.journey.title')}
                </h2>
                <p className="text-[var(--color-text-muted)] mb-8 leading-relaxed">
                  {t('EthicsPrivacy.journey.description')}
                </p>
                <Link
                  to={resolvePathWithLocale('/security')}
                  className="inline-flex items-center gap-1 text-[var(--color-brand-primary)] font-bold hover:text-[var(--color-brand-primary)] transition-colors"
                >
                  {t('EthicsPrivacy.journey.link')}
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>

              {/* Timeline Right Side */}
              <div className="md:w-2/3 w-full">
                <div className="relative pl-8 border-l-2 border-[var(--color-medical-border)] space-y-10">
                  {/* Animated line fill */}
                  <div className="timeline-line-fill absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-brand-primary)] -ml-[1px]" />

                  {dataJourney.map((step, index) => (
                    <div key={index} className="journey-step relative">
                      {/* Dot */}
                      <span className="absolute -left-[41px] top-0 h-5 w-5 rounded-full border-4 border-white bg-[var(--color-brand-primary)]" />

                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-[var(--color-medical-bg)] p-6 rounded-xl">
                        <div className="bg-white p-3 rounded-lg h-fit shadow-sm border border-[var(--color-medical-border)] text-[var(--color-brand-primary)]">
                          {step.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[var(--color-brand-dark)]">
                            {step.step}. {step.title}
                          </h3>
                          <p className="mt-2 text-[var(--color-text-muted)] text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section py-20 bg-[var(--color-medical-bg)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-4">
                {t('EthicsPrivacy.faq.title')}
              </h2>
              <p className="text-[var(--color-text-muted)]">
                {t('EthicsPrivacy.faq.description')}
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item bg-white rounded-lg border transition-all ${
                    openFaq === index
                      ? 'border-[var(--color-brand-primary)]/30 ring-2 ring-[var(--color-brand-primary)]/10'
                      : 'border-[var(--color-medical-border)]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-bold text-lg text-[var(--color-brand-dark)]">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 pb-6 text-[var(--color-text-muted)] leading-relaxed border-t border-[var(--color-medical-border)] pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white border-t border-[var(--color-medical-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[var(--color-brand-dark)] rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
              {/* Subtle dot pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(var(--color-brand-primary) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {t('EthicsPrivacy.cta.title')}
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    {t('EthicsPrivacy.cta.description')}
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <Link
                      to={`${resolvePathWithLocale('/contact')}#contact-form`}
                      className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)] text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      {t('EthicsPrivacy.cta.primary')}
                    </Link>
                  </div>
                </div>

                {/* Icon decoration */}
                <div className="hidden md:block">
                  <div className="w-32 h-32 rounded-full border-4 border-[var(--color-brand-primary)]/30 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-white"
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
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EthicsPrivacyPage;
