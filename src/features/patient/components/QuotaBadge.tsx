import { useState } from 'react';
import { Zap, Plus } from 'lucide-react';
import { useQuotaBalance } from '../hooks/use-quota';
import { TopUpQuotaModal } from './TopUpQuotaModal';

/**
 * QuotaBadge — Two-part UI: a read-only status pill + a separate "Mua thêm" action button.
 *
 * Status pill colors:
 * - Normal  (>1 left) : brand cyan
 * - Warning (= 1 left): risk-medium (amber)
 * - Exhausted (= 0)   : risk-high (red)
 *
 * The status pill is purely informational.
 * The "Mua thêm" button is the only buy trigger — always visible.
 */
export function QuotaBadge() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: quota, isLoading } = useQuotaBalance();

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] animate-pulse">
          <div className="w-3.5 h-3.5 rounded-full bg-[var(--border-color)]" />
          <div className="w-16 h-4 rounded bg-[var(--border-color)]" />
        </div>
        <div className="w-20 h-7 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
      </div>
    );
  }

  if (!quota) return null;

  const remaining = quota.remainingQuota;
  const total = quota.totalAiQuota;

  const getStatusStyle = (): { bg: string; text: string } => {
    if (remaining === 0)
      return { bg: 'bg-[var(--color-risk-high)]', text: 'text-white' };
    if (remaining === 1)
      return { bg: 'bg-[var(--color-risk-medium)]', text: 'text-white' };
    return { bg: 'bg-[var(--color-brand-primary)]', text: 'text-white' };
  };

  const { bg, text } = getStatusStyle();

  return (
    <>
      <div className="inline-flex items-center gap-2">
        {/* ── Status pill (read-only) ── */}
        <div
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium select-none whitespace-nowrap ${bg} ${text}`}
          title={
            remaining === 0
              ? 'Đã hết lượt AI trong hôm nay'
              : `Còn ${remaining}/${total} lượt AI`
          }
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span>
            {remaining === 0 ? 'Hết lượt' : `${remaining}/${total} lượt`}
          </span>
        </div>

        {/* ── Buy button (action) ── */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] text-xs font-semibold whitespace-nowrap hover:bg-[var(--color-brand-primary)] hover:text-white transition-all active:scale-95"
          title="Mua thêm lượt AI screening"
        >
          <Plus className="w-3 h-3 shrink-0" />
          Mua thêm
        </button>
      </div>

      <TopUpQuotaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentQuota={quota}
      />
    </>
  );
}
