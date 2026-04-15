import { useState, type ButtonHTMLAttributes } from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> {
  onRefresh: () => void | Promise<unknown>;
  label?: string;
  isRefreshing?: boolean;
}

export function RefreshButton({
  onRefresh,
  label = 'Refresh',
  isRefreshing = false,
  disabled,
  className,
  ...props
}: RefreshButtonProps) {
  const [isRefreshingInternal, setIsRefreshingInternal] = useState(false);

  const busy = isRefreshing || isRefreshingInternal;

  const handleClick = async () => {
    if (busy) return;

    setIsRefreshingInternal(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshingInternal(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleClick();
      }}
      disabled={busy || disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-(--border-primary) text-sm font-semibold text-(--text-primary) hover:bg-(--bg-tertiary) disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${className ?? ''}`}
      {...props}
    >
      <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
      {label}
    </button>
  );
}
