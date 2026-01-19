import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const HowItWorksPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      title: 'Capture Retinal Image',
      description:
        "Use any standard fundus camera or smartphone-compatible adapter to capture a high-resolution image of the patient's retina.",
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
      image:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
    },
    {
      number: '02',
      title: 'Secure Upload & Encryption',
      description:
        'Your image is encrypted end-to-end and transmitted to our HIPAA-compliant servers. Patient data is anonymized immediately.',
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
      image:
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    },
    {
      number: '03',
      title: 'AI Analysis Processing',
      description:
        'Our deep learning models analyze vessel geometry, branching patterns, and microaneurysms to detect early signs of disease.',
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
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    },
    {
      number: '04',
      title: 'Receive Risk Assessment',
      description:
        'Get a comprehensive report with confidence scores, risk levels, and actionable recommendations within seconds.',
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
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    },
  ];

  const features = [
    {
      title: 'Vessel Tortuosity Analysis',
      description:
        'Measures the curvature and irregularity of blood vessels, which correlates with hypertension and cardiovascular risk.',
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
      title: 'Arteriovenous Ratio',
      description:
        'Compares the width of arteries to veins, a key indicator for detecting signs of systemic vascular disease.',
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
      title: 'Microaneurysm Detection',
      description:
        'Identifies tiny bulges in blood vessel walls that are early indicators of diabetic retinopathy.',
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
    <div ref={containerRef} className="min-h-screen bg-[#F7FAFC]">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 bg-white overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #319795 1px, transparent 0)',
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
                  AI-Driven Diagnostics
                </div>

                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-[#1A202C]">
                  Demystifying the <span className="text-[#319795]">AURA</span>{' '}
                  Screening Process
                </h1>

                <p className="text-lg text-[#718096] leading-relaxed">
                  Our platform leverages advanced computer vision to analyze
                  retinal images for early signs of vascular abnormalities. A
                  non-invasive, secure, and instant check-up for your systemic
                  health.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-[#319795] px-6 py-3 text-base font-bold text-white hover:bg-[#2C7A7B] transition-all hover:shadow-lg">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Watch Demo Video
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg border-2 border-[#E2E8F0] px-6 py-3 text-base font-bold text-[#1A202C] hover:border-[#319795] transition-colors">
                    View Technical Docs
                  </button>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#E2E8F0]">
                <div className="aspect-video bg-gradient-to-br from-[#2C5282] via-[#319795] to-[#1A365D] relative">
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
                      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1a365d] flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#319795] animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Overlay Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#718096] uppercase">
                        Processing Status
                      </span>
                      <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Analyzing
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#319795] rounded-full animate-pulse"
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
        <section className="process-section py-20 bg-[#F7FAFC]">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <div className="text-center mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[#319795] mb-2 block">
                The Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4">
                From Scan to Insight in Seconds
              </h2>
              <p className="text-lg text-[#718096] max-w-2xl mx-auto">
                The entire process is designed to be seamless, secure, and fast.
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-[#E2E8F0]">
                <div className="timeline-progress absolute inset-0 bg-gradient-to-b from-[#319795] to-[#2C5282]" />
              </div>

              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div key={index} className="process-step relative flex gap-8">
                    {/* Step Number */}
                    <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-white border-4 border-[#319795] flex items-center justify-center shadow-lg">
                      <span className="text-lg font-black text-[#319795]">
                        {step.number}
                      </span>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#319795]/10 text-[#319795] flex items-center justify-center flex-shrink-0">
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#1A202C] mb-2">
                              {step.title}
                            </h3>
                            <p className="text-[#718096] leading-relaxed">
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
        <section className="features-section py-20 bg-white border-y border-[#E2E8F0]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="sticky top-24">
                <span className="text-sm font-bold uppercase tracking-wider text-[#319795] mb-2 block">
                  AI Analysis
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4">
                  Decoding the Retina:
                  <br />
                  What the AI Sees
                </h2>
                <p className="text-lg text-[#718096] mb-6 leading-relaxed">
                  The AURA Engine doesn't just look at the picture; it measures
                  microscopic changes in your vascular network. These subtle
                  indicators correlate strongly with systemic health conditions.
                </p>

                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 rounded-full bg-[#319795]/10 text-sm font-medium text-[#319795]">
                    Deep Learning
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-[#2C5282]/10 text-sm font-medium text-[#2C5282]">
                    Computer Vision
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-green-100 text-sm font-medium text-green-700">
                    98.5% Accuracy
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="feature-card bg-[#F7FAFC] rounded-xl p-6 border border-[#E2E8F0] hover:border-[#319795]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#319795]/10 text-[#319795] flex items-center justify-center flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1A202C] mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-[#718096] leading-relaxed">
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
        <section className="trust-section py-16 bg-[#F7FAFC]">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <div className="bg-gradient-to-br from-[#319795]/5 to-[#2C5282]/5 rounded-2xl p-8 md:p-12 border border-[#319795]/20 text-center">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1A202C] mb-4">
                Built on Trust & Ethical AI
              </h2>
              <p className="text-[#718096] max-w-2xl mx-auto mb-8">
                AURA is a non-profit initiative dedicated to accessibility. We
                do not sell your data. Our models are trained on diverse
                datasets to minimize bias and ensure accuracy across all
                demographics.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="trust-badge flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#E2E8F0]">
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
                  <span className="text-sm font-medium text-[#1A202C]">
                    HIPAA Compliant
                  </span>
                </div>
                <div className="trust-badge flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#E2E8F0]">
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
                  <span className="text-sm font-medium text-[#1A202C]">
                    GDPR Ready
                  </span>
                </div>
                <div className="trust-badge flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#E2E8F0]">
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
                  <span className="text-sm font-medium text-[#1A202C]">
                    Bias Checked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white border-t border-[#E2E8F0]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4">
              Take Control of Your Vascular Health
            </h2>
            <p className="text-lg text-[#718096] max-w-2xl mx-auto mb-10">
              Early detection can save lives. Find a screening partner near you
              or learn more about integrating AURA into your practice.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-lg bg-[#319795] px-8 py-4 text-lg font-bold text-white hover:bg-[#2C7A7B] transition-all hover:shadow-xl hover:-translate-y-1">
                Start Screening Now
              </button>
              <button className="rounded-lg border-2 border-[#E2E8F0] px-8 py-4 text-lg font-bold text-[#1A202C] hover:border-[#319795] transition-colors">
                For Healthcare Providers
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
