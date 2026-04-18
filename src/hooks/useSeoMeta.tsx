import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import React from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

export const SEO_CONSTANTS = {
  SITE_NAME: 'AURA',
  SITE_TITLE_SUFFIX: 'AURA — AI Retinal Health Screening',
  BASE_URL: 'https://web.auraeyes.site',
  DEFAULT_OG_IMAGE: 'https://web.auraeyes.site/icon_512x512.png',
  DEFAULT_DESCRIPTION:
    'Precision AI for retinal vascular health screening. Automated diagnostics with 99.2% clinical accuracy. Connect with verified ophthalmologists and book screenings instantly.',
  TWITTER_HANDLE: '@AuraEyes',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeoMetaProps {
  /**
   * Page title — formatted as "{title} | AURA"
   * Omit to use the full default site title
   */
  title?: string;
  /** Meta description — ideally 120–155 characters for best SERP display */
  description?: string;
  /** Canonical URL — full absolute URL, no trailing slash */
  canonical?: string;
  /** OG/Twitter image — should be at least 1200×630px */
  ogImage?: string;
  /**
   * Set true for any private/authenticated page to prevent search indexing.
   * PrivateRoute automatically injects noindex — no need to set manually there.
   */
  noIndex?: boolean;
  /**
   * JSON-LD structured data. Accepts a single schema object or an array.
   * Will be serialised into a <script type="application/ld+json"> tag.
   */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  /** Current page locale — drives og:locale (vi → vi_VN, en → en_US) */
  locale?: 'vi' | 'en';
  /** og:type — defaults to 'website' */
  ogType?: string;
}

// ─── SeoMeta Component ────────────────────────────────────────────────────────

/**
 * SeoMeta — Per-page SEO metadata component.
 *
 * Injects dynamic <title>, <meta description>, Open Graph, Twitter Card,
 * canonical, robots, and JSON-LD into <head> via react-helmet-async.
 *
 * @example
 * <SeoMeta
 *   title="How It Works"
 *   description="Learn how AURA AI screening works in 3 simple steps."
 *   canonical="https://web.auraeyes.site/en/how-it-works"
 *   structuredData={{ '@type': 'HowTo', ... }}
 * />
 */
export function SeoMeta({
  title,
  description = SEO_CONSTANTS.DEFAULT_DESCRIPTION,
  canonical,
  ogImage = SEO_CONSTANTS.DEFAULT_OG_IMAGE,
  noIndex = false,
  structuredData,
  locale = 'vi',
  ogType = 'website',
}: SeoMetaProps) {
  const formattedTitle = title
    ? `${title} | ${SEO_CONSTANTS.SITE_NAME}`
    : SEO_CONSTANTS.SITE_TITLE_SUFFIX;

  const ogLocale = locale === 'en' ? 'en_US' : 'vi_VN';
  const ogLocaleAlternate = locale === 'en' ? 'vi_VN' : 'en_US';
  const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';

  const jsonLdString = structuredData
    ? JSON.stringify(structuredData, null, 0)
    : null;

  return (
    <Helmet>
      {/* ── Primary ─────────────────────────────── */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <meta name="author" content="AURA Team" />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* ── Open Graph ──────────────────────────── */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:site_name" content={SEO_CONSTANTS.SITE_NAME} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={ogLocaleAlternate} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* ── Twitter Card ────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO_CONSTANTS.TWITTER_HANDLE} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ── JSON-LD Structured Data ─────────────── */}
      {jsonLdString && (
        <script type="application/ld+json">{jsonLdString}</script>
      )}
    </Helmet>
  );
}

// ─── NoIndexMeta Component ────────────────────────────────────────────────────

/**
 * NoIndexMeta — Prevents private/authenticated pages from being indexed.
 * Automatically injected by PrivateRoute — no manual usage needed.
 */
export function NoIndexMeta() {
  return (
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
}

// ─── useSeoMeta Hook (convenience wrapper) ────────────────────────────────────

/**
 * useSeoMeta — React hook that updates document.title immediately (before
 * Helmet hydrates) and returns SeoMeta props for use in JSX.
 *
 * @example
 * const seoProps = useSeoMeta({ title: 'Home', description: '...' });
 * return (
 *   <>
 *     <SeoMeta {...seoProps} />
 *     <main>...</main>
 *   </>
 * );
 */
export function useSeoMeta(props: SeoMetaProps = {}): SeoMetaProps {
  const { title } = props;
  const formattedTitle = title
    ? `${title} | ${SEO_CONSTANTS.SITE_NAME}`
    : SEO_CONSTANTS.SITE_TITLE_SUFFIX;

  // Fast-path: update document.title synchronously before Helmet hydrates
  useEffect(() => {
    document.title = formattedTitle;
  }, [formattedTitle]);

  return props;
}
