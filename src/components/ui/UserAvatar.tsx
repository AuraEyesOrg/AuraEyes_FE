import { useMemo, useState } from 'react';
import { getItem } from '@/lib/local-storage';
import { getUserAvatarMeta, resolveAvatarUrl } from '@/lib/user-avatar';
import type { AuthUser } from '@/store/auth-store';

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

type AvatarSize = keyof typeof SIZE_CLASSES;

type StoredUserAvatar = Pick<AuthUser, 'avatarUrl'>;

function readStoredAvatar(storageKey: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const storedUser = getItem<StoredUserAvatar>(storageKey);
  return resolveAvatarUrl(storedUser?.avatarUrl);
}

interface UserAvatarProps {
  fullName?: string | null;
  avatarUrl?: string | null;
  fallbackName?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  useStoredAvatarFallback?: boolean;
  storageKey?: string;
}

export default function UserAvatar({
  fullName,
  avatarUrl,
  fallbackName = 'User',
  alt,
  size = 'md',
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  useStoredAvatarFallback = true,
  storageKey = 'user',
}: UserAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);

  const avatarMeta = useMemo(
    () => getUserAvatarMeta(fullName, fallbackName),
    [fallbackName, fullName]
  );

  const storedAvatarUrl = useMemo(
    () => (useStoredAvatarFallback ? readStoredAvatar(storageKey) : undefined),
    [storageKey, useStoredAvatarFallback]
  );

  const resolvedAvatarUrl = resolveAvatarUrl(avatarUrl, storedAvatarUrl);
  const sizeClass = SIZE_CLASSES[size];
  const resolvedAlt = alt ?? avatarMeta.displayName;

  if (resolvedAvatarUrl && !hasImageError) {
    return (
      <img
        src={resolvedAvatarUrl}
        alt={resolvedAlt}
        className={`${sizeClass} rounded-full object-cover ${className} ${imageClassName}`.trim()}
        referrerPolicy="no-referrer"
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold ${className} ${fallbackClassName}`.trim()}
      aria-label={resolvedAlt}
      title={resolvedAlt}
    >
      {avatarMeta.initials}
    </div>
  );
}
