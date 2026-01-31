import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const ContactPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userType, setUserType] = useState<'specialist' | 'organisation'>(
    'specialist'
  );
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    role: '',
    estimatedVolume: '',
    message: '',
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
            trigger: '.partners-section',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { userType, ...formData });
    // Add form submission logic here
  };

  const partnerTypes = [
    {
      type: 'specialist' as const,
      title: 'Ophthalmologists & Clinicians',
      description:
        'Integrate AURA into your practice. Get fast, reliable AI-assisted reports to enhance your diagnostic workflow.',
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      benefits: [
        'Priority API access',
        'Dedicated support',
        'Training materials',
      ],
    },
    {
      type: 'organisation' as const,
      title: 'Hospitals & Health Organizations',
      description:
        'Deploy AURA at scale. We offer custom solutions for large-volume screening programs and EMR integration.',
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
        'Volume licensing',
        'White-label options',
        'Custom integrations',
      ],
    },
  ];

  const impactStats = [
    { value: '120+', label: 'Partner Clinics' },
    { value: '50K+', label: 'Screenings Performed' },
    { value: '15+', label: 'Countries Reached' },
    { value: '100%', label: 'Free for Non-Profits' },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--color-bg-medical)]"
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
                Join Our Network
              </div>

              <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white mb-6">
                Partner with{' '}
                <span className="text-[var(--color-brand-primary)]">AURA</span>{' '}
                to Improve Vision Health Worldwide
              </h1>

              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Whether you're an individual specialist or a large health
                organization, AURA provides the tools and support to bring
                advanced retinal screening to your patients.
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
                  Apply for Partnership
                </button>
                <button className="rounded-lg border-2 border-white/30 px-6 py-3 text-base font-bold text-white hover:bg-white/10 transition-colors">
                  Schedule a Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Types Section */}
        <section className="partners-section py-20 bg-white border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center mb-12">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                Partnership Options
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)]">
                Choose Your Path to Partnership
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {partnerTypes.map((partner, index) => (
                <button
                  key={index}
                  onClick={() => setUserType(partner.type)}
                  className={`partner-card text-left p-8 rounded-2xl border-2 transition-all duration-300 ${
                    userType === partner.type
                      ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 shadow-lg'
                      : 'border-[var(--color-border)] bg-white hover:border-[var(--color-brand-primary)]/50 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                      userType === partner.type
                        ? 'bg-[var(--color-brand-primary)] text-white'
                        : 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
                    }`}
                  >
                    {partner.icon}
                  </div>

                  <h3 className="text-xl font-bold text-[var(--color-brand-dark)] mb-2">
                    {partner.title}
                  </h3>
                  <p className="text-[var(--color-text-muted)] mb-4">
                    {partner.description}
                  </p>

                  <ul className="space-y-2">
                    {partner.benefits.map((benefit, i) => (
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

                  <div
                    className={`mt-4 flex items-center gap-2 text-sm font-semibold ${
                      userType === partner.type
                        ? 'text-[var(--color-brand-primary)]'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {userType === partner.type ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Selected
                      </>
                    ) : (
                      'Select this option'
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section
          id="contact-form"
          className="form-section py-20 bg-[var(--color-bg-medical)]"
        >
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Info Side */}
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                  Get Started
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)] mb-6">
                  {userType === 'specialist'
                    ? 'Register as a Specialist'
                    : 'Request Enterprise Demo'}
                </h2>
                <p className="text-lg text-[var(--color-text-muted)] mb-8 leading-relaxed">
                  {userType === 'specialist'
                    ? 'Fill out the form to get API access, training resources, and connect with our clinical support team.'
                    : 'Tell us about your organization and screening needs. Our partnership team will reach out within 24 hours.'}
                </p>

                {/* Contact Info */}
                <div className="space-y-6 p-6 bg-white rounded-xl border border-[var(--color-border)]">
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
                        Email Support
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
                        Response Time
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        Within 24-48 business hours
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
                        Headquarters
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        FPT University, HCM, VN
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Side */}
              <form
                onSubmit={handleSubmit}
                className="contact-form bg-white p-8 rounded-2xl border border-[var(--color-border)] shadow-sm"
              >
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Name Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                      />
                    </div>
                  </div>

                  {/* Organization Name (only for organisation type) */}
                  {userType === 'organisation' && (
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                        Organization Name{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        required
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)]"
                      />
                    </div>
                  )}

                  {/* Role/Specialty */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                      {userType === 'specialist' ? 'Specialty' : 'Your Role'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)] bg-white"
                    >
                      <option value="">Select an option</option>
                      {userType === 'specialist' ? (
                        <>
                          <option value="ophthalmologist">
                            Ophthalmologist
                          </option>
                          <option value="optometrist">Optometrist</option>
                          <option value="retina_specialist">
                            Retina Specialist
                          </option>
                          <option value="general_practitioner">
                            General Practitioner
                          </option>
                          <option value="other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="cto">CTO / IT Director</option>
                          <option value="cmo">CMO / Medical Director</option>
                          <option value="operations">Operations Manager</option>
                          <option value="procurement">Procurement</option>
                          <option value="other">Other</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Estimated Volume (only for organisation) */}
                  {userType === 'organisation' && (
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                        Estimated Monthly Screenings
                      </label>
                      <select
                        name="estimatedVolume"
                        value={formData.estimatedVolume}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)] bg-white"
                      >
                        <option value="">Select range</option>
                        <option value="100-500">100 - 500</option>
                        <option value="500-1000">500 - 1,000</option>
                        <option value="1000-5000">1,000 - 5,000</option>
                        <option value="5000+">5,000+</option>
                      </select>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-brand-dark)] mb-2">
                      Additional Information
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all text-[var(--color-brand-dark)] resize-none"
                      placeholder="Tell us about your needs or questions..."
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="termsAgreed"
                      id="terms"
                      checked={formData.termsAgreed}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20"
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-[var(--color-text-muted)]"
                    >
                      I agree to AURA's{' '}
                      <a
                        href="#"
                        className="text-[var(--color-brand-primary)] hover:underline"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a
                        href="#"
                        className="text-[var(--color-brand-primary)] hover:underline"
                      >
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-lg bg-[var(--color-brand-primary)] text-white font-bold text-base hover:bg-[var(--color-brand-primary)] transition-all hover:shadow-lg"
                  >
                    {userType === 'specialist'
                      ? 'Request Access'
                      : 'Request Enterprise Demo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="impact-section py-16 bg-white border-t border-[var(--color-border)]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-2">
                Our Growing Impact
              </h2>
              <p className="text-[var(--color-text-muted)]">
                Join a network that's making a difference worldwide
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
        <section className="py-20 bg-[var(--color-bg-medical)]">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Is there a cost to partner with AURA?',
                  a: 'For individual clinicians and non-profit organizations, AURA is completely free. For large commercial enterprises, we offer tiered pricing based on volume.',
                },
                {
                  q: 'How long does the onboarding process take?',
                  a: 'Most specialists can be set up and running within 48 hours. Enterprise integrations typically take 2-4 weeks depending on complexity.',
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white rounded-xl border border-[var(--color-border)] overflow-hidden"
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
