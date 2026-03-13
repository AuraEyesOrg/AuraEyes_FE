import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (nextValue: number) => void;
  disabled?: boolean;
}

export const StarRatingInput = ({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) => {
  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const selected = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star`}
            disabled={disabled}
            onClick={() => onChange(starValue)}
            className="rounded-md p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                selected
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRatingInput;
