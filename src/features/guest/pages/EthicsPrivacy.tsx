import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const EthicsPrivacyPage = () => {
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

      // Hero image
      gsap.fromTo(
        '.hero-image',
        { opacity: 0, scale: 0.95, x: 30 },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.8,
          delay: 0.3,
          ease: 'power2.out',
        }
      );

      // Compliance badges
      gsap.fromTo(
        '.compliance-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.compliance-section',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
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
      title: 'Data Privacy First',
      description:
        'Your retinal data is end-to-end encrypted and anonymized. You retain full ownership and control at every step of the diagnostic process.',
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
      title: 'Ethical AI Design',
      description:
        'Our models are trained on diverse global datasets to mitigate bias and ensure equitable healthcare outcomes for all populations.',
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
      title: 'Total Transparency',
      description:
        "We open the 'black box'. AURA provides explainable results, highlighting exactly what the AI sees, keeping humans in the loop.",
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
      title: 'Upload & Encryption',
      description:
        'Retinal images are uploaded via a secure TLS 1.3 connection. Before leaving your device, data is encrypted using AES-256 standards.',
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
      title: 'Anonymization',
      description:
        'All Personal Health Information (PHI) is stripped from the metadata. The system assigns a unique, randomized token to the image data.',
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
      title: 'AI Analysis',
      description:
        'The anonymized image is processed by our Neural Network in a secure enclave. No data is stored permanently on the inference servers.',
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
      title: 'Result Delivery & Deletion',
      description:
        "Results are sent back to the clinician's dashboard. The temporary image data on our servers is immediately wiped.",
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
      question: 'What datasets is AURA trained on?',
      answer:
        'Our model is trained on a proprietary dataset of over 2.5 million retinal scans sourced from 14 distinct geographical regions, ensuring representation across diverse ethnicities, ages, and genders. This diversity is critical to preventing algorithmic bias common in models trained on homogenous populations.',
    },
    {
      question: 'Is there a "Human in the Loop"?',
      answer:
        'Absolutely. AURA is designed as a Decision Support System (DSS), not a replacement for clinicians. The AI provides a probability score and heatmaps indicating areas of concern, but the final diagnosis and treatment plan are always determined by a qualified ophthalmologist.',
    },
    {
      question: 'How do you handle edge cases?',
      answer:
        'We employ uncertainty quantification. If the AI encounters a scan with low confidence (due to poor image quality or rare pathology), it flags the case for "Manual Review" rather than forcing a potentially incorrect prediction. This safety mechanism reduces false positives/negatives significantly.',
    },
  ];

  const complianceItems = [
    { name: 'HIPAA', icon: 'verified_user' },
    { name: 'GDPR', icon: 'security' },
    { name: 'SOC2', icon: 'policy' },
    { name: 'ISO 27001', icon: 'health_and_safety' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F7FAFC]">
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
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              {/* Left Content */}
              <div className="hero-content lg:col-span-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#319795]/10 px-3 py-1 text-sm font-medium text-[#2C7A7B] mb-6 ring-1 ring-inset ring-[#319795]/20">
                  <span className="h-2 w-2 rounded-full bg-[#319795]"></span>
                  Trust & Transparency
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A202C] leading-tight mb-6">
                  Your Health Data,
                  <br />
                  <span className="text-[#319795]">Secure & Ethical.</span>
                </h1>

                <p className="text-lg text-[#718096] leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                  AURA is built on a foundation of rigorous ethics. We protect
                  your retinal data while advancing global health equity through
                  transparent, bias-aware technology.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-lg text-white bg-[#319795] hover:bg-[#2C7A7B] transition-colors">
                    Read Our Principles
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg text-[#1A202C] border border-[#E2E8F0] hover:border-[#319795] hover:bg-[#F7FAFC] transition-colors">
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Privacy Policy
                  </button>
                </div>
              </div>

              {/* Right Image */}
              <div className="hero-image mt-12 lg:mt-0 lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden ring-1 ring-[#E2E8F0]">
                  <div className="aspect-[4/3] bg-[#F7FAFC]">
                    <img
                      src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=450&fit=crop"
                      alt="Secure digital data network"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A202C]/70 to-transparent flex items-end p-6">
                      <div className="text-white">
                        <div className="flex items-center gap-2 mb-1">
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
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          <span className="text-sm font-bold uppercase tracking-wider text-[#319795]">
                            Secure Enclave
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">
                          Processing Node: US-East-1 (HIPAA Compliant)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Banner */}
        <section className="compliance-section bg-white border-y border-[#E2E8F0] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-semibold text-[#718096] uppercase tracking-widest mb-6">
              Trusted by & Compliant With
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {complianceItems.map((item, index) => (
                <div
                  key={index}
                  className="compliance-item flex justify-center items-center gap-2 text-[#718096] hover:text-[#319795] transition-colors"
                >
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="font-bold text-xl text-[#1A202C]">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three Pillars Section */}
        <section className="pillars-section py-20 bg-[#F7FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4">
                Building Trust Through Transparency
              </h2>
              <p className="text-lg text-[#718096]">
                We believe that medical AI must be built on a foundation of
                rigorous ethics and absolute data privacy. Here is how we ensure
                it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="pillar-card group bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 bg-[#319795]/10 rounded-xl flex items-center justify-center mb-6 text-[#319795] group-hover:bg-[#319795]/20 transition-colors">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#1A202C] mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-[#718096] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Journey Section */}
        <section className="journey-section py-20 bg-white border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Sticky Left Side */}
              <div className="md:w-1/3 md:sticky md:top-24">
                <h2 className="text-3xl font-bold text-[#1A202C] mb-4">
                  The Data Journey
                </h2>
                <p className="text-[#718096] mb-8 leading-relaxed">
                  We've simplified the complex process of data handling into
                  four clear, secure steps. Transparency is key to your peace of
                  mind.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-[#319795] font-bold hover:text-[#2C7A7B] transition-colors"
                >
                  View Security Architecture
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
                </a>
              </div>

              {/* Timeline Right Side */}
              <div className="md:w-2/3 w-full">
                <div className="relative pl-8 border-l-2 border-[#E2E8F0] space-y-10">
                  {/* Animated line fill */}
                  <div className="timeline-line-fill absolute left-0 top-0 bottom-0 w-0.5 bg-[#319795] -ml-[1px]" />

                  {dataJourney.map((step, index) => (
                    <div key={index} className="journey-step relative">
                      {/* Dot */}
                      <span className="absolute -left-[41px] top-0 h-5 w-5 rounded-full border-4 border-white bg-[#319795]" />

                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-[#F7FAFC] p-6 rounded-xl">
                        <div className="bg-white p-3 rounded-lg h-fit shadow-sm border border-[#E2E8F0] text-[#319795]">
                          {step.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#1A202C]">
                            {step.step}. {step.title}
                          </h3>
                          <p className="mt-2 text-[#718096] text-sm leading-relaxed">
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
        <section className="faq-section py-20 bg-[#F7FAFC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1A202C] mb-4">
                Deep Dive: How We Mitigate Bias
              </h2>
              <p className="text-[#718096]">
                Answers to common questions about fairness in our AI models.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item bg-white rounded-lg border transition-all ${
                    openFaq === index
                      ? 'border-[#319795]/30 ring-2 ring-[#319795]/10'
                      : 'border-[#E2E8F0]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-bold text-lg text-[#1A202C]">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-[#718096] transition-transform duration-200 ${
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
                    <div className="px-6 pb-6 text-[#718096] leading-relaxed border-t border-[#E2E8F0] pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1A202C] rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
              {/* Subtle dot pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(#319795 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Partner with AURA
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Join our network of ethical AI practitioners. We provide
                    full documentation and API access for researchers committed
                    to responsible healthcare innovation.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <button className="bg-[#319795] hover:bg-[#2C7A7B] text-white font-bold py-3 px-6 rounded-lg transition-colors">
                      Request Developer Access
                    </button>
                    <button className="bg-transparent border border-gray-600 text-white hover:bg-white/10 font-medium py-3 px-6 rounded-lg transition-colors">
                      Contact Ethics Board
                    </button>
                  </div>
                </div>

                {/* Icon decoration */}
                <div className="hidden md:block">
                  <div className="w-32 h-32 rounded-full border-4 border-[#319795]/30 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#319795] flex items-center justify-center">
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
