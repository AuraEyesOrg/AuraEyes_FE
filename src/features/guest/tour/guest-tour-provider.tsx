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

  const steps = useMemo(
    () =>
      buildGuestTourSteps({
        logo: t('GuestTour.steps.logo', {
          defaultValue:
            'Nhan vao logo de quay ve Trang chu bat cu luc nao trong hanh trinh su dung AURA.',
        }),
        navAbout: t('GuestTour.steps.navAbout', {
          defaultValue:
            'Muc Ve chung toi gioi thieu su menh cua AURA va gia tri cot loi trong sang loc benh ly nhan khoa bang AI.',
        }),
        navHowItWorks: t('GuestTour.steps.navHowItWorks', {
          defaultValue:
            'Tai Cach hoat dong, ban co the xem quy trinh tu tai anh day mat den bao cao ket qua AI.',
        }),
        aboutMission: t('GuestTour.steps.aboutMission', {
          defaultValue:
            'Day la khu vuc tom tat su menh va chuc nang chinh cua nen tang AURA: sang loc nhanh, chinh xac va an toan.',
        }),
        contactOrganisation: t('GuestTour.steps.contactOrganisation', {
          defaultValue:
            'Muc Lien he la noi cac phong kham va to chuc y te dang ky hop tac hoac nhan tu van onboarding.',
        }),
        getStartedPatient: t('GuestTour.steps.getStartedPatient', {
          defaultValue:
            'Nut Get Started dan den trang dang nhap/dang ky, noi benh nhan co the tao tai khoan Patient moi.',
        }),
        getStartedDoctor: t('GuestTour.steps.getStartedDoctor', {
          defaultValue:
            'Cung tu Get Started, bac si co the di den nhanh den luong dang ky Ophthalmologist de tham gia nen tang.',
        }),
      }),
    [t]
  );

  const markTourSeen = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(GUEST_TOUR_STORAGE_KEY, 'true');
  }, []);

  const hasSeenTour = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(GUEST_TOUR_STORAGE_KEY) === 'true';
  }, []);

  useEffect(() => {
    if (!isGuestHome || manualStartPending || hasSeenTour()) return;

    setStepIndex(0);
    setRun(true);
  }, [hasSeenTour, isGuestHome, manualStartPending]);

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
    <GuestTourContext.Provider value={{ startTourFromHelp }}>
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
              back: t('GuestTour.controls.back', { defaultValue: 'Quay lai' }),
              close: t('GuestTour.controls.close', { defaultValue: 'Dong' }),
              last: t('GuestTour.controls.last', { defaultValue: 'Hoan tat' }),
              next: t('GuestTour.controls.next', { defaultValue: 'Tiep theo' }),
              skip: t('GuestTour.controls.skip', { defaultValue: 'Bo qua' }),
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
    };
  }

  return context;
};
