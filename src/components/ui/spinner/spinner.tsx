interface SpinnerProps {
  size?: number;
  src?: string;
  className?: string;
}

const DEFAULT_SRC = '/animations/eye_scanner.json';

export default function Spinner({
  size = 24,
  src: _src = DEFAULT_SRC,
  className = '',
}: SpinnerProps) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="h-full w-full animate-spin rounded-full border-2 border-current border-t-transparent text-cyan-600 dark:text-cyan-400" />
    </div>
  );
}
