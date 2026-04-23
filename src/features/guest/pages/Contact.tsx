import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { toast } from 'react-toastify';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { registerOrganisation } from '@/features/auth/api/auth.api';
import { extractApiErrorMessage } from '@/lib/api-error';
import { resolvePathWithLocale } from '@/i18n/middleware';
import GuestPageContextBar from '../components/GuestPageContextBar';
import {
  getAdaptiveScrollBehavior,
  prefersReducedMotion,
} from '../utils/motion';
import { SeoMeta } from '@/hooks/useSeoMeta';

gsap.registerPlugin(ScrollTrigger);

const ContactPage = () => {
  const { t } = useSafeTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    termsAgreed: false,
  });

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

      gsap.fromTo(
        '.contact-panel',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-layout-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Form animation
      gsap.fromTo(
        '.contact-form',
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.form-section',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      await registerOrganisation({
        organisationName: `Contact lead - ${formData.fullName.trim()}`,
        orgType: 2,
        contactFullName: formData.fullName.trim(),
        contactEmail: formData.email.trim(),
        contactPhone: formData.phone.trim() || undefined,
        notes:
          [
            `Contact page inquiry`,
            formData.subject.trim()
              ? `Subject: ${formData.subject.trim()}`
              : null,
            formData.message.trim()
              ? `Message: ${formData.message.trim()}`
              : null,
          ]
            .filter(Boolean)
            .join('\n') || undefined,
      });

      toast.success(t('Contact.toast.success'));

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        termsAgreed: false,
      });
    } catch (error) {
      toast.error(extractApiErrorMessage(error, t('Contact.toast.error')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] bg-[var(--color-medical-bg)]"
    >
      <SeoMeta
        title="Contact AURA — Contact Us"
        description="Reach out to AURA for support, product questions, and collaboration inquiries."
        canonical="https://web.auraeyes.site/en/contact"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact AURA',
          url: 'https://web.auraeyes.site/en/contact',
          description: 'Reach out to AURA for support and general inquiries.',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'auraeyes4se@gmail.com',
            contactType: 'customer support',
            availableLanguage: ['English', 'Vietnamese'],
          },
        }}
      />
      <Header />
      <GuestPageContextBar
        currentLabel={t('Navigation.contact')}
        readingTimeMinutes={5}
        complexity="moderate"
        sourceLabel={t('GuestEnhancements.source.auraGovernance')}
      />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-[var(--color-brand-dark)] via-[#2D3748] to-[#0F172A] overflow-hidden">
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
            <div className="hero-content text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white mb-6">
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
                {t('Contact.hero.badge')}
              </div>

              <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white mb-6">
                {t('Contact.hero.titlePrefix')}{' '}
                <span className="text-[var(--color-brand-primary)]">AURA</span>{' '}
                {t('Contact.hero.titleSuffix')}
              </h1>

              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                {t('Contact.hero.description')}
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('contact-form')?.scrollIntoView({
                      behavior: getAdaptiveScrollBehavior(),
                    })
                  }
                  className="inline-flex min-h-12 flex-col items-start rounded-lg bg-[var(--color-brand-primary)] px-6 py-2 text-left text-base font-bold text-white hover:bg-[var(--color-brand-primary)] transition-all hover:shadow-lg"
                >
                  <span>{t('Contact.hero.primaryCta')}</span>
                  <span className="guest-cta-subtext">
                    {t('GuestEnhancements.ctaSubtext.fastContact')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Layout Section */}
        <section
          id="contact-form"
          className="contact-layout-section form-section bg-[var(--color-medical-bg)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4 py-12">
            {/* Left Column */}
            <div className="contact-panel">
              <div className="rounded-2xl border border-[var(--color-medical-border)] bg-white p-8 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.28)]">
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                  {t('Contact.info.badge')}
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-6">
                  {t('Contact.info.title')}
                </h2>
                <p className="text-lg text-body mb-8 leading-relaxed">
                  {t('Contact.info.description')}
                </p>

                <div className="space-y-6 rounded-xl border border-[var(--color-medical-border)] bg-[var(--color-medical-bg)] p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0">
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-brand-dark)]">
                        {t('Contact.info.emailSupport')}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        auraeyes4se@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-brand-dark)]">
                        {t('Contact.info.responseTime')}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {t('Contact.info.responseTimeValue')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-brand-dark)]">
                        {t('Contact.info.headquarters')}
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {t('Contact.info.headquartersValue')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="contact-panel">
              <form
                onSubmit={handleSubmit}
                className="contact-form bg-white p-8 lg:p-10 rounded-2xl border border-[var(--color-medical-border)] shadow-lg"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-2">
                      {t('Contact.form.title')}
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                      {t('Contact.form.description')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-brand-primary)] mb-4">
                      {t('Contact.form.contactPerson')}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.fullName')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.workEmail')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                          placeholder={t('Contact.form.workEmailPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.phone')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                          placeholder={t('Contact.form.phonePlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.role')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                          placeholder={t('Contact.form.role')}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-brand-primary)] mb-4">
                      {t('Contact.form.additionalInformation')}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.additionalInformation')}
                          <span className="text-red-500"> *</span>
                        </label>
                        <textarea
                          name="message"
                          rows={4}
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)] resize-none"
                          placeholder={t(
                            'Contact.form.additionalInfoPlaceholder'
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="termsAgreed"
                      id="terms"
                      checked={formData.termsAgreed}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 rounded border-[var(--color-medical-border)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20"
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-[var(--color-text-muted)]"
                    >
                      {t('Contact.form.termsPrefix')}{' '}
                      <Link
                        to={resolvePathWithLocale('/terms')}
                        className="text-[var(--color-brand-primary)] hover:underline"
                      >
                        {t('Contact.form.termsOfService')}
                      </Link>{' '}
                      {t('Contact.form.and')}{' '}
                      <Link
                        to={resolvePathWithLocale('/privacy')}
                        className="text-[var(--color-brand-primary)] hover:underline"
                      >
                        {t('Contact.form.privacyPolicy')}
                      </Link>
                      .
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full min-h-14 flex-col items-center justify-center rounded-lg bg-[var(--color-brand-primary)] py-2 text-white font-bold text-base hover:bg-[var(--color-brand-primary)] transition-all hover:shadow-lg"
                  >
                    <span>
                      {isSubmitting
                        ? t('Contact.form.sending')
                        : t('Contact.form.send')}
                    </span>
                    {isSubmitting ? null : (
                      <span className="guest-cta-subtext">
                        {t('GuestEnhancements.ctaSubtext.fastContact')}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-[var(--color-medical-bg)]">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-2">
                {t('Contact.faq.title')}
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: t('Contact.faq.items.cost.question'),
                  a: t('Contact.faq.items.cost.answer'),
                },
                {
                  q: t('Contact.faq.items.onboarding.question'),
                  a: t('Contact.faq.items.onboarding.answer'),
                },
              ].map((faq) => (
                <details
                  key={faq.q}
                  className="group bg-white rounded-xl border border-[var(--color-medical-border)] overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer text-[var(--color-brand-dark)] font-semibold hover:bg-gray-50 transition-colors">
                    {faq.q}
                    <svg
                      className="w-5 h-5 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform"
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
                  </summary>
                  <div className="px-6 pb-6 text-[var(--color-text-muted)]">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
