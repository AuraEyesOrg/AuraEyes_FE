/**
 * Status Badge Component
 * Displays status indicators with appropriate colors
 */

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'processing';
  label: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyles()} ${className}`}
    >
      {label}
    </span>
  );
};

export interface RiskBadgeProps {
  risk: 'low' | 'medium' | 'high' | 'critical';
  label?: string;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  risk,
  label,
  className = '',
}) => {
  const getRiskStyles = () => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const riskLabel = label || risk.charAt(0).toUpperCase() + risk.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getRiskStyles()} ${className}`}
    >
      {riskLabel}
    </span>
  );
};

export default StatusBadge;
