import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

/**
 * Renders the Doctor Lottie animation fetched from the public folder.
 * Kept as a separate component so doctors.tsx doesn't need extra state/effect hooks.
 */
export default function DoctorLottie() {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch('/animations/Doctor.json')
      .then((res) => res.json())
      .then((data: object) => setAnimationData(data))
      .catch(() => {
        // silently fail — animation is decorative
      });
  }, []);

  if (!animationData) return null;

  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      className="w-full h-full"
    />
  );
}
