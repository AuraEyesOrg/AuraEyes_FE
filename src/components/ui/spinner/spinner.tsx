import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface SpinnerProps {
  size?: number;
  src?: string;
  className?: string;
}

const DEFAULT_SRC = '/animations/eye_scanner.json';

export default function Spinner({
  size = 24,
  src = DEFAULT_SRC,
  className = '',
}: SpinnerProps) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <DotLottieReact src={src} loop autoplay />
    </div>
  );
}
