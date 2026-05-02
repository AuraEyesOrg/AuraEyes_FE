import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import useAuthStore from '@/store/auth-store';

const LOGO_SRCSET = [
  '/icon_16x16.png 16w',
  '/icon_32x32.png 32w',
  '/icon_48x48.png 48w',
  '/icon_64x64.png 64w',
  '/icon_128x128.png 128w',
  '/icon_256x256.png 256w',
].join(', ');

interface AuraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
  to?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
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

// variant 'light' = logo dùng trên nền tối → khuếch đại sáng để logo hiện rõ
// variant 'dark'  = logo dùng trên nền trắng → giữ nguyên màu gốc
const logoFilter: Record<'light' | 'dark', string> = {
  light: 'brightness(2)',
  dark: 'none',
};

export function AuraLogo({
  size = 'md',
  showText = true,
  subtitle,
  to,
  className = '',
  variant = 'auto',
}: AuraLogoProps) {
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardPath = () => {
    if (!isAuthenticated || !user) return '/';

    const roles = user.roles || [];

    if (roles.includes('SystemAdmin')) return '/system-admin/dashboard';
    if (roles.includes('Ophthalmologist')) return '/ophthalmologist/dashboard';
    if (roles.includes('ClinicStaff')) return '/clinic-staff/dashboard';
    if (roles.includes('OrgAdmin') || roles.includes('Organization'))
      return '/organisation/dashboard';
    if (roles.includes('Patient')) return '/patient/dashboard';

    return '/';
  };

  const finalTo = to ?? getDashboardPath();
  const resolvedVariant: 'light' | 'dark' =
    variant === 'auto' ? (theme === 'dark' ? 'light' : 'dark') : variant;

  const s = sizeMap[size];
  const textColor =
    resolvedVariant === 'light' ? 'text-white' : 'text-gray-900';
  const subtitleColor =
    resolvedVariant === 'light' ? 'text-gray-400' : 'text-gray-500';

  const content = (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <img
        src="/logo.png"
        srcSet={LOGO_SRCSET}
        sizes={s.sizes}
        alt="AURA"
        className={`${s.icon} object-contain`}
        style={{ filter: logoFilter[resolvedVariant] }}
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

  if (finalTo) {
    return (
      <Link
        to={finalTo}
        className="outline-none focus-visible:ring-2 focus-visible:ring-[#00d1c0] rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
