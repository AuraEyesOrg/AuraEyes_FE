import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, CheckCircle, Home, ChevronRight } from 'lucide-react';
import { QuotaBadge } from './index';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

type Step = 'upload' | 'analysis' | 'review';

interface FocusModeLayoutProps {
  children: ReactNode;
  currentStep: Step;
  title?: string;
  onExit?: () => void;
  exitPath?: string;
  showBreadcrumb?: boolean;
  breadcrumbItems?: { label: string; path?: string }[];
}

export default function FocusModeLayout({
  children,
  currentStep,
  title,
  onExit,
  exitPath = '/patient/screening',
  showBreadcrumb = true,
  breadcrumbItems,
}: FocusModeLayoutProps) {
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const steps: { key: Step; label: string; number: number }[] = [
    {
      key: 'upload',
      label: t('FocusModeLayout.steps.upload', 'Upload & Validate'),
      number: 1,
    },
    {
      key: 'analysis',
      label: t('FocusModeLayout.steps.analysis', 'Analysis'),
      number: 2,
    },
    {
      key: 'review',
      label: t('FocusModeLayout.steps.review', 'Review'),
      number: 3,
    },
  ];
  const resolvedBreadcrumbItems: { label: string; path?: string }[] =
    showBreadcrumb
      ? (breadcrumbItems?.length ?? 0) > 0
        ? (breadcrumbItems ?? [])
        : [
            {
              label: t('FocusModeLayout.breadcrumb.home', 'Home'),
              path: '/patient/dashboard',
            },
            {
              label: t(
                'FocusModeLayout.breadcrumb.newScreening',
                'New Screening'
              ),
            },
          ]
      : [];

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate(exitPath);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[var(--bg-primary)]">
      {/* Focus Mode Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        <div className="px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Exit Button + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleExit}
                className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {title && (
                <h1 className="text-lg font-bold text-[var(--text-primary)]">
                  {title}
                </h1>
              )}
            </div>

            {/* Center: Step Progress */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative flex items-center justify-between">
                {/* Progress Line Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--border-color)] -z-10 rounded-full" />

                {/* Progress Line Filled */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand -z-10 rounded-full transition-all duration-500"
                  style={{
                    width: `${(steps.findIndex((s) => s.key === currentStep) / (steps.length - 1)) * 100}%`,
                  }}
                />

                {steps.map((step, index) => {
                  const currentIndex = steps.findIndex(
                    (s) => s.key === currentStep
                  );
                  const isCompleted = currentIndex > index;
                  const isCurrent = step.key === currentStep;
                  const isPending = currentIndex < index;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ring-4 ring-[var(--bg-primary)] transition-all ${
                          isCompleted
                            ? 'bg-brand text-white'
                            : isCurrent
                              ? 'bg-brand text-white relative'
                              : 'bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">
                            {step.number}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="absolute -inset-1 rounded-full border border-brand animate-ping opacity-30" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                          isCurrent
                            ? 'text-[var(--text-primary)]'
                            : isPending
                              ? 'text-[var(--text-muted)]'
                              : 'text-brand'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Quota Badge */}
            <div className="flex justify-end w-32">
              <QuotaBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      {showBreadcrumb && (
        <nav className="px-6 lg:px-10 py-3 border-b border-[var(--border-color)]/50">
          <ol className="flex items-center space-x-2 text-sm">
            {resolvedBreadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-[var(--border-color)]" />
                )}
                {item.path ? (
                  <Link
                    to={item.path}
                    className="text-[var(--text-secondary)] hover:text-brand transition-colors flex items-center gap-1"
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-bold text-brand">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Main Content - Full width, no sidebar */}
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
