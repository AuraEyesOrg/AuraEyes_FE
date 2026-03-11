/**
 * InitialsAvatar Component
 * Renders a colored circle with the user's initials when no avatarUrl is available.
 */

interface InitialsAvatarProps {
  fullName: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-[13px]',
  lg: 'w-12 h-12 text-[15px]',
  xl: 'w-32 h-32 text-4xl',
};

// Deterministic background color from name hash
const COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-rose-500',
  'bg-indigo-500',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function InitialsAvatar({
  fullName,
  avatarUrl,
  size = 'md',
  className = '',
}: InitialsAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const baseClass = `rounded-full object-cover ${sizeClass} ${className}`;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className={baseClass}
        onError={(e) => {
          // If image fails to load, hide it so the parent can show a fallback
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  const bg = getColorFromName(fullName);
  const initials = getInitials(fullName);

  return (
    <div
      className={`${sizeClass} ${bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      aria-label={fullName}
      title={fullName}
    >
      {initials}
    </div>
  );
}
