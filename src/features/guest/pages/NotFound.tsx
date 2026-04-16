import { Link, useLocation } from 'react-router-dom';
import { CircleAlert, Home, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import GuestPageContextBar from '../components/GuestPageContextBar';

export default function NotFoundPage() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
      <Header />
      <GuestPageContextBar
        currentLabel={t('GuestNotFound.badge')}
        readingTimeMinutes={1}
        complexity="basic"
      />

      <main className="relative overflow-hidden px-6 pb-20 pt-24">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-rose-300/25 blur-3xl" />
          <div className="absolute right-2 top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>

        <section
          className="relative mx-auto w-full max-w-4xl rounded-3xl border border-(--border-color) bg-white/70 p-8 text-center shadow-2xl backdrop-blur-sm dark:bg-slate-900/70 md:p-12"
          data-guest-reveal
        >
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            <CircleAlert className="h-3.5 w-3.5" />
            {t('GuestNotFound.badge')}
          </span>

          <h1 className="mt-6 text-5xl font-black tracking-tight text-brand md:text-6xl">
            {t('GuestNotFound.title')}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-(--text-secondary)">
            {t('GuestNotFound.description')}
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-(--text-secondary)">
            {t('GuestEnhancements.subheadings.notFound')}
          </p>

          <div className="mx-auto mt-4 w-full max-w-2xl rounded-xl border border-(--border-color) bg-(--bg-secondary) px-4 py-3 text-left text-sm text-(--text-secondary)">
            <p className="font-semibold text-(--text-primary)">
              {t('GuestNotFound.requestedPath')}
            </p>
            <p className="mt-1 break-all">{location.pathname}</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={resolvePathWithLocale('/')}
              className="inline-flex min-h-12 flex-col items-start rounded-xl bg-brand px-5 py-2 text-left text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              <span className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                {t('GuestNotFound.primaryCta')}
              </span>
              <span className="guest-cta-subtext">
                {t('GuestEnhancements.ctaSubtext.quickAction')}
              </span>
            </Link>

            <Link
              to={resolvePathWithLocale('/about')}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border-color) bg-(--bg-secondary) px-5 py-3 text-sm font-semibold text-(--text-primary) transition hover:bg-white dark:hover:bg-slate-800"
            >
              <Compass className="h-4 w-4" />
              {t('GuestNotFound.secondaryCta')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
