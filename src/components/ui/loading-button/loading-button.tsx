import { Loader2 } from 'lucide-react';

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Controlled loading state — button auto-disables and shows spinner */
  isLoading?: boolean;
  /** Alias for isLoading, matching TanStack Query naming (isPending) */
  isPending?: boolean;
  children: React.ReactNode;
}

/**
 * LoadingButton — Global submit/action button with built-in loading state.
 *
 * • Accepts `isLoading` OR `isPending` (TanStack Query alias).
 * • When loading: shows inline Loader2 spinner, auto-disables.
 * • Inherits all native button props — apply your own className for styling.
 * • Does NOT impose a default visual style, so it works with any button variant
 *   (btn-primary, btn-secondary, custom classes from the design system, etc.)
 *
 * @example
 * <LoadingButton
 *   isPending={createPost.isPending}
 *   disabled={!content.trim()}
 *   className="btn-primary py-2 px-5 text-[15px]"
 * >
 *   Post
 * </LoadingButton>
 */
export function LoadingButton({
  isLoading,
  isPending,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  const busy = isLoading || isPending;

  return (
    <button
      type="button"
      disabled={busy || disabled}
      className={`inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ''}`}
      {...props}
    >
      {busy && (
        <Loader2
          className="w-4 h-4 animate-spin flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
