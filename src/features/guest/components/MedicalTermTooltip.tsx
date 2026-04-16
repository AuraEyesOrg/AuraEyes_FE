import clsx from 'clsx';
import { Info } from 'lucide-react';
import { useId, useState } from 'react';

interface MedicalTermTooltipProps {
  term: string;
  description: string;
  className?: string;
}

export const MedicalTermTooltip = ({
  term,
  description,
  className,
}: MedicalTermTooltipProps) => {
  const tooltipId = useId();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      className={clsx('group relative inline-flex align-baseline', className)}
      data-tooltip-open={isOpen}
    >
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
            event.currentTarget.blur();
          }
        }}
        className="guest-term-trigger inline-flex items-center gap-1 rounded-sm"
      >
        <span>{term}</span>
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <span id={tooltipId} role="tooltip" className="guest-term-tooltip">
        {description}
      </span>
    </span>
  );
};

export default MedicalTermTooltip;
