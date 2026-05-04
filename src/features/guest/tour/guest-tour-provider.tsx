import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Joyride } from 'react-joyride';
import type { Controls, EventData } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  stripLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { buildGuestTourSteps } from './guest-tour-steps';

const GUEST_TOUR_STORAGE_KEY = 'aura_guest_tour_seen_v1';

interface GuestTourContextValue {
  startTourFromHelp: () => void;
  setTourBlocked: (blocked: boolean) => void;
}

const GuestTourContext = createContext<GuestTourContextValue | null>(null);

interface GuestTourProviderProps {
  children: ReactNode;
}

export const GuestTourProvider = ({ children }: GuestTourProviderProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const isGuestHome = stripLocaleFromPathname(location.pathname) === '/';

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [manualStartPending, setManualStartPending] = useState(false);
  const [joyrideDisabled, setJoyrideDisabled] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const steps = useMemo(() => {
    const messages = {
      logo: t('GuestTour.steps.logo' as any) as string,
      navAbout: t('GuestTour.steps.navAbout' as any) as string,
      navHowItWorks: t('GuestTour.steps.navHowItWorks' as any) as string,
      navEthics: t('GuestTour.steps.navEthics' as any) as string,
      navContact: t('GuestTour.steps.navContact' as any) as string,
      bookAppointment: t('GuestTour.steps.bookAppointment' as any) as string,
      patientPortalLogin: t(
        'GuestTour.steps.patientPortalLogin' as any
      ) as string,
    };
    return buildGuestTourSteps(messages);
  }, [t]);

  const markTourSeen = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(GUEST_TOUR_STORAGE_KEY, 'true');
  }, []);

  const hasSeenTour = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(GUEST_TOUR_STORAGE_KEY) === 'true';
  }, []);

  useEffect(() => {
    if (!isGuestHome || manualStartPending || hasSeenTour() || isBlocked)
      return;

    // Small delay to allow child components to set blocking state
    const timer = setTimeout(() => {
      if (isBlocked) return;
      setStepIndex(0);
      setRun(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [hasSeenTour, isGuestHome, manualStartPending, isBlocked]);

  useEffect(() => {
    if (!isGuestHome || !manualStartPending) return;

    const timer = window.setTimeout(() => {
      setStepIndex(0);
      setRun(true);
      setManualStartPending(false);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [isGuestHome, manualStartPending]);

  useEffect(() => {
    if (!run) return;

    const timer = window.setTimeout(() => {
      const currentStep = steps[stepIndex];
      if (!currentStep || typeof currentStep.target !== 'string') return;

      if (!document.querySelector(currentStep.target)) {
        setRun(false);
      }
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [run, stepIndex, steps]);

  const handleEvent = useCallback(
    (data: EventData, _controls: Controls) => {
      const { status, index, type } = data;

      if (status === 'finished' || status === 'skipped') {
        setRun(false);
        setStepIndex(0);
        markTourSeen();
        return;
      }

      if (type === 'step:after') {
        setStepIndex(index + 1);
      }
    },
    [markTourSeen]
  );

  const startTourFromHelp = useCallback(() => {
    if (joyrideDisabled) return;

    if (!isGuestHome) {
      setManualStartPending(true);
      navigate(withLocalePathname(locale));
      return;
    }

    setStepIndex(0);
    setRun(true);
  }, [isGuestHome, joyrideDisabled, locale, navigate]);

  const handleJoyrideError = useCallback((error: unknown) => {
    console.error('Guest tour disabled due to Joyride runtime error:', error);
    setRun(false);
    setManualStartPending(false);
    setJoyrideDisabled(true);
  }, []);

  return (
    <GuestTourContext.Provider
      value={{ startTourFromHelp, setTourBlocked: setIsBlocked }}
    >
      {children}
      {!joyrideDisabled && (
        <ErrorBoundary fallback={null} onError={handleJoyrideError}>
          <Joyride
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            onEvent={handleEvent}
            continuous
            scrollToFirstStep
            options={{
              primaryColor: '#00d1c0',
              zIndex: 12000,
              arrowColor: '#ffffff',
              backgroundColor: '#ffffff',
              textColor: '#0f172a',
              showProgress: true,
              spotlightRadius: 18,
              overlayColor: 'rgba(15, 23, 42, 0.55)',
              buttons: ['back', 'close', 'primary', 'skip'],
            }}
            locale={{
              back: t('GuestTour.controls.back', { defaultValue: 'Quay lại' }),
              close: t('GuestTour.controls.close', { defaultValue: 'Đóng' }),
              last: t('GuestTour.controls.last', { defaultValue: 'Hoàn tất' }),
              next: t('GuestTour.controls.next', { defaultValue: 'Tiếp theo' }),
              skip: t('GuestTour.controls.skip', { defaultValue: 'Bỏ qua' }),
            }}
            styles={{
              tooltip: {
                borderRadius: 16,
                padding: 20,
                fontSize: 14,
              },
              tooltipContent: {
                padding: '12px 4px',
              },
              buttonPrimary: {
                borderRadius: 10,
                padding: '8px 18px',
                fontWeight: 700,
              },
              buttonBack: {
                borderRadius: 10,
                padding: '8px 14px',
                color: '#64748b',
                fontWeight: 600,
              },
              buttonSkip: {
                color: '#94a3b8',
                fontWeight: 600,
              },
            }}
          />
        </ErrorBoundary>
      )}
    </GuestTourContext.Provider>
  );
};

export const useGuestTour = (): GuestTourContextValue => {
  const context = useContext(GuestTourContext);

  if (!context) {
    return {
      startTourFromHelp: () => {},
      setTourBlocked: () => {},
    };
  }

  return context;
};
