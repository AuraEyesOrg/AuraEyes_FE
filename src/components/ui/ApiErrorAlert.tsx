import { AlertCircle } from 'lucide-react';
import { extractApiErrorMessage } from '@/lib/api-error';

interface ApiErrorAlertProps {
  error: any;
  defaultMessage?: string;
  className?: string;
}

export default function ApiErrorAlert({
  error,
  defaultMessage = 'An error occurred',
  className = '',
}: ApiErrorAlertProps) {
  if (!error) return null;

  const errorMessage = extractApiErrorMessage(error, defaultMessage);

  return (
    <div
      className={`flex items-start gap-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 ${className}`}
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-medium">Error:</span> {errorMessage}
      </div>
    </div>
  );
}
