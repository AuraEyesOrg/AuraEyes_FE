import { useMemo, useState } from 'react';

interface AvatarFallbackProps {
  fullName: string;
  avatarUrl?: string | null;
  size?: string;
  className?: string;
}

const BACKGROUNDS = [
  'bg-sky-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
];

function getLastWordInitial(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const lastWord = parts[parts.length - 1] ?? '?';
  return lastWord.charAt(0).toUpperCase() || '?';
}

function getBackground(fullName: string): string {
  let hash = 0;
  for (let index = 0; index < fullName.length; index++) {
    hash = fullName.charCodeAt(index) + ((hash << 5) - hash);
  }

  return BACKGROUNDS[Math.abs(hash) % BACKGROUNDS.length];
}

export default function AvatarFallback({
  fullName,
  avatarUrl,
  size = 'w-10 h-10',
  className = '',
}: AvatarFallbackProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const initial = useMemo(() => getLastWordInitial(fullName), [fullName]);
  const background = useMemo(() => getBackground(fullName), [fullName]);

  if (avatarUrl && !hasImageError) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className={`${size} rounded-full object-cover ${className}`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${size} ${background} rounded-full flex items-center justify-center text-white font-bold ${className}`}
      aria-label={fullName}
      title={fullName}
    >
      {initial}
    </div>
  );
}
