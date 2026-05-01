import { useState, useEffect, useMemo } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface ConsiliumTimerProps {
  createdAt: string;
  isConcluded: boolean;
  onExpire?: () => void;
}

export default function ConsiliumTimer({
  createdAt,
  isConcluded,
  onExpire,
}: ConsiliumTimerProps) {
  const { t } = useSafeTranslation();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const createdDate = useMemo(() => new Date(createdAt), [createdAt]);
  const expiryDate = useMemo(
    () => new Date(createdDate.getTime() + 20 * 60 * 1000),
    [createdDate]
  );

  useEffect(() => {
    if (isConcluded) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();
      return Math.max(0, difference);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate, isConcluded, onExpire]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isCritical = timeLeft < 5 * 60 * 1000; // Less than 5 minutes

  if (isConcluded) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">
        <Clock className="w-3.5 h-3.5" />
        {t(
          'ProfessionalNetwork.collaboration.consilium.concluded',
          'Hội chẩn đã kết thúc'
        )}
      </div>
    );
  }

  if (timeLeft === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800">
        <AlertTriangle className="w-3.5 h-3.5" />
        {t(
          'ProfessionalNetwork.collaboration.consilium.expired',
          'Đã hết hạn 20 phút'
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
        isCritical
          ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-200 dark:border-rose-800 animate-pulse'
          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span className="tabular-nums">
        {t(
          'ProfessionalNetwork.collaboration.consilium.timeLeft',
          'Thời gian còn lại:'
        )}{' '}
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}
