import { useEffect, useState } from 'react';

const clampProgress = (value: number) => {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
};

export const GuestScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const scrollRange =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollRange <= 0) {
        setProgress(0);
        return;
      }

      const nextProgress = (scrollTop / scrollRange) * 100;
      setProgress(clampProgress(nextProgress));
    };

    updateProgress();

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-16 z-40">
      <div className="mx-auto h-0.5 w-full max-w-[1280px] overflow-hidden bg-transparent px-6 lg:px-10">
        <div
          className="guest-scroll-progress h-full origin-left"
          style={{ transform: `scaleX(${progress / 100})` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default GuestScrollProgress;
