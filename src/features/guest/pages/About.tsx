import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

      // Team cards stagger
      gsap.fromTo(
        '.team-card',
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: '.team-section',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
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

      // Stats counter animation
      gsap.fromTo(
        '.stat-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.stats-section',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Timeline animation
      gsap.fromTo(
        '.timeline-item',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.timeline-section',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const teamMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief Medical Officer',
      image: 'https://i.pravatar.cc/300?img=1',
      bio: 'Board-certified ophthalmologist with 15+ years in retinal diagnostics.',
    },
    {
      name: 'Dr. Michael Torres',
      role: 'Head of AI Research',
      image: 'https://i.pravatar.cc/300?img=3',
      bio: 'PhD in Computer Vision from MIT, specializing in medical imaging AI.',
    },
    {
      name: 'Dr. Emily Nakamura',
      role: 'Director of Clinical Validation',
      image: 'https://i.pravatar.cc/300?img=5',
      bio: 'Expert in clinical trials and FDA regulatory pathways for medical devices.',
    },
    {
      name: 'James Wilson',
      role: 'Chief Technology Officer',
      image: 'https://i.pravatar.cc/300?img=8',
      bio: 'Former Google Health engineer with expertise in scalable medical platforms.',
    },
  ];

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
      title: 'Health Equity',
      description:
        'Making advanced retinal screening accessible to underserved communities worldwide.',
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
      title: 'Privacy First',
      description:
        'Your health data is encrypted, anonymized, and never sold to third parties.',
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
      title: 'Open Source',
      description:
        'Our core algorithms are open for peer review, ensuring transparency and trust.',
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
      title: 'Collaboration',
      description:
        'Partnering with researchers and clinicians globally to advance retinal health.',
    },
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Founded',
      description:
        'AURA was founded with a mission to democratize retinal health screening.',
    },
    {
      year: '2021',
      title: 'First Model',
      description:
        'Released our first AI model for diabetic retinopathy detection.',
    },
    {
      year: '2022',
      title: 'FDA Breakthrough',
      description:
        'Received FDA Breakthrough Device Designation for our screening platform.',
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description:
        'Expanded to 30+ countries, partnering with 200+ healthcare institutions.',
    },
    {
      year: '2024',
      title: '1M Screenings',
      description:
        'Reached 1 million retinal screenings, helping detect early-stage diseases.',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--color-bg-medical)]"
    >
      <Header />

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
                Non-Profit Healthcare Initiative
              </div>
              <h1 className="about-hero-title text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
                Democratizing Access to{' '}
                <span className="text-[var(--color-brand-primary)]">
                  Retinal Health
                </span>
              </h1>
              <p className="about-hero-desc text-lg lg:text-xl text-gray-300 leading-relaxed">
                We're a team of ophthalmologists, AI researchers, and healthcare
                advocates united by a single mission: making early disease
                detection accessible to everyone, everywhere.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section py-16 bg-white border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="stat-item text-center p-6">
                <div className="text-4xl font-black text-[var(--color-brand-primary)] mb-2">
                  1M+
                </div>
                <div className="text-sm font-medium text-[var(--color-text-muted)]">
                  Screenings Completed
                </div>
              </div>
              <div className="stat-item text-center p-6">
                <div className="text-4xl font-black text-[var(--color-brand-primary)] mb-2">
                  30+
                </div>
                <div className="text-sm font-medium text-[var(--color-text-muted)]">
                  Countries Reached
                </div>
              </div>
              <div className="stat-item text-center p-6">
                <div className="text-4xl font-black text-[var(--color-brand-primary)] mb-2">
                  200+
                </div>
                <div className="text-sm font-medium text-[var(--color-text-muted)]">
                  Partner Institutions
                </div>
              </div>
              <div className="stat-item text-center p-6">
                <div className="text-4xl font-black text-[var(--color-brand-primary)] mb-2">
                  98.5%
                </div>
                <div className="text-sm font-medium text-[var(--color-text-muted)]">
                  Detection Accuracy
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="values-section py-20 bg-[var(--color-bg-medical)]">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                Our Values
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)] mb-4">
                Built on Principles That Matter
              </h2>
              <p className="text-lg text-[var(--color-text-muted)]">
                Every decision we make is guided by our commitment to health
                equity, privacy, and scientific integrity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="value-card bg-white rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg hover:border-[var(--color-brand-primary)]/30 transition-all duration-300 hover:-translate-y-1"
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

        {/* Team Section */}
        <section className="team-section py-20 bg-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                Leadership
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)] mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-[var(--color-text-muted)]">
                World-class experts in ophthalmology, AI, and global health
                working together.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-card group">
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm">{member.bio}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)]">
                    {member.name}
                  </h3>
                  <p className="text-sm text-[var(--color-brand-primary)] font-medium">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section py-20 bg-[var(--color-bg-medical)]">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <div className="text-center mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2 block">
                Our Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand-dark)]">
                Milestones & Achievements
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[var(--color-border)]" />
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className="timeline-item relative flex gap-6 pl-8"
                  >
                    <div className="absolute left-0 w-16 h-16 rounded-full bg-white border-4 border-[var(--color-brand-primary)]/20 flex items-center justify-center z-10">
                      <span className="text-sm font-bold text-[var(--color-brand-primary)]">
                        {item.year}
                      </span>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-6 border border-[var(--color-border)] ml-12 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[var(--color-brand-dark)] to-[#0F172A] text-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Join Our Mission
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Whether you're a healthcare provider, researcher, or advocate,
              there's a place for you in the AURA community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-lg bg-[var(--color-brand-primary)] px-8 py-3 text-base font-bold text-white hover:bg-[var(--color-brand-primary)] transition-all hover:shadow-lg">
                Partner With Us
              </button>
              <button className="rounded-lg border-2 border-white/30 bg-transparent px-8 py-3 text-base font-bold text-white hover:bg-white/10 transition-colors">
                View Open Positions
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
