import { Link } from 'react-router-dom';
import { Settings2, Wrench, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function MaintenancePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
      <Header />

      <main className="relative overflow-hidden px-6 pb-20 pt-24">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
        </div>

        <section className="relative mx-auto grid w-full max-w-6xl gap-10 rounded-3xl border border-(--border-color) bg-white/70 p-8 shadow-2xl backdrop-blur-sm dark:bg-slate-900/70 md:grid-cols-2 md:p-12">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200">
              <Settings2 className="h-3.5 w-3.5" />
              {t('GuestMaintenance.badge')}
            </span>

            <h1 className="text-4xl font-black leading-tight text-brand md:text-5xl">
              {t('GuestMaintenance.title')}
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-(--text-secondary)">
              {t('GuestMaintenance.description')}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                {t('GuestMaintenance.primaryCta')}
              </Link>
              <Link
                to="/status"
                className="inline-flex items-center rounded-xl border border-(--border-color) bg-(--bg-secondary) px-5 py-3 text-sm font-semibold text-(--text-primary) transition hover:bg-white dark:hover:bg-slate-800"
              >
                {t('GuestMaintenance.secondaryCta')}
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5 dark:border-cyan-900 dark:bg-cyan-950/30">
              <div className="mb-2 flex items-center gap-2 text-cyan-700 dark:text-cyan-200">
                <Wrench className="h-4 w-4" />
                <p className="text-sm font-semibold">
                  {t('GuestMaintenance.card1.title')}
                </p>
              </div>
              <p className="text-sm text-(--text-secondary)">
                {t('GuestMaintenance.card1.description')}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">
                  {t('GuestMaintenance.card2.title')}
                </p>
              </div>
              <p className="text-sm text-(--text-secondary)">
                {t('GuestMaintenance.card2.description')}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
