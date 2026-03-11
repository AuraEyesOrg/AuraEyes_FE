import { useState } from 'react';
import { Zap } from 'lucide-react';
import { useQuotaBalance } from '../hooks/use-quota';
import { TopUpQuotaModal } from './TopUpQuotaModal';

/**
 * QuotaBadge — Compact badge showing remaining AI screening quota.
 *
 * Colors:
 * - Normal (>1 left): brand cyan
 * - Warning (1 left): risk-medium (amber)
 * - Exhausted (0 left): risk-high (red)
 *
 * Click opens TopUpQuotaModal.
 */
export function QuotaBadge() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: quota, isLoading } = useQuotaBalance();

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-200 animate-pulse">
        <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />
        <div className="w-16 h-4 rounded bg-gray-300" />
      </div>
    );
  }

  if (!quota) return null;

  const remaining = quota.remainingQuota;
  const total = quota.totalAiQuota;

  const getBadgeStyle = () => {
    if (remaining === 0)
      return {
        bg: 'bg-[var(--color-risk-high)]',
        text: 'text-white',
      };
    if (remaining === 1)
      return {
        bg: 'bg-[var(--color-risk-medium)]',
        text: 'text-white',
      };
    return {
      bg: 'bg-[var(--color-brand-primary)]',
      text: 'text-white',
    };
  };

  const style = getBadgeStyle();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${style.bg} ${style.text} text-sm font-medium cursor-pointer hover:brightness-110 transition-all active:scale-95`}
        title={
          remaining === 0
            ? 'Hết lượt AI — Nhấn để mua thêm'
            : `Còn ${remaining}/${total} lượt AI`
        }
      >
        <Zap className="w-3.5 h-3.5" />
        <span>
          {remaining === 0 ? 'Hết lượt' : `Còn ${remaining}/${total} lượt`}
        </span>
      </button>

      <TopUpQuotaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentQuota={quota}
      />
    </>
  );
}
