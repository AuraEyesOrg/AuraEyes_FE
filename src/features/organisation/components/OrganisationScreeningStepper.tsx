import {
  CheckCircle2,
  Save,
  ScanEye,
  Upload,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

export type ScreeningFlowStep =
  | 'select-patient'
  | 'upload-images'
  | 'launch-ai'
  | 'review-save';

interface ScreeningFlowStepConfig {
  key: ScreeningFlowStep;
  label: string;
  icon: LucideIcon;
}

interface OrganisationScreeningStepperProps {
  activeStep: ScreeningFlowStep;
  className?: string;
}

export function OrganisationScreeningStepper({
  activeStep,
  className,
}: OrganisationScreeningStepperProps) {
  const { t } = useSafeTranslation();

  const screeningFlowSteps = useMemo<ScreeningFlowStepConfig[]>(
    () => [
      {
        key: 'select-patient',
        label: t(
          'Organisation.screening.stepper.selectPatient',
          'Patient Verification'
        ),
        icon: User,
      },
      {
        key: 'upload-images',
        label: t(
          'Organisation.screening.stepper.uploadImages',
          'Upload Images'
        ),
        icon: Upload,
      },
      {
        key: 'launch-ai',
        label: t('Organisation.screening.stepper.launchAi', 'Launch AI'),
        icon: ScanEye,
      },
      {
        key: 'review-save',
        label: t(
          'Organisation.screening.stepper.reviewAndSave',
          'Review & Save'
        ),
        icon: Save,
      },
    ],
    [t]
  );

  const currentIndex = screeningFlowSteps.findIndex(
    (step) => step.key === activeStep
  );
  const normalizedCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div
      className={`flex items-center w-full overflow-x-auto pb-1 ${className ?? ''}`}
    >
      {screeningFlowSteps.map((step, index) => {
        const isActive = index === normalizedCurrentIndex;
        const isCompleted = index < normalizedCurrentIndex;
        const StepIcon = step.icon;

        return (
          <div
            key={step.key}
            className="flex items-center flex-1 last:flex-none min-w-max"
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                isActive
                  ? 'bg-primary/5 border-primary shadow-sm text-primary'
                  : isCompleted
                    ? 'bg-(--bg-secondary) border-(--border-primary) text-(--text-secondary)'
                    : 'bg-(--bg-primary) border-(--border-primary) text-(--text-tertiary)'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-primary text-white'
                    : isCompleted
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <StepIcon className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                {step.label}
              </span>
            </div>
            {index < screeningFlowSteps.length - 1 && (
              <div
                className={`flex-1 mx-2 h-[2px] transition-all rounded-full ${
                  isCompleted ? 'bg-primary/30' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
