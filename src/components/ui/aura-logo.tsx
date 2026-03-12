import { Link } from 'react-router-dom';

const LOGO_SRCSET = [
  '/icon_16x16.png 16w',
  '/icon_32x32.png 32w',
  '/icon_48x48.png 48w',
  '/icon_64x64.png 64w',
  '/icon_96x96.png 96w',
  '/icon_128x128.png 128w',
  '/icon_256x256.png 256w',
].join(', ');

interface AuraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
  to?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

const sizeMap = {
  sm: {
    icon: 'w-12 h-12',
    text: 'text-lg',
    subtitle: 'text-[10px]',
    sizes: '32px',
  },
  md: {
    icon: 'w-14 h-14',
    text: 'text-xl',
    subtitle: 'text-xs',
    sizes: '40px',
  },
  lg: {
    icon: 'w-16 h-16',
    text: 'text-3xl',
    subtitle: 'text-sm',
    sizes: '56px',
  },
} as const;

const blendMap = {
  light: 'mix-blend-screen',
  dark: 'mix-blend-multiply',
} as const;

export function AuraLogo({
  size = 'md',
  showText = true,
  subtitle,
  to,
  className = '',
  variant = 'dark',
}: AuraLogoProps) {
  const s = sizeMap[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const subtitleColor = variant === 'light' ? 'text-gray-400' : 'text-gray-500';

  const content = (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <img
        src="/logo.png"
        srcSet={LOGO_SRCSET}
        sizes={s.sizes}
        alt="AURA"
        className={`${s.icon} object-contain ${blendMap[variant]}`}
        width={40}
        height={40}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`${s.text} font-bold tracking-tight ${textColor}`}>
            AURA
          </span>
          {subtitle && (
            <span className={`${s.subtitle} ${subtitleColor} leading-none`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="outline-none focus-visible:ring-2 focus-visible:ring-[#00d1c0] rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
