import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import GuestPageContextBar from '../components/GuestPageContextBar';
import MedicalTermTooltip from '../components/MedicalTermTooltip';
import SourceVerificationTag from '../components/SourceVerificationTag';
import { prefersReducedMotion } from '../utils/motion';

gsap.registerPlugin(ScrollTrigger);

const HowItWorksPage = () => {
  const { t } = useSafeTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        '.hero-content > *',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );

      // Process steps timeline
      gsap.fromTo(
        '.process-step',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.process-section',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Timeline line animation
      gsap.fromTo(
        '.timeline-progress',
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          duration: 1.5,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: '.process-section',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Feature cards
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 60, rotateX: 10 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.features-section',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Trust badges
      gsap.fromTo(
        '.trust-badge',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: '.trust-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      number: '01',
      title: t('HowItWorks.steps.capture.title'),
      description: t('HowItWorks.steps.capture.description'),
      icon: (
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
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      number: '02',
      title: t('HowItWorks.steps.upload.title'),
      description: t('HowItWorks.steps.upload.description'),
      icon: (
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      number: '03',
      title: t('HowItWorks.steps.analysis.title'),
      description: t('HowItWorks.steps.analysis.description'),
      icon: (
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
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      number: '04',
      title: t('HowItWorks.steps.assessment.title'),
      description: t('HowItWorks.steps.assessment.description'),
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  const features = [
    {
      title: t('HowItWorks.features.tortuosity.title'),
      description: t('HowItWorks.features.tortuosity.description'),
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: t('HowItWorks.features.avr.title'),
      description: t('HowItWorks.features.avr.description'),
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: t('HowItWorks.features.microaneurysm.title'),
      description: t('HowItWorks.features.microaneurysm.description'),
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

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--color-medical-bg)]"
    >
      <Header />
      <GuestPageContextBar
        currentLabel={t('Navigation.howItWorks')}
        readingTimeMinutes={6}
        complexity="moderate"
        sourceLabel={t('GuestEnhancements.source.auraGovernance')}
      />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 bg-white overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, var(--color-brand-primary) 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="hero-content flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)]/10 px-4 py-1.5 text-sm font-semibold text-[var(--color-brand-primary)] w-fit">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  {t('HowItWorks.hero.badge')}
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[var(--color-brand-dark)]">
                  {t('HowItWorks.hero.titlePrefix')}{' '}
                  <span className="text-[var(--color-brand-primary)]">
                    AURA
                  </span>{' '}
                  {t('HowItWorks.hero.titleSuffix')}
                </h1>

                <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                  {t('HowItWorks.hero.description')}
                </p>
              </div>

              {/* Hero Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-medical-border)]">
                <div className="absolute left-4 top-4 z-20 flex flex-col gap-1">
                  <span className="guest-image-metadata">
                    {t('GuestEnhancements.imageMeta.highResFundus')}
                  </span>
                  <span className="guest-image-metadata">
                    {t('GuestEnhancements.imageMeta.processedLayer')}
                  </span>
                </div>

                <div className="aspect-video bg-gradient-to-br from-[var(--color-brand-dark)] via-[var(--color-brand-primary)] to-[#0F172A] relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Animated Eye Scanner */}
                    <div className="relative w-48 h-48">
                      <div
                        className="absolute inset-0 rounded-full border-4 border-[var(--color-brand-primary)]/30 animate-ping"
                        style={{ animationDuration: '2s' }}
                      />
                      <div
                        className="absolute inset-4 rounded-full border-2 border-dashed border-white/30 animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#0a1628] to-[#0F172A] flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Overlay Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                        {t('HowItWorks.hero.processingStatus')}
                      </span>
                      <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        {t('HowItWorks.hero.analyzing')}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-brand-primary)] rounded-full animate-pulse"
                        style={{ width: '75%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="process-section py-20 bg-[var(--color-medical-bg)]">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <div className="text-center mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                {t('HowItWorks.process.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)] mb-4">
                {t('HowItWorks.process.title')}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                {t('HowItWorks.process.description')}
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-[var(--color-medical-border)]">
                <div className="timeline-progress absolute inset-0 bg-gradient-to-b from-[var(--color-brand-primary)] to-[var(--color-brand-dark)]" />
              </div>

              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div key={index} className="process-step relative flex gap-8">
                    {/* Step Number */}
                    <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-white border-4 border-[var(--color-brand-primary)] flex items-center justify-center shadow-lg">
                      <span className="text-lg font-black text-[var(--color-brand-primary)]">
                        {step.number}
                      </span>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white rounded-xl border border-[var(--color-medical-border)] overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0">
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[var(--color-brand-dark)] mb-2">
                              {step.title}
                            </h3>
                            <p className="text-[var(--color-text-muted)] leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What AI Sees Section */}
        <section className="features-section py-20 bg-white border-y border-[var(--color-medical-border)]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="sticky top-24">
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                  {t('HowItWorks.ai.badge')}
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)] mb-4">
                  {t('HowItWorks.ai.titleLine1')}
                  <br />
                  {t('HowItWorks.ai.titleLine2')}
                </h2>
                <p className="text-lg text-[var(--color-text-muted)] mb-6 leading-relaxed">
                  {t('HowItWorks.ai.description')}
                </p>

                <div className="mb-4 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                  <MedicalTermTooltip
                    term={t('GuestEnhancements.terms.avr')}
                    description={t('GuestEnhancements.tooltips.avr')}
                  />
                  <MedicalTermTooltip
                    term={t('GuestEnhancements.terms.microaneurysm')}
                    description={t('GuestEnhancements.tooltips.microaneurysm')}
                  />
                  <MedicalTermTooltip
                    term={t('GuestEnhancements.terms.tortuosity')}
                    description={t('GuestEnhancements.tooltips.tortuosity')}
                  />
                </div>

                <SourceVerificationTag
                  label={t('GuestEnhancements.source.auraGovernance')}
                />

                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 rounded-full bg-[var(--color-brand-primary)]/10 text-sm font-medium text-[var(--color-brand-primary)]">
                    {t('HowItWorks.ai.tags.deepLearning')}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-[var(--color-brand-dark)]/10 text-sm font-medium text-[var(--color-brand-dark)]">
                    {t('HowItWorks.ai.tags.computerVision')}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-green-100 text-sm font-medium text-green-700">
                    {t('HowItWorks.ai.tags.accuracy')}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="feature-card bg-[var(--color-medical-bg)] rounded-xl p-6 border border-[var(--color-medical-border)] hover:border-[var(--color-brand-primary)]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="trust-section py-16 bg-[var(--color-medical-bg)]">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <div className="bg-gradient-to-br from-[var(--color-brand-primary)]/5 to-[var(--color-brand-dark)]/5 rounded-2xl p-8 md:p-12 border border-[var(--color-brand-primary)]/20 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center mx-auto mb-6">
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
              <h2 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-4">
                {t('HowItWorks.trust.title')}
              </h2>
              <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8">
                {t('HowItWorks.trust.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="trust-badge flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[var(--color-medical-border)]">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                  <span className="text-sm font-medium text-[var(--color-brand-dark)]">
                    {t('HowItWorks.trust.badges.hipaa')}
                  </span>
                </div>
                <div className="trust-badge flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[var(--color-medical-border)]">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[var(--color-brand-dark)]">
                    {t('HowItWorks.trust.badges.gdpr')}
                  </span>
                </div>
                <div className="trust-badge flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[var(--color-medical-border)]">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[var(--color-brand-dark)]">
                    {t('HowItWorks.trust.badges.bias')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white border-t border-[var(--color-medical-border)]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)] mb-4">
              {t('HowItWorks.cta.title')}
            </h2>
            <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10">
              {t('HowItWorks.cta.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={resolvePathWithLocale('/login')}
                className="inline-flex min-h-14 flex-col items-start rounded-lg bg-[var(--color-brand-primary)] px-8 py-3 text-left text-lg font-bold text-white hover:bg-[var(--color-brand-primary)] transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <span>{t('HowItWorks.cta.primary')}</span>
                <span className="guest-cta-subtext">
                  {t('GuestEnhancements.ctaSubtext.quickAction')}
                </span>
              </Link>
              <Link
                to={resolvePathWithLocale('/contact')}
                className="rounded-lg border-2 border-[var(--color-medical-border)] px-8 py-4 text-lg font-bold text-[var(--color-brand-dark)] hover:border-[var(--color-brand-primary)] transition-colors"
              >
                {t('HowItWorks.cta.secondary')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
