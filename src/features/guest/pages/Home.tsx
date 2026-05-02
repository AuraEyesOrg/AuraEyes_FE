import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Briefcase,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { resolvePathWithLocale } from '@/i18n/middleware';
import i18n, { resources } from '@/i18n/i18n';
import {
  fetchGuestOverviewMetrics,
  type GuestOverviewMetrics,
} from '../api/guest.api';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import GuestPageContextBar from '../components/GuestPageContextBar';
import MedicalTermTooltip from '../components/MedicalTermTooltip';
import SourceVerificationTag from '../components/SourceVerificationTag';
import GuestTrustedBy from '../components/GuestTrustedBy';
import { prefersReducedMotion } from '../utils/motion';
import { SeoMeta } from '@/hooks/useSeoMeta';
import { useGuestTour } from '../tour';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const { t: i18nT } = useTranslation();
  const navigate = useNavigate();
  const { setTourBlocked } = useGuestTour();
  const [showRecruitment, setShowRecruitment] = useState(false);

  const hasShownThisVisit = useRef(false);

  useLayoutEffect(() => {
    // Block the tour immediately to wait for popup
    setTourBlocked(true);

    const timer = setTimeout(() => {
      if (!hasShownThisVisit.current) {
        setShowRecruitment(true);
        hasShownThisVisit.current = true;
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      setTourBlocked(false);
    };
  }, [setTourBlocked]);

  const handleClosePopup = () => {
    setShowRecruitment(false);
    // Unblock the tour after closing the popup
    setTourBlocked(false);
  };

  const resolveResourceValue = (locale: 'vi' | 'en', key: string) => {
    return key.split('.').reduce<unknown>((accumulator, segment) => {
      if (
        accumulator &&
        typeof accumulator === 'object' &&
        segment in (accumulator as Record<string, unknown>)
      ) {
        return (accumulator as Record<string, unknown>)[segment];
      }

      return undefined;
    }, resources[locale].translation);
  };

  const t = (key: string, fallback = '') => {
    const translated = i18nT(key, { defaultValue: '' });

    if (translated && translated !== key) {
      return translated;
    }

    const normalizedLocale = (i18n.resolvedLanguage ?? i18n.language ?? 'vi')
      .toLowerCase()
      .startsWith('en')
      ? 'en'
      : 'vi';

    const localeCandidates: Array<'vi' | 'en'> =
      normalizedLocale === 'en' ? ['en', 'vi'] : ['vi', 'en'];

    for (const locale of localeCandidates) {
      const resourceValue = resolveResourceValue(locale, key);

      if (
        typeof resourceValue === 'string' &&
        resourceValue.trim().length > 0
      ) {
        return resourceValue;
      }
    }

    return fallback || key;
  };

  const heroTitlePrefix = t(
    'Home.hero.titlePrefix',
    i18nT('GuestHome.title', {
      defaultValue:
        'Detect retinal diseases early with clinical-grade precision',
    })
  );
  const heroTitleHighlight = t('Home.hero.titleHighlight', '');
  const hasHeroTitleHighlight =
    heroTitleHighlight.trim().length > 0 &&
    heroTitleHighlight !== 'Home.hero.titleHighlight';

  const { data: overviewMetrics = null } =
    useQuery<GuestOverviewMetrics | null>({
      queryKey: ['guest-overview-metrics'],
      queryFn: fetchGuestOverviewMetrics,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    });

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const floatingParticlesRef = useRef<HTMLDivElement>(null);

  const formatMetricValue = (value: number | null): string => {
    if (value === null) {
      return '--';
    }

    return new Intl.NumberFormat(
      i18n.resolvedLanguage?.startsWith('vi') ? 'vi-VN' : 'en-US',
      {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      }
    ).format(value);
  };

  const formatRatingValue = (value: number | null): string => {
    if (value === null) {
      return '--/5';
    }

    return `${value.toFixed(1)}/5`;
  };

  const liveStats = useMemo(
    () => [
      {
        value: overviewMetrics?.ophthalmologistCount ?? null,
        kind: 'count' as const,
        label: t(
          'Home.liveStats.ophthalmologists',
          'Verified ophthalmologists'
        ),
      },
      {
        value: overviewMetrics?.organisationCount ?? null,
        kind: 'count' as const,
        label: t('Home.liveStats.organisations', 'Partner organisations'),
      },
      {
        value: overviewMetrics?.screeningCount ?? null,
        kind: 'count' as const,
        label: t('Home.liveStats.screenings', 'Screenings'),
      },
      {
        value: overviewMetrics?.averageRating ?? null,
        kind: 'rating' as const,
        label: t('Home.liveStats.feedbacks', 'Feedbacks'),
      },
    ],
    [overviewMetrics, i18n.language]
  );

  const hasLiveStats = liveStats.some((stat) => stat.value !== null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    const ctx = gsap.context(() => {
      const particles =
        floatingParticlesRef.current?.querySelectorAll('.particle');
      particles?.forEach((particle, i) => {
        gsap.set(particle, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * 500,
        });
        gsap.to(particle, {
          y: '-=100',
          x: `+=${Math.random() * 100 - 50}`,
          opacity: 0.8,
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2,
        });
      });

      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Badge animation
      heroTl.fromTo(
        '.hero-badge',
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 }
      );

      // Title words animation (split text effect)
      heroTl.fromTo(
        '.hero-title',
        { opacity: 0, y: 60, rotateX: 15 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.1 },
        '-=0.4'
      );

      // Gradient text special effect
      heroTl.fromTo(
        '.hero-gradient-text',
        { backgroundSize: '0% 100%' },
        { backgroundSize: '100% 100%', duration: 1.2 },
        '-=0.6'
      );

      // Description
      heroTl.fromTo(
        '.hero-description',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      );

      // Buttons stagger
      heroTl.fromTo(
        '.hero-buttons button',
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15 },
        '-=0.4'
      );

      // Hero image 3D entrance
      heroTl.fromTo(
        '.hero-image-container',
        {
          opacity: 0,
          scale: 0.8,
          rotateY: -15,
          rotateX: 10,
          transformPerspective: 1000,
        },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          rotateX: 0,
          duration: 1.2,
          ease: 'back.out(1.2)',
        },
        '-=1'
      );

      gsap.to('.hero-image-container', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Section title reveal
      gsap.fromTo(
        '.features-title',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            end: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Feature cards 3D stagger
      gsap.fromTo(
        '.feature-card',
        {
          opacity: 0,
          y: 80,
          rotateX: 15,
          transformPerspective: 800,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: 'top 80%',
            end: 'top 40%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Feature card icons bounce
      gsap.fromTo(
        '.feature-icon',
        { scale: 0, rotate: -180 },
        {
          scale: 1,
          rotate: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // ========== WORKFLOW/TIMELINE ANIMATIONS ==========
      // Timeline line draw
      gsap.fromTo(
        '.timeline-line',
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 1.5,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: workflowRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Steps reveal with 3D rotation
      gsap.fromTo(
        '.workflow-step',
        {
          opacity: 0,
          y: 60,
          scale: 0.8,
          rotateY: -30,
          transformPerspective: 1000,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.25,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Step icons pulse
      gsap.to('.step-icon', {
        scale: 1.1,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.3,
      });

      // Mission card 3D entrance
      gsap.fromTo(
        '.mission-card',
        {
          opacity: 0,
          scale: 0.85,
          rotateX: 10,
          y: 80,
          transformPerspective: 1200,
        },
        {
          opacity: 1,
          scale: 1,
          rotateX: 0,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: missionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Mission text reveal
      gsap.fromTo(
        '.mission-text > *',
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          scrollTrigger: {
            trigger: missionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Mission info card slide
      gsap.fromTo(
        '.mission-info-card',
        { opacity: 0, x: 60, rotateY: 15 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 1,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: missionRef.current,
            start: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stats cards stagger
      gsap.fromTo(
        '.live-stat-card',
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      const magneticButtons = document.querySelectorAll('.magnetic-btn');
      magneticButtons.forEach((btn) => {
        btn.addEventListener('mousemove', (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const rect = (btn as HTMLElement).getBoundingClientRect();
          const x = mouseEvent.clientX - rect.left - rect.width / 2;
          const y = mouseEvent.clientY - rect.top - rect.height / 2;

          gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
          });
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const currentLocale = (i18n.resolvedLanguage ?? i18n.language ?? 'vi')
    .toLowerCase()
    .startsWith('en')
    ? 'en'
    : 'vi';
  const homeCanonical = `https://web.auraeyes.site/${currentLocale}/`;

  const homeStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalOrganization',
      name: 'AURA Digital Hospital',
      url: 'https://web.auraeyes.site',
      description: t('GuestHome.description'),
      medicalSpecialty: ['Ophthalmology', 'Digital Health'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AURA',
      url: 'https://web.auraeyes.site',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://web.auraeyes.site/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[var(--color-medical-bg)]"
    >
      {/* SEO Metadata */}
      <SeoMeta
        title={t('GuestHome.title', 'Bệnh viện Kỹ thuật số Aura')}
        description={t('GuestHome.description')}
        canonical={homeCanonical}
        locale={currentLocale}
        structuredData={homeStructuredData}
      />

      {/* Floating Particles Background */}
      <div
        ref={floatingParticlesRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      >
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 rounded-full opacity-30"
            style={{
              background:
                i % 2 === 0
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-brand-dark)',
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      <Header />
      <GuestPageContextBar
        currentLabel={t('Navigation.home')}
        readingTimeMinutes={4}
        complexity="moderate"
        sourceLabel={t('GuestEnhancements.source.auraGovernance')}
      />
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative overflow-hidden py-16 lg:py-24 bg-white"
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full opacity-10"
              style={{
                background:
                  'radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)',
                animation: 'pulse 8s ease-in-out infinite',
              }}
            />
            <div
              className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
              style={{
                background:
                  'radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)',
                animation: 'pulse 10s ease-in-out infinite reverse',
              }}
            />
          </div>

          <div className="mx-auto max-w-[1280px] px-6 lg:px-10 relative z-10">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
              <div
                ref={heroTextRef}
                className="flex flex-1 flex-col gap-6 lg:gap-8"
              >
                <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-primary)] w-fit">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{t('Home.hero.badge')}</span>
                </div>
                <h1
                  className="hero-title text-4xl font-black leading-tight tracking-tight text-[var(--color-brand-dark)] sm:text-5xl lg:text-6xl"
                  style={{ perspective: '1000px' }}
                >
                  {heroTitlePrefix}
                  {hasHeroTitleHighlight ? ' ' : ''}
                  {hasHeroTitleHighlight ? (
                    <span className="hero-gradient-text text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[#0EA5A5]">
                      {heroTitleHighlight}
                    </span>
                  ) : null}
                </h1>
                <p className="hero-description max-w-xl text-lg text-[var(--color-text-muted)]">
                  {t('Home.hero.description')}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <MedicalTermTooltip
                    term={t('GuestEnhancements.terms.fundus')}
                    description={t('GuestEnhancements.tooltips.fundus')}
                  />
                  <MedicalTermTooltip
                    term={t('GuestEnhancements.terms.oct')}
                    description={t('GuestEnhancements.tooltips.oct')}
                  />
                  <MedicalTermTooltip
                    term={t('GuestEnhancements.terms.macular')}
                    description={t('GuestEnhancements.tooltips.macular')}
                  />
                </div>
                <SourceVerificationTag
                  label={t('GuestEnhancements.source.auraGovernance')}
                />
                <div className="hero-buttons flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(resolvePathWithLocale('/how-it-works'))
                    }
                    className="magnetic-btn inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-6 py-2 text-base font-bold text-white hover:brightness-110 transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/30"
                  >
                    <span className="flex flex-col items-start leading-tight">
                      <span>{t('Home.hero.primaryCta')}</span>
                      <span className="guest-cta-subtext">
                        {t('GuestEnhancements.ctaSubtext.quickAction')}
                      </span>
                    </span>
                  </button>
                </div>

                <div className="mt-4">
                  <GuestTrustedBy />
                </div>
              </div>
              <div
                ref={heroImageRef}
                className="relative flex-1 lg:pl-10 flex justify-center items-center"
                style={{ perspective: '1200px' }}
              >
                {/* Retinal Eye Scanner - Circular Design */}
                <div
                  className="hero-image-container relative w-[400px] h-[400px] lg:w-[480px] lg:h-[480px]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute left-4 top-4 z-20 flex flex-col gap-1">
                    <span className="guest-image-metadata">
                      {t('GuestEnhancements.imageMeta.highResFundus')}
                    </span>
                    <span className="guest-image-metadata">
                      {t('GuestEnhancements.imageMeta.scaleOneToOne')}
                    </span>
                  </div>

                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-brand-primary)] to-[#0EA5A5] opacity-20 blur-xl animate-pulse" />

                  {/* Outer scanning ring */}
                  <div
                    className="absolute inset-0 rounded-full border-4 border-[var(--color-brand-primary)]/30"
                    style={{
                      animation: 'rotateRing 8s linear infinite',
                    }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-brand-primary)] rounded-full shadow-lg shadow-[var(--color-brand-primary)]/50" />
                  </div>

                  {/* Secondary rotating ring */}
                  <div
                    className="absolute inset-4 rounded-full border-2 border-dashed border-[var(--color-brand-primary)]/40"
                    style={{
                      animation: 'rotateRing 12s linear infinite reverse',
                    }}
                  />

                  {/* Main eye container */}
                  <div className="absolute inset-8 rounded-full overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1a365d] to-[#0d2137] shadow-2xl">
                    {/* Retinal texture background */}
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{
                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQvJj5-5RCvY8IYCi8flBAIcoOn17PKUUWhYeyhvPswg9MC8Sh0-e_PNqkowy7wAfOknOPWU_jPTOUcwMjQ41qDwYmUQvzjUaSjSheu59lNCv0c_JShcj5yCYaiLd7Cg5nzydktmOMcrZln56KPJAduosyEDZRifEnJxSD035IQLns2wcVfVzb4py-HXozIEQEFxnuwCbB-DtDS2t_BieKdCp_EJVOTswflhTIjtN_0e9SOSs2L4losk5qWC99hbsIiKUR4hmTWuYr')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />

                    {/* Iris ring effect */}
                    <div className="absolute inset-[15%] rounded-full border-[3px] border-[var(--color-brand-primary)]/40" />
                    <div className="absolute inset-[20%] rounded-full border-2 border-[var(--color-brand-primary)]/30" />
                    <div className="absolute inset-[25%] rounded-full border border-[var(--color-brand-primary)]/20" />

                    {/* Pupil (center) */}
                    <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] shadow-inner">
                      {/* Pupil reflection */}
                      <div className="absolute top-[20%] left-[25%] w-[20%] h-[20%] bg-white/30 rounded-full blur-sm" />
                      <div className="absolute top-[30%] left-[35%] w-[10%] h-[10%] bg-white/50 rounded-full" />
                    </div>

                    {/* Scanning laser beam - horizontal */}
                    <div
                      className="scan-beam absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-brand-primary)] to-transparent shadow-lg shadow-[var(--color-brand-primary)]"
                      style={{
                        animation: 'scanBeamVertical 2.5s ease-in-out infinite',
                        boxShadow: '0 0 20px 2px rgba(19, 236, 236, 0.8)',
                      }}
                    />

                    {/* Scanning laser beam - vertical */}
                    <div
                      className="absolute top-0 bottom-0 w-[2px] left-1/2 -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--color-brand-primary)] to-transparent"
                      style={{
                        animation: 'scanBeamHorizontal 3s ease-in-out infinite',
                        animationDelay: '0.5s',
                        boxShadow: '0 0 15px 2px rgba(19, 236, 236, 0.6)',
                      }}
                    />

                    {/* Circular scanning wave */}
                    <div
                      className="absolute inset-[30%] rounded-full border-2 border-[var(--color-brand-primary)]/60"
                      style={{
                        animation: 'scanWave 2s ease-out infinite',
                      }}
                    />
                    <div
                      className="absolute inset-[30%] rounded-full border-2 border-[var(--color-brand-primary)]/60"
                      style={{
                        animation: 'scanWave 2s ease-out infinite',
                        animationDelay: '0.6s',
                      }}
                    />
                    <div
                      className="absolute inset-[30%] rounded-full border-2 border-[var(--color-brand-primary)]/60"
                      style={{
                        animation: 'scanWave 2s ease-out infinite',
                        animationDelay: '1.2s',
                      }}
                    />

                    {/* Corner brackets */}
                    <div className="absolute top-[10%] left-[10%] w-8 h-8 border-l-2 border-t-2 border-[var(--color-brand-primary)]/80" />
                    <div className="absolute top-[10%] right-[10%] w-8 h-8 border-r-2 border-t-2 border-[var(--color-brand-primary)]/80" />
                    <div className="absolute bottom-[10%] left-[10%] w-8 h-8 border-l-2 border-b-2 border-[var(--color-brand-primary)]/80" />
                    <div className="absolute bottom-[10%] right-[10%] w-8 h-8 border-r-2 border-b-2 border-[var(--color-brand-primary)]/80" />

                    {/* Data points animation */}
                    <div className="absolute top-[15%] left-[50%] -translate-x-1/2">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-[var(--color-brand-primary)] rounded-full animate-pulse" />
                        <div
                          className="w-1 h-1 bg-[var(--color-brand-primary)] rounded-full animate-pulse"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <div
                          className="w-1 h-1 bg-[var(--color-brand-primary)] rounded-full animate-pulse"
                          style={{ animationDelay: '0.4s' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CSS Keyframes for animations */}
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.1; }
              50% { transform: scale(1.1); opacity: 0.15; }
            }
            @keyframes scanLine {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100%); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            @keyframes rotateRing {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes scanBeamVertical {
              0%, 100% { top: 10%; opacity: 0; }
              10% { opacity: 1; }
              50% { top: 50%; opacity: 1; }
              90% { opacity: 1; }
              100% { top: 90%; opacity: 0; }
            }
            @keyframes scanBeamHorizontal {
              0%, 100% { transform: translateX(-50%) scaleY(0.5); opacity: 0; }
              50% { transform: translateX(-50%) scaleY(1); opacity: 0.8; }
            }
            @keyframes scanWave {
              0% { 
                transform: scale(1); 
                opacity: 0.8; 
              }
              100% { 
                transform: scale(2.5); 
                opacity: 0; 
              }
            }
            @keyframes dataFlow {
              0% { transform: translateY(0); opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translateY(-20px); opacity: 0; }
            }
          `}</style>
        </section>

        {/* Feature Grid */}
        <section
          ref={featuresRef}
          className="bg-[var(--color-medical-bg)] py-16 lg:py-24 border-y border-[var(--color-medical-border)]"
        >
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="features-title mb-12 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-brand-dark)] sm:text-4xl mb-4">
                {t('Home.features.title')}
              </h2>
              <p className="text-lg text-[var(--color-text-muted)]">
                {t('Home.features.description')}
              </p>
            </div>
            <div
              ref={featureCardsRef}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {/* Feature 1 */}
              <div
                className="feature-card group relative overflow-hidden rounded-xl border border-[var(--color-medical-border)] bg-white p-8 transition-all hover:shadow-xl hover:shadow-[var(--color-brand-primary)]/10 hover:border-[var(--color-brand-primary)]/50 hover:-translate-y-2"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="feature-icon mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-all duration-300">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--color-brand-dark)]">
                  {t('Home.features.cards.aiPrecision.title')}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {t('Home.features.cards.aiPrecision.description')}
                </p>
              </div>

              {/* Feature 2 */}
              <div
                className="feature-card group relative overflow-hidden rounded-xl border border-[var(--color-medical-border)] bg-white p-8 transition-all hover:shadow-xl hover:shadow-[var(--color-brand-primary)]/10 hover:border-[var(--color-brand-primary)]/50 hover:-translate-y-2"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="feature-icon mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-all duration-300">
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
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--color-brand-dark)]">
                  {t('Home.features.cards.globalAccess.title')}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {t('Home.features.cards.globalAccess.description')}
                </p>
              </div>

              {/* Feature 3 */}
              <div
                className="feature-card group relative overflow-hidden rounded-xl border border-[var(--color-medical-border)] bg-white p-8 transition-all hover:shadow-xl hover:shadow-[var(--color-brand-primary)]/10 hover:border-[var(--color-brand-primary)]/50 hover:-translate-y-2"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="feature-icon mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-all duration-300">
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
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--color-brand-dark)]">
                  {t('Home.features.cards.privacyFirst.title')}
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {t('Home.features.cards.privacyFirst.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline / How it works */}
        <section ref={workflowRef} className="py-16 lg:py-24 bg-white">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-primary)] mb-2">
                {t('Home.workflow.badge')}
              </span>
              <h2 className="text-3xl font-bold text-[var(--color-brand-dark)] sm:text-4xl">
                {t('Home.workflow.title')}
              </h2>
            </div>
            <div className="relative">
              {/* Connecting line for desktop - animated */}
              <div className="timeline-line absolute top-1/2 left-0 w-full -translate-y-1/2 border-t-2 border-dashed border-[var(--color-brand-primary)]/40 hidden lg:block z-0"></div>
              <div
                ref={stepsRef}
                className="grid gap-12 lg:grid-cols-3 lg:gap-8 relative z-10"
              >
                {/* Step 1 */}
                <div
                  className="workflow-step flex flex-col items-center text-center bg-white p-4"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="step-icon flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] shadow-lg shadow-[var(--color-brand-primary)]/10 mb-6 hover:border-[var(--color-brand-primary)] transition-all duration-300">
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t('Home.workflow.steps.upload.title')}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
                    {t('Home.workflow.steps.upload.description')}
                  </p>
                </div>

                {/* Step 2 */}
                <div
                  className="workflow-step flex flex-col items-center text-center bg-white p-4"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="step-icon flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] shadow-lg shadow-[var(--color-brand-primary)]/10 mb-6 hover:border-[var(--color-brand-primary)] transition-all duration-300">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t('Home.workflow.steps.analysis.title')}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
                    {t('Home.workflow.steps.analysis.description')}
                  </p>
                </div>

                {/* Step 3 */}
                <div
                  className="workflow-step flex flex-col items-center text-center bg-white p-4"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="step-icon flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] shadow-lg shadow-[var(--color-brand-primary)]/10 mb-6 hover:border-[var(--color-brand-primary)] transition-all duration-300">
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
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-dark)] mb-2">
                    {t('Home.workflow.steps.report.title')}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
                    {t('Home.workflow.steps.report.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section
          ref={missionRef}
          data-tour="guest-home-mission"
          className="py-20 bg-[var(--color-medical-bg)] border-t border-[var(--color-medical-border)]"
        >
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div
              className="mission-card overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-brand-dark)] to-[#0F172A] text-white relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <svg
                  className="w-72 h-72"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="relative z-10 p-10 lg:p-16 flex flex-col md:flex-row gap-10 items-center">
                <div className="mission-text flex-1 space-y-6">
                  <h2 className="text-3xl font-bold sm:text-4xl text-white">
                    {t('Home.mission.title')}
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                    {t('Home.mission.description')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(resolvePathWithLocale('/about'))}
                      className="magnetic-btn flex items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-6 py-3 text-base font-bold text-white hover:brightness-110 transition-all hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/30 w-fit"
                    >
                      {t('Home.mission.primaryCta')}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(resolvePathWithLocale('/contact'))
                      }
                      className="magnetic-btn flex items-center justify-center rounded-lg border border-gray-600 bg-transparent px-6 py-3 text-base font-bold text-white hover:bg-white/10 transition-all w-fit"
                    >
                      {t('Home.mission.secondaryCta')}
                    </button>
                  </div>
                </div>
                <div className="flex-1 w-full md:w-auto flex justify-center md:justify-end">
                  <div
                    className="mission-info-card bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-sm w-full"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                      <svg
                        className="w-8 h-8 text-[var(--color-brand-primary)]"
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
                      <div>
                        <h4 className="font-bold text-white">
                          {t('Home.mission.info.nonProfitTitle')}
                        </h4>
                        <p className="text-sm text-gray-300">
                          {t('Home.mission.info.nonProfitDescription')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg
                        className="w-8 h-8 text-[var(--color-brand-primary)]"
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
                      <div>
                        <h4 className="font-bold text-white">
                          {t('Home.mission.info.openSourceTitle')}
                        </h4>
                        <p className="text-sm text-gray-300">
                          {t('Home.mission.info.openSourceDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasLiveStats ? (
          <section ref={statsRef} className="bg-white py-16">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4 md:divide-x md:divide-[var(--color-medical-border)]">
                {liveStats.map((stat, index) => (
                  <div key={index} className="live-stat-card p-4">
                    <div className="mb-2 text-4xl font-black text-[var(--color-brand-primary)]">
                      {stat.kind === 'rating'
                        ? `★ ${formatRatingValue(stat.value)}`
                        : formatMetricValue(stat.value)}
                    </div>
                    <div className="text-sm font-medium text-[var(--color-text-muted)]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <Footer />

      <AnimatePresence>
        {showRecruitment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <style>{`
              @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -40px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
              }
              @keyframes morph {
                0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
              }
              .animate-blob { animation: blob 8s infinite; }
              .animate-morph { animation: morph 8s ease-in-out infinite; }
              .animation-delay-2000 { animation-delay: 2s; }
              .animation-delay-4000 { animation-delay: 4s; }
            `}</style>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-[var(--color-brand-primary)] rounded-full mix-blend-multiply blur-[100px] opacity-40 animate-blob" />
              <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] bg-[#0EA5A5] rounded-full mix-blend-multiply blur-[100px] opacity-30 animate-blob animation-delay-2000" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.7 }}
              className="relative z-10 w-full max-w-[1000px] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-center gap-8 lg:gap-14"
            >
              <button
                onClick={handleClosePopup}
                className="absolute top-5 right-5 md:top-6 md:right-6 z-50 p-2.5 rounded-full bg-gray-100/80 hover:bg-gray-200 hover:scale-110 transition-all text-gray-500 hover:text-gray-900 hover:rotate-90 duration-300 shadow-sm border border-white"
                aria-label="Close"
              >
                <X size={22} strokeWidth={2.5} />
              </button>

              <div className="w-full md:w-5/12 flex justify-center mt-6 md:mt-0">
                <div className="relative w-[240px] h-[300px] lg:w-[320px] lg:h-[400px] animate-morph overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-[6px] border-white bg-slate-100 flex-shrink-0">
                  <img
                    src="/doctor.png"
                    alt="Aura Medical Network"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                  <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
                    <div className="flex items-center gap-1.5 text-[var(--color-brand-primary)] bg-white/95 backdrop-blur-md px-4 py-2 rounded-full w-fit shadow-md border border-gray-100">
                      <Sparkles size={14} className="text-yellow-500" />
                      <span className="text-xs font-black tracking-widest uppercase">
                        Aura Digital
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-7/12 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-full mb-5 shadow-sm">
                  <div className="text-[var(--color-brand-primary)]">
                    <Briefcase size={16} strokeWidth={2.5} />
                  </div>
                  <span className="uppercase tracking-widest text-[10px] font-bold text-gray-600">
                    Thư mời hợp tác chuyên môn
                  </span>
                </div>

                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                  {t(
                    'GuestHome.recruitmentPopup.title',
                    'Gia nhập đội ngũ Chuyên gia'
                  )}
                </h2>

                <p className="text-gray-600 text-sm lg:text-base mb-8 leading-relaxed max-w-md">
                  {t(
                    'GuestHome.recruitmentPopup.description',
                    'Chúng tôi đang tìm kiếm các bác sĩ tài năng để cùng kiến tạo tương lai y tế số. Trở thành một phần của Aura ngay hôm nay!'
                  )}
                </p>

                <div className="space-y-3.5 mb-8 w-full max-w-md text-left">
                  <div className="flex items-center gap-3 bg-gray-50/80 p-3 lg:p-4 rounded-xl border border-gray-100 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-primary)] shrink-0" />
                    <span className="text-gray-700 text-sm">
                      Nâng cao hiệu suất với{' '}
                      <strong>AI phân tích võng mạc</strong> độ chính xác lâm
                      sàng.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50/80 p-3 lg:p-4 rounded-xl border border-gray-100 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-primary)] shrink-0" />
                    <span className="text-gray-700 text-sm">
                      Tiếp cận nguồn bệnh nhân toàn cầu qua nền tảng khám từ xa.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center md:justify-start">
                  <button
                    onClick={() => {
                      handleClosePopup();
                      navigate(resolvePathWithLocale('/contact'));
                    }}
                    className="w-full sm:w-auto bg-[var(--color-brand-dark)] text-white font-bold text-sm py-3.5 px-8 rounded-xl shadow-lg shadow-slate-900/20 hover:-translate-y-1 hover:shadow-slate-900/30 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                  >
                    {t('GuestHome.recruitmentPopup.cta', 'Ứng tuyển ngay')}
                    <ChevronRight
                      size={18}
                      strokeWidth={3}
                      className="group-hover:translate-x-1.5 transition-transform"
                    />
                  </button>

                  <button
                    onClick={handleClosePopup}
                    className="w-full sm:w-auto text-gray-500 font-bold text-sm py-3.5 px-6 rounded-xl hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    {t('GuestHome.recruitmentPopup.close', 'Để sau')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
