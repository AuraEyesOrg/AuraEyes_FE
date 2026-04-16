import clsx from 'clsx';
import { ShieldCheck } from 'lucide-react';

interface SourceVerificationTagProps {
  label: string;
  className?: string;
}

export const SourceVerificationTag = ({
  label,
  className,
}: SourceVerificationTagProps) => {
  return (
    <span
      className={clsx(
        'guest-source-tag inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.01em] sm:text-xs',
        className
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export default SourceVerificationTag;
