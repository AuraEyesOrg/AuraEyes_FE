import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchTrustedAvatars } from '../api/guest.api';
import { InitialsAvatar } from '@/features/professional-network/components/professional/InitialsAvatar';

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) return;

    let startTime: number;
    const duration = 3000;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 5);

      setDisplayValue(Math.floor(easeOut * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
};

export const GuestTrustedBy = () => {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['guest-trusted-avatars'],
    queryFn: fetchTrustedAvatars,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading || !data || data.count === 0) {
    return <div className="h-10" aria-hidden="true" />;
  }

  const { count, avatars } = data;

  const remainingCount = Math.max(0, count - avatars.length);

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3 rtl:space-x-reverse">
        {avatars.map((url, i) => (
          <div
            key={i}
            className="relative z-10 flex-shrink-0 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden"
            style={{ zIndex: 10 - i }}
          >
            <InitialsAvatar
              fullName={`Doctor ${i + 1}`}
              avatarUrl={url}
              size="md"
            />
          </div>
        ))}

        {remainingCount > 0 && (
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-[#3182ce] text-white text-xs font-bold leading-none shadow-sm"
            style={{ zIndex: 0 }}
            title={`Và ${remainingCount} người dùng khác`}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      <div className="flex flex-col text-sm text-slate-600 dark:text-slate-300">
        <span className="font-medium whitespace-nowrap">
          {t('GuestEnhancements.trustedByPrefix', { defaultValue: 'Hơn' })}{' '}
          <AnimatedCounter value={count} />{' '}
          {t('GuestEnhancements.trustedBySuffix', {
            defaultValue: 'chuyên gia và người dùng đồng hành',
          })}
        </span>
      </div>
    </div>
  );
};

export default GuestTrustedBy;
