import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EthicsPrivacyPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        '.hero-content > *',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );

      // Compliance badges
      gsap.fromTo(
        '.compliance-badge',
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: '.compliance-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Pillar cards
      gsap.fromTo(
        '.pillar-card',
        { opacity: 0, y: 60, rotateX: 15 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power3.out',
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
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.journey-section',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Timeline connector
      gsap.fromTo(
        '.journey-line',
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          duration: 1.2,
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
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
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
      title: 'Privacy by Design',
      description:
        'Patient data is anonymized at the point of capture. We never store personally identifiable information alongside imaging data. All transmissions are encrypted end-to-end.',
      icon: (
        <svg
          className="w-10 h-10"
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
      color: 'from-[#319795] to-[#285E61]',
    },
    {
      title: 'Transparent AI',
      description:
        'Our diagnostic models are published with full documentation. We provide confidence scores and explanations with every result, so clinicians understand how conclusions are reached.',
      icon: (
        <svg
          className="w-10 h-10"
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
      color: 'from-[#2C5282] to-[#1A365D]',
    },
    {
      title: 'Equity in Healthcare',
      description:
        'We actively test for and mitigate demographic biases in our models. Our mission is to provide accurate screening for all patients, regardless of race, age, or socioeconomic status.',
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'from-purple-600 to-purple-800',
    },
  ];

  const dataJourney = [
    {
      step: 1,
      title: 'Image Capture',
      description:
        'Retinal image is captured by a standard fundus camera at the clinic. Patient ID is stripped before upload.',
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
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
        </svg>
      ),
    },
    {
      step: 2,
      title: 'Secure Transit',
      description:
        'Data is encrypted using AES-256 and transmitted over TLS 1.3 to our HIPAA-compliant cloud servers.',
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
            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      step: 3,
      title: 'AI Processing',
      description:
        'Our AI model analyzes the image. No human views the raw image during this automated process.',
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
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      step: 4,
      title: 'Report Delivery',
      description:
        'A structured, anonymized report is generated and sent securely to the requesting clinician.',
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      step: 5,
      title: 'Data Expiration',
      description:
        'Images are automatically purged from our servers within 72 hours unless opted-in for research.',
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

  const faqs = [
    {
      question: 'Is AURA HIPAA Compliant?',
      answer:
        'Yes. Our entire infrastructure is built on HIPAA-compliant cloud services with Business Associate Agreements (BAAs) in place. We undergo annual third-party security audits.',
    },
    {
      question: 'Does AURA sell or share patient data?',
      answer:
        'Absolutely not. We are a non-profit organization. Patient data is never sold or used for advertising. Anonymized data may only be used for research with explicit consent.',
    },
    {
      question: 'How is AI bias addressed?',
      answer:
        'Our models are trained on diverse, globally representative datasets. We publish detailed bias audits with each model release and actively work with underrepresented communities to improve accuracy.',
    },
    {
      question: 'Can patients request their data be deleted?',
      answer:
        'Yes. Patients can request immediate and complete deletion of their data through their healthcare provider. We provide a verifiable deletion certificate upon completion.',
    },
    {
      question: 'What happens if there is a data breach?',
      answer:
        'In the unlikely event of a breach, affected parties will be notified within 24 hours as per HIPAA requirements. Our anonymization practices mean that even in a worst-case scenario, images cannot be linked to individuals.',
    },
  ];

  const complianceBadges = [
    { name: 'HIPAA', desc: 'Health Insurance Portability' },
    { name: 'GDPR', desc: 'EU Data Protection' },
    { name: 'SOC 2', desc: 'Type II Certified' },
    { name: 'ISO 27001', desc: 'Information Security' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F7FAFC]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#319795]/20 text-[#319795]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#1A202C]">AURA</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              className="text-sm font-medium text-[#718096] hover:text-[#2C5282] transition-colors"
              href="/"
            >
              Home
            </a>
            <a
              className="text-sm font-medium text-[#718096] hover:text-[#2C5282] transition-colors"
              href="/about"
            >
              About Us
            </a>
            <a
              className="text-sm font-medium text-[#718096] hover:text-[#2C5282] transition-colors"
              href="/how-it-works"
            >
              How It Works
            </a>
            <a
              className="text-sm font-medium text-[#2C5282] font-semibold"
              href="/ethics"
            >
              Ethics & Privacy
            </a>
          </nav>
          <button className="rounded-lg bg-[#319795] px-5 py-2 text-sm font-bold text-white hover:bg-[#2C7A7B] transition-colors">
            Get Started
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 bg-gradient-to-br from-[#1A365D] via-[#2C5282] to-[#2D3748] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#319795]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 relative z-10">
            <div className="hero-content max-w-3xl mx-auto text-center">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Trust & Transparency
              </div>

              <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white mb-6">
                Ethics, Data Privacy &{' '}
                <span className="text-[#319795]">AI Transparency</span>
              </h1>

              <p className="text-lg text-gray-300 mb-10">
                At AURA, we believe that access to healthcare technology must be
                built on a foundation of trust. We are committed to the highest
                standards of data privacy, ethical AI development, and
                transparent practices.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#pillars"
                  className="rounded-lg bg-[#319795] px-6 py-3 text-base font-bold text-white hover:bg-[#2C7A7B] transition-all hover:shadow-lg"
                >
                  Our Principles
                </a>
                <a
                  href="#faq"
                  className="rounded-lg border-2 border-white/30 px-6 py-3 text-base font-bold text-white hover:bg-white/10 transition-colors"
                >
                  Privacy FAQ
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Banner */}
        <section className="compliance-section py-12 bg-white border-b border-[#E2E8F0]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <p className="text-center text-sm font-semibold text-[#718096] uppercase tracking-wider mb-6">
              Certified Compliant With
            </p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {complianceBadges.map((badge, index) => (
                <div
                  key={index}
                  className="compliance-badge flex items-center gap-3 px-6 py-3 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0]"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#319795]/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[#319795]"
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
                  <div>
                    <p className="font-bold text-[#1A202C]">{badge.name}</p>
                    <p className="text-xs text-[#718096]">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three Pillars Section */}
        <section id="pillars" className="pillars-section py-20 bg-[#F7FAFC]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[#319795] mb-2 block">
                Our Foundation
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4">
                The Three Pillars of AURA's Ethics
              </h2>
              <p className="text-lg text-[#718096] max-w-2xl mx-auto">
                Every decision we make is guided by these core principles.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="pillar-card group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-xl transition-all duration-300"
                  style={{ perspective: '1000px' }}
                >
                  <div className={`h-2 bg-gradient-to-r ${pillar.color}`} />
                  <div className="p-8">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${pillar.color} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      {pillar.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[#1A202C] mb-3">
                      {pillar.title}
                    </h3>
                    <p className="text-[#718096] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Journey Section */}
        <section className="journey-section py-20 bg-white border-y border-[#E2E8F0]">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <div className="text-center mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[#319795] mb-2 block">
                Data Lifecycle
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4">
                Your Data's Journey Through AURA
              </h2>
              <p className="text-lg text-[#718096] max-w-2xl mx-auto">
                Complete transparency on how your patient data is handled at
                every step.
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E2E8F0]">
                <div className="journey-line absolute inset-0 bg-gradient-to-b from-[#319795] to-[#2C5282]" />
              </div>

              <div className="space-y-8">
                {dataJourney.map((step, index) => (
                  <div
                    key={index}
                    className="journey-step relative flex gap-6 pl-2"
                  >
                    {/* Step Icon */}
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border-4 border-[#319795] flex items-center justify-center shadow-md">
                      <span className="text-sm font-black text-[#319795]">
                        {step.step}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-[#F7FAFC] rounded-xl p-6 border border-[#E2E8F0] hover:border-[#319795]/30 hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#319795]/10 text-[#319795] flex items-center justify-center flex-shrink-0">
                          {step.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#1A202C] mb-1">
                            {step.title}
                          </h3>
                          <p className="text-sm text-[#718096]">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="faq-section py-20 bg-[#F7FAFC]">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <div className="text-center mb-12">
              <span className="text-sm font-bold uppercase tracking-wider text-[#319795] mb-2 block">
                Common Questions
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4">
                Privacy & Security FAQ
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="faq-item bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-[#1A202C] pr-4">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-[#718096] flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
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
                    className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}
                  >
                    <div className="px-6 pb-6 text-[#718096] leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="py-20 bg-gradient-to-br from-[#319795]/5 to-[#2C5282]/5">
          <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#319795]/10 text-[#319795] flex items-center justify-center mx-auto mb-6">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4">
              Our Commitment to You
            </h2>
            <p className="text-lg text-[#718096] mb-8 max-w-2xl mx-auto">
              We are a non-profit initiative. We will never sell your data. We
              are accountable to the communities we serve. If you have any
              concerns, we want to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-lg bg-[#319795] px-6 py-3 text-base font-bold text-white hover:bg-[#2C7A7B] transition-all hover:shadow-lg">
                Contact Our Ethics Team
              </button>
              <button className="rounded-lg border-2 border-[#E2E8F0] px-6 py-3 text-base font-bold text-[#1A202C] hover:border-[#319795] transition-colors">
                View Full Privacy Policy
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white border-t border-[#E2E8F0]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="bg-gradient-to-br from-[#2C5282] to-[#1A365D] rounded-2xl p-10 md:p-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Have More Questions About Privacy?
              </h2>
              <p className="text-gray-300 max-w-xl mx-auto mb-8">
                Our team is ready to discuss your specific compliance needs and
                answer any questions about our data handling practices.
              </p>
              <button className="rounded-lg bg-white px-8 py-4 text-base font-bold text-[#2C5282] hover:bg-gray-100 transition-all hover:shadow-xl">
                Schedule a Privacy Consultation
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A202C] text-white py-12">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">AURA</span>
              <span className="text-sm text-gray-400">
                © 2026 AURA Non-Profit Initiative
              </span>
            </div>
            <div className="flex gap-6">
              <a
                className="text-sm text-gray-400 hover:text-[#319795] transition-colors"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-sm text-gray-400 hover:text-[#319795] transition-colors"
                href="#"
              >
                Terms of Use
              </a>
              <a
                className="text-sm text-gray-400 hover:text-[#319795] transition-colors"
                href="#"
              >
                Ethics Charter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EthicsPrivacyPage;
