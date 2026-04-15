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

gsap.registerPlugin(ScrollTrigger);

const ContactPage = () => {
  const { t } = useSafeTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    organizationContactName: '',
    organizationContactRole: '',
    organizationContactEmail: '',
    organizationPhone: '',
    organizationName: '',
    organizationBusinessCode: '',
    organizationTaxCode: '',
    organizationType: 'clinic',
    organizationLocation: '',
    estimatedVolume: '',
    organizationMessage: '',
    termsAgreed: false,
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        '.hero-content > *',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );

      // Partner cards
      gsap.fromTo(
        '.partner-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.2,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: '.partnership-layout-section',
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

      // Impact stats
      gsap.fromTo(
        '.impact-stat',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.impact-section',
            start: 'top 80%',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      await registerOrganisation({
        organisationName: formData.organizationName.trim(),
        orgType: formData.organizationType === 'hospital' ? 1 : 2,
        contactFullName: formData.organizationContactName.trim(),
        contactEmail: formData.organizationContactEmail.trim(),
        contactPhone: formData.organizationPhone.trim() || undefined,
        address: formData.organizationLocation.trim() || undefined,
        licenseNumber: formData.organizationBusinessCode.trim() || undefined,
        taxCode: formData.organizationTaxCode.trim() || undefined,
        notes:
          [
            `Role: ${formData.organizationContactRole.trim()}`,
            formData.estimatedVolume
              ? `Estimated monthly screenings: ${formData.estimatedVolume}`
              : null,
            formData.organizationMessage.trim() || null,
          ]
            .filter(Boolean)
            .join('\n') || undefined,
      });

      toast.success(t('Contact.toast.success'));

      setFormData({
        organizationContactName: '',
        organizationContactRole: '',
        organizationContactEmail: '',
        organizationPhone: '',
        organizationName: '',
        organizationBusinessCode: '',
        organizationTaxCode: '',
        organizationType: 'clinic',
        organizationLocation: '',
        estimatedVolume: '',
        organizationMessage: '',
        termsAgreed: false,
      });
    } catch (error) {
      toast.error(extractApiErrorMessage(error, t('Contact.toast.error')));
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnerCard = {
    title: t('Contact.partnerCard.title'),
    description: t('Contact.partnerCard.description'),
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    benefits: [
      t('Contact.partnerCard.benefits.volumeLicensing'),
      t('Contact.partnerCard.benefits.whiteLabel'),
      t('Contact.partnerCard.benefits.customIntegrations'),
    ],
  };

  const impactStats = [
    { value: '120+', label: t('Contact.impact.partnerClinics') },
    { value: '50K+', label: t('Contact.impact.screeningsPerformed') },
    { value: '15+', label: t('Contact.impact.countriesReached') },
    { value: '100%', label: t('Contact.impact.freeForNonProfits') },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--color-medical-bg)]"
    >
      <Header />

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
                  onClick={() =>
                    document
                      .getElementById('contact-form')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="rounded-lg bg-[var(--color-brand-primary)] px-6 py-3 text-base font-bold text-white hover:bg-[var(--color-brand-primary)] transition-all hover:shadow-lg"
                >
                  {t('Contact.hero.primaryCta')}
                </button>
                <button className="rounded-lg border-2 border-white/30 px-6 py-3 text-base font-bold text-white hover:bg-white/10 transition-colors">
                  {t('Contact.hero.secondaryCta')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Layout Section */}
        <section
          id="contact-form"
          className="partnership-layout-section form-section bg-[var(--color-medical-bg)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4 py-12">
            {/* Left Column */}
            <div className="flex flex-col gap-8">
              <div className="partner-card text-left p-8 rounded-2xl border-2 border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 shadow-md">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-[var(--color-brand-primary)] text-white">
                  {partnerCard.icon}
                </div>

                <h3 className="text-xl font-bold text-[var(--color-brand-dark)] mb-2">
                  {partnerCard.title}
                </h3>
                <p className="text-[var(--color-text-muted)] mb-4">
                  {partnerCard.description}
                </p>

                <ul className="space-y-2">
                  {partnerCard.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-[var(--color-brand-dark)]"
                    >
                      <svg
                        className="w-4 h-4 text-[var(--color-brand-primary)]"
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
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                  {t('Contact.info.badge')}
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-6">
                  {t('Contact.info.title')}
                </h2>
                <p className="text-lg text-body mb-8 leading-relaxed">
                  {t('Contact.info.description')}
                </p>

                <div className="space-y-6 p-6 bg-white rounded-xl border border-[var(--color-medical-border)]">
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
                        FPT University, HCM, VN
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
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
                          name="organizationContactName"
                          required
                          value={formData.organizationContactName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.role')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="organizationContactRole"
                          required
                          value={formData.organizationContactRole}
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
                          name="organizationContactEmail"
                          required
                          value={formData.organizationContactEmail}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                          placeholder={t('Contact.form.workEmailPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.phone')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="organizationPhone"
                          required
                          value={formData.organizationPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                          placeholder="+84 ..."
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-brand-primary)] mb-4">
                      {t('Contact.form.organizationDetails')}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.organizationName')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="organizationName"
                          required
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.organizationType')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="organizationType"
                          required
                          value={formData.organizationType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)] bg-white"
                        >
                          <option value="clinic">
                            {t('Contact.form.organizationTypeClinic')}
                          </option>
                          <option value="hospital">
                            {t('Contact.form.organizationTypeHospital')}
                          </option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.cityLocation')}
                        </label>
                        <input
                          type="text"
                          name="organizationLocation"
                          value={formData.organizationLocation}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.businessCode')}
                        </label>
                        <input
                          type="text"
                          name="organizationBusinessCode"
                          value={formData.organizationBusinessCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                          placeholder={t(
                            'Contact.form.businessCodePlaceholder'
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.taxCode')}
                        </label>
                        <input
                          type="text"
                          name="organizationTaxCode"
                          value={formData.organizationTaxCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                          placeholder={t('Contact.form.taxCodePlaceholder')}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-brand-primary)] mb-4">
                      {t('Contact.form.partnershipNeeds')}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.estimatedMonthlyScreenings')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="estimatedVolume"
                          required
                          value={formData.estimatedVolume}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-medical-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)] bg-white"
                        >
                          <option value="">
                            {t('Contact.form.selectRange')}
                          </option>
                          <option value="lt_100">&lt;100</option>
                          <option value="100_500">100-500</option>
                          <option value="500_2000">500-2000</option>
                          <option value="gt_2000">&gt;2000</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                          {t('Contact.form.additionalInformation')}
                        </label>
                        <textarea
                          name="organizationMessage"
                          rows={4}
                          value={formData.organizationMessage}
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
                    className="w-full py-4 rounded-lg bg-[var(--color-brand-primary)] text-white font-bold text-base hover:bg-[var(--color-brand-primary)] transition-all hover:shadow-lg"
                  >
                    {isSubmitting
                      ? t('Contact.form.sending')
                      : t('Contact.form.send')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="impact-section py-16 bg-white border-t border-[var(--color-medical-border)]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-2">
                {t('Contact.impact.title')}
              </h2>
              <p className="text-[var(--color-text-muted)]">
                {t('Contact.impact.description')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <div key={index} className="impact-stat text-center">
                  <p className="text-4xl font-black text-[var(--color-brand-primary)] mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {stat.label}
                  </p>
                </div>
              ))}
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
              ].map((faq, index) => (
                <details
                  key={index}
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
