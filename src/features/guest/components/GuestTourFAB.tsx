import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGuestTour } from '../tour';

export const GuestTourFAB = () => {
  const { t } = useTranslation();
  const { startTourFromHelp } = useGuestTour();

  return (
    <button
      onClick={startTourFromHelp}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_30px_rgba(14,165,165,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand-primary)]"
      aria-label={t('Common.helpTour', { defaultValue: 'Hướng dẫn' })}
    >
      <HelpCircle className="h-6 w-6" />
    </button>
  );
};

export default GuestTourFAB;
