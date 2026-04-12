import { useState } from 'react';
import { resolveAvatarUrl } from '@/lib/user-avatar';

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'AU';

const AvatarBadge = ({
  name,
  avatarUrl,
  size = 'md',
}: {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const safeAvatarUrl = resolveAvatarUrl(avatarUrl);

  const sizeClass =
    size === 'sm'
      ? 'h-9 w-9 text-xs'
      : size === 'lg'
        ? 'h-16 w-16 text-lg'
        : 'h-11 w-11 text-sm';

  if (safeAvatarUrl && !hasImageError) {
    return (
      <img
        src={safeAvatarUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shadow-sm ring-1 ring-slate-200/70`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-cyan-500 to-sky-500 font-semibold text-white shadow-sm`}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

export default AvatarBadge;
