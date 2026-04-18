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
import { SeoMeta } from '@/hooks/useSeoMeta';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        '.about-hero-title',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.about-hero-desc',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' }
      );

      // Values cards
      gsap.fromTo(
        '.value-card',
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.values-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const values = [
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      title: t('About.values.cards.healthEquity.title'),
      description: t('About.values.cards.healthEquity.description'),
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: t('About.values.cards.privacyFirst.title'),
      description: t('About.values.cards.privacyFirst.description'),
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
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
      title: t('About.values.cards.openSource.title'),
      description: t('About.values.cards.openSource.description'),
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
      title: t('About.values.cards.collaboration.title'),
      description: t('About.values.cards.collaboration.description'),
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--color-medical-bg)]"
    >
      <SeoMeta
        title="About AURA — Our Mission in Retinal Health"
        description="AURA is an AI-powered medical platform dedicated to democratising eye health. We connect patients with verified ophthalmologists for early retinal disease detection."
        canonical="https://web.auraeyes.site/en/about"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About AURA',
          url: 'https://web.auraeyes.site/en/about',
          description:
            'AURA is an AI-powered platform dedicated to democratising access to retinal health screening.',
          publisher: {
            '@type': 'MedicalOrganization',
            name: 'AURA',
            url: 'https://web.auraeyes.site',
          },
        }}
      />
      <Header />
      <GuestPageContextBar
        currentLabel={t('Navigation.about')}
        readingTimeMinutes={3}
        complexity="basic"
        sourceLabel={t('GuestEnhancements.source.auraGovernance')}
      />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 bg-gradient-to-br from-[var(--color-brand-dark)] to-[#0F172A] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
                <span className="h-2 w-2 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
                {t('MedicalTerms.ophthalmology')}
              </div>
              <h1 className="about-hero-title text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
                {t('About.heroTitle')}
              </h1>
              <p className="about-hero-desc text-lg lg:text-xl text-gray-300 leading-relaxed">
                {t('About.heroDescription')}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-gray-200">
                <MedicalTermTooltip
                  term={t('GuestEnhancements.terms.macular')}
                  description={t('GuestEnhancements.tooltips.macular')}
                />
                <MedicalTermTooltip
                  term={t('GuestEnhancements.terms.intravitreal')}
                  description={t('GuestEnhancements.tooltips.intravitreal')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="values-section py-20 bg-[var(--color-medical-bg)]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                {t('About.values.badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)] mb-4">
                {t('About.values.title')}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)]">
                {t('About.values.description')}
              </p>
              <div className="mt-5 flex justify-center">
                <SourceVerificationTag
                  label={t('GuestEnhancements.source.auraGovernance')}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="value-card bg-white rounded-xl p-6 border border-[var(--color-medical-border)] hover:shadow-lg hover:border-[var(--color-brand-primary)]/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[var(--color-brand-dark)] to-[#0F172A] text-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('About.cta.title')}
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              {t('About.cta.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={resolvePathWithLocale('/contact')}
                className="inline-flex min-h-12 flex-col items-start rounded-lg bg-[var(--color-brand-primary)] px-8 py-2 text-left text-base font-bold text-white hover:bg-[var(--color-brand-primary)] transition-all hover:shadow-lg"
              >
                <span>{t('About.cta.primary')}</span>
                <span className="guest-cta-subtext">
                  {t('GuestEnhancements.ctaSubtext.fastContact')}
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
