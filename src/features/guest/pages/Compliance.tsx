import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const CompliancePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        '.compliance-hero-title',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.compliance-hero-desc',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' }
      );

      // Certification cards stagger
      gsap.fromTo(
        '.cert-card',
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: '.certifications-section',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Partner logos animation
      gsap.fromTo(
        '.partner-logo',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.partners-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Features cards
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.features-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Audit section
      gsap.fromTo(
        '.audit-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.audit-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const certifications = [
    {
      name: 'HIPAA COMPLIANT',
      fullName: 'Health Insurance Portability and Accountability Act',
      logo: 'https://images.seeklogo.com/logo-png/48/1/hipaa-compliant-logo-png_seeklogo-488323.png',
    },
    {
      name: 'SOC 2 TYPE II',
      fullName: 'System and Organization Controls 2',
      logo: 'https://www.pwcampbell.com/wp-content/uploads/Soc-2-Type-2-Logo-Transparent-1-1024x1024.png',
    },
    {
      name: 'GDPR COMPLIANT',
      fullName: 'General Data Protection Regulation',
      logo: 'https://tse4.mm.bing.net/th/id/OIP.2smSCJEdN_jF6tLlJlDFdAHaD-?rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      name: 'ISO 27001',
      fullName: 'Information Security Management',
      logo: 'https://png.pngtree.com/png-vector/20250130/ourlarge/pngtree-iso-27001-certified-vector-png-image_15374396.png',
    },
    {
      name: 'FDA 21 CFR PART 11',
      fullName: 'Electronic Records & Signatures',
      logo: 'https://tse1.mm.bing.net/th/id/OIP.JRz1Wa9N_28q2RsK9_aR6wHaEH?rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      name: 'CE MARK CERTIFIED',
      fullName: 'European Conformity',
      logo: 'https://nbscience.com/wp-content/uploads/2018/04/stem-cell-stem-cell-therapy-stem-cell-ukraine-stem-cell-clinic-stem-cell-hospital-stem-cell-tretament-stem-cell-kiev-stem-cell-risks-stem-cell-autism-stem-cell-joints-stem-cells-emcell-clinic-134.jpg',
    },
  ];

  const securityFeatures = [
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: 'End-to-End Encryption',
      description:
        'All data is encrypted in transit (TLS 1.3) and at rest (AES-256).',
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
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      ),
      title: 'Multi-Factor Authentication',
      description:
        'Secure access with MFA, SSO integration, and biometric options.',
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      title: 'Comprehensive Audit Logs',
      description:
        'Complete audit trail of all system access and data modifications.',
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      title: 'Automatic Backups',
      description:
        'Geo-redundant backups with point-in-time recovery capabilities.',
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: '99.99% Uptime SLA',
      description:
        'Enterprise-grade infrastructure with guaranteed availability.',
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
      title: 'Role-Based Access Control',
      description: 'Granular permissions with principle of least privilege.',
    },
  ];

  const auditTimeline = [
    {
      date: 'January 2026',
      event: 'SOC 2 Type II Annual Audit',
      status: 'Completed',
      details: 'Zero findings, full compliance maintained',
    },
    {
      date: 'December 2025',
      event: 'HIPAA Security Risk Assessment',
      status: 'Completed',
      details: 'All 164 controls verified and documented',
    },
    {
      date: 'October 2025',
      event: 'ISO 27001 Recertification',
      status: 'Completed',
      details: 'Extended certification through 2028',
    },
    {
      date: 'September 2025',
      event: 'Penetration Testing',
      status: 'Completed',
      details: 'Third-party security assessment by certified firm',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[var(--color-bg-medical)]"
    >
      <Header />
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 text-center">
            <h1 className="compliance-hero-title text-4xl font-bold leading-tight tracking-tight text-[var(--color-brand-dark)] sm:text-5xl lg:text-6xl mb-6">
              Healthcare Compliance &{' '}
              <span className="text-[var(--color-brand-primary)]">
                Security Standards
              </span>
            </h1>

            <p className="compliance-hero-desc max-w-3xl mx-auto text-lg text-[var(--color-text-muted)] mb-12">
              AURA Eyes is built with security and compliance at its core. We
              maintain the highest standards to protect patient data and ensure
              regulatory compliance across all healthcare jurisdictions.
            </p>

            {/* Certification Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="cert-card inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)]/5 border border-[var(--color-brand-primary)]/10 px-5 py-2.5"
                >
                  <img
                    className="w-10 h-10 object-cover rounded-full"
                    src={cert.logo}
                    alt={cert.name}
                    loading="lazy"
                  />
                  <span className="text-sm font-semibold text-[var(--color-brand-primary)] tracking-wide">
                    {cert.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#details"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-6 text-base font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Learn More
              </a>
              <a
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-6 text-base font-semibold text-[var(--color-brand-dark)] hover:bg-gray-50 transition-colors"
              >
                Request Security Report
              </a>
            </div>
          </div>
        </section>

        {/* Certification Details Section */}
        <section
          id="details"
          className="certifications-section py-20 bg-gray-50"
        >
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-4">
                Certification Details
              </h2>
              <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
                We undergo rigorous third-party audits and maintain
                certifications to ensure the highest level of security and
                privacy protection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[var(--color-brand-primary)]/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-15 h-15 rounded-lg flex items-center justify-center p-2">
                      <img
                        src={cert.logo}
                        alt={cert.name}
                        className="w-full h-full object-cover rounded-full"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-brand-dark)]">
                      {cert.name}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {cert.fullName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Features Section */}
        <section className="features-section py-20 bg-gray-50">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-4">
                Security Infrastructure
              </h2>
              <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
                Enterprise-grade security features protecting your data at every
                layer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-[var(--color-brand-primary)]/30 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-brand-dark)] mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audit Timeline Section */}
        <section className="audit-section py-20 bg-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-4">
                Recent Audits & Assessments
              </h2>
              <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
                We maintain a continuous audit schedule to ensure ongoing
                compliance and security.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

                {auditTimeline.map((item, index) => (
                  <div
                    key={index}
                    className="audit-item relative pl-12 pb-8 last:pb-0"
                  >
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-[var(--color-brand-primary)]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-[var(--color-brand-primary)]/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">
                          {item.date}
                        </span>
                        <span className="text-xs font-medium text-[var(--color-brand-primary)]">
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--color-brand-dark)] mb-1">
                        {item.event}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {item.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 text-center">
            <h2 className="text-3xl font-bold text-[var(--color-brand-dark)] mb-4">
              Ready to Learn More About Our Security?
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8">
              Contact our security team for detailed documentation, penetration
              test reports, or to schedule a security review call.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-6 text-base font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Contact Security Team
              </a>
              <a
                href="/ethics"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-6 text-base font-semibold text-[var(--color-brand-dark)] hover:bg-gray-50 transition-colors"
              >
                View Privacy Policy
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CompliancePage;
