import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { LoadingButton } from '@/components/ui/loading-button/loading-button';
import { useBuyQuota } from '../hooks/use-quota';
import type { QuotaBalance } from '../types/quota.types';

interface TopUpQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuota: QuotaBalance;
}

/**
 * TopUpQuotaModal — Modal to purchase AI screening quota bundles.
 *
 * Shows bundle info (e.g. "5 lượt — 50.000đ") and confirms purchase.
 * Uses LoadingButton with mutation pending state.
 * Auto-closes on success after brief confirmation message.
 */
export function TopUpQuotaModal({
  isOpen,
  onClose,
  currentQuota,
}: TopUpQuotaModalProps) {
  const MAX_QUOTA_AMOUNT = 9999;
  const backdropRef = useRef<HTMLDivElement>(null);
  const buyMutation = useBuyQuota();
  const [successMessage, setSuccessMessage] = useState('');

  const bundleSize = currentQuota.bundleSize ?? 5;
  const bundlePrice = currentQuota.bundlePrice ?? 50000;
  const unitPrice = Math.max(1, bundlePrice / Math.max(bundleSize, 1));
  const defaultQuotaAmount = Math.max(1, bundleSize);
  const [quotaAmount, setQuotaAmount] = useState(defaultQuotaAmount);
  const [quotaAmountInput, setQuotaAmountInput] = useState(
    defaultQuotaAmount.toString()
  );

  const normalizeAmount = (value: number) => {
    if (!Number.isFinite(value) || value < 1) return 1;
    return Math.min(Math.floor(value), MAX_QUOTA_AMOUNT);
  };

  const syncQuotaAmount = (value: number) => {
    const normalized = normalizeAmount(value);
    setQuotaAmount(normalized);
    setQuotaAmountInput(normalized.toString());
    return normalized;
  };

  const totalPrice = unitPrice * quotaAmount;

  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage('');
      buyMutation.reset();
      return;
    }
    syncQuotaAmount(defaultQuotaAmount);
  }, [isOpen, defaultQuotaAmount]);

  const handleDecrease = () => {
    syncQuotaAmount(quotaAmount - 1);
  };

  const handleIncrease = () => {
    syncQuotaAmount(quotaAmount + 1);
  };

  const handleInputChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setQuotaAmountInput(digitsOnly);

    if (!digitsOnly) return;

    const parsed = parseInt(digitsOnly, 10);
    if (Number.isFinite(parsed)) {
      setQuotaAmount(normalizeAmount(parsed));
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(quotaAmountInput, 10);
    syncQuotaAmount(Number.isFinite(parsed) ? parsed : quotaAmount);
  };

  const handleBuy = () => {
    buyMutation.mutate(
      { quotaAmount },
      {
        onSuccess: (data) => {
          setSuccessMessage(
            `Mua thành công ${quotaAmount} lượt! Số dư ví: ${data.walletBalance.toLocaleString('vi-VN')}đ`
          );
          setTimeout(() => {
            onClose();
          }, 1500);
        },
      }
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && !buyMutation.isPending) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mua lượt AI screening"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--color-brand-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Mua lượt AI Screening
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={buyMutation.isPending}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Current quota info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)]">
            <span className="text-sm text-[var(--text-secondary)]">
              Lượt hiện tại
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {currentQuota.remainingQuota}/{currentQuota.totalAiQuota} lượt
            </span>
          </div>

          {/* Unit price */}
          <div className="p-4 rounded-xl border-2 border-[var(--color-brand-primary)] bg-[var(--color-brand-soft)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  Đơn giá theo lượt
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                  {unitPrice.toLocaleString('vi-VN')}đ / lượt
                </p>
              </div>
              <span className="text-xl font-bold text-[var(--color-brand-primary)]">
                {totalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="mt-4">
              <label
                htmlFor="quotaAmount"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
              >
                Số lượt muốn mua
              </label>
              <div className="flex items-center rounded-xl border border-[var(--border-color)] bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={buyMutation.isPending || quotaAmount <= 1}
                  className="h-11 w-11 text-lg font-bold text-[var(--text-primary)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Giảm số lượt"
                >
                  -
                </button>
                <input
                  id="quotaAmount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quotaAmountInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={handleInputBlur}
                  disabled={buyMutation.isPending}
                  className="h-11 flex-1 text-center text-base font-semibold text-[var(--text-primary)] outline-none"
                  aria-label="Số lượt AI muốn mua"
                />
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={
                    buyMutation.isPending || quotaAmount >= MAX_QUOTA_AMOUNT
                  }
                  className="h-11 w-11 text-lg font-bold text-[var(--text-primary)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Tăng số lượt"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}

          {/* Error message */}
          {buyMutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                {buyMutation.error?.message ||
                  'Không thể mua lượt. Vui lòng thử lại.'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={buyMutation.isPending}
            className="btn-secondary flex-1"
          >
            Hủy
          </button>
          <LoadingButton
            isPending={buyMutation.isPending}
            onClick={handleBuy}
            disabled={!!successMessage}
            className="btn-primary flex-1"
          >
            Mua {quotaAmount} lượt ({totalPrice.toLocaleString('vi-VN')}đ)
          </LoadingButton>
        </div>
      </div>
    </div>,
    document.body
  );
}
