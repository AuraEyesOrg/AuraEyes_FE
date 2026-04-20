import type { ReactElement } from 'react';

type ComplexityLevel = 'basic' | 'moderate' | 'advanced';

interface GuestPageContextBarProps {
  currentLabel: string;
  readingTimeMinutes?: number;
  complexity?: ComplexityLevel;
  sourceLabel?: string;
  className?: string;
}

export const GuestPageContextBar = (
  _props: GuestPageContextBarProps
): ReactElement | null => {
  return null;
};

export default GuestPageContextBar;
