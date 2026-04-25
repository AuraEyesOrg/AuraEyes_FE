import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  FileText,
  Pill,
  ReceiptText,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import ClinicStaffLayout from '../components/ClinicStaffLayout';
import { formatCurrency } from '@/lib/helper';
import { clinicQueueApi, type ClinicPaymentContext } from '../api/queue.api';

export default function CashierPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const visitIdFromQuery = searchParams.get('visitId');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(
    visitIdFromQuery
  );
  const effectiveVisitId = selectedVisitId ?? visitIdFromQuery;

  const queueQuery = useQuery({
    queryKey: ['clinic-staff', 'queue', 'cashier'],
    queryFn: clinicQueueApi.getQueue,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  const paymentContextQuery = useQuery({
    queryKey: ['clinic-staff', 'payment-context', effectiveVisitId],
    queryFn: () => clinicQueueApi.getPaymentContext(effectiveVisitId!),
    enabled: Boolean(effectiveVisitId),
  });

  const finalizedVisits = useMemo(
    () =>
      (queueQuery.data ?? []).filter((item) => item.flowState === 'Finalized'),
    [queueQuery.data]
  );

  const activeVisit = useMemo(
    () =>
      finalizedVisits.find((item) => item.visitId === effectiveVisitId) ?? null,
    [effectiveVisitId, finalizedVisits]
  );

  useEffect(() => {
    if (visitIdFromQuery && visitIdFromQuery !== selectedVisitId) {
      setSelectedVisitId(visitIdFromQuery);
    }
  }, [visitIdFromQuery, selectedVisitId]);

  const paymentContext = paymentContextQuery.data;
  const [medicinePriceInputs, setMedicinePriceInputs] = useState<
    Record<string, string>
  >({});
  const [serviceFeeInput, setServiceFeeInput] = useState('');

  useEffect(() => {
    if (!paymentContext) return;
    const initialPrices = paymentContext.diagnosis.prescriptionItems.reduce<
      Record<string, string>
    >((acc, _, index) => {
      acc[`medicine-${index}`] = '';
      return acc;
    }, {});
    setMedicinePriceInputs(initialPrices);
    setServiceFeeInput('');
  }, [paymentContext]);

  const parseMoney = (value: string) => {
    const normalized = Number(value.replace(/[^0-9]/g, ''));
    return Number.isFinite(normalized) ? normalized : 0;
  };

  const computedManualTotal = useMemo(() => {
    const medicinesTotal = Object.values(medicinePriceInputs).reduce(
      (sum, value) => sum + parseMoney(value),
      0
    );
    return medicinesTotal + parseMoney(serviceFeeInput);
  }, [medicinePriceInputs, serviceFeeInput]);

  return (
    <ClinicStaffLayout>
      <main className="mx-auto max-w-[1280px] space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-(--border-color) bg-gradient-to-br from-(--bg-primary) via-(--bg-secondary) to-(--bg-primary) p-6 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(circle at 14% 20%, rgba(16,185,129,0.12), transparent 40%), radial-gradient(circle at 90% 12%, rgba(20,184,166,0.10), transparent 35%)',
            }}
          />
          <div className="relative grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                Cashier workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-(--text-primary) md:text-4xl [text-wrap:balance]">
                Thu ngân thủ công cho ca khám đã hoàn tất
              </h1>
              <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-(--text-secondary)">
                Chọn ca đã finalize để nhập giá thuốc và phí dịch vụ. Tổng tiền
                sẽ được tính ngay để hỗ trợ xác nhận thanh toán nhanh và chính
                xác.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                  Ca finalized
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 [font-variant-numeric:tabular-nums]">
                  {finalizedVisits.length}
                </p>
              </div>
              <div className="rounded-2xl border border-(--border-color) bg-(--bg-primary)/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                  Đang chọn
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-(--text-primary)">
                  {effectiveVisitId
                    ? `${effectiveVisitId.slice(0, 8)}...`
                    : 'Chưa chọn ca'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-(--border-color) bg-(--bg-primary) p-5 md:p-6 xl:sticky xl:top-24">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-(--text-primary)">
                  Danh sách ca chờ thu ngân
                </h2>
              </div>
            </div>

            {queueQuery.isLoading && (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`cashier-visit-skeleton-${index}`}
                    className="skeleton-shimmer h-[86px] rounded-2xl border border-(--border-color) bg-(--bg-secondary)"
                  />
                ))}
              </div>
            )}

            {!queueQuery.isLoading && queueQuery.isError && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Không thể tải danh sách ca thu ngân. Vui lòng thử lại sau.
                  </p>
                </div>
              </div>
            )}

            {!queueQuery.isLoading &&
              !queueQuery.isError &&
              finalizedVisits.length === 0 && (
                <div className="mt-4 rounded-2xl border border-(--border-color) bg-(--bg-secondary) px-4 py-6 text-center">
                  <p className="text-sm font-medium text-(--text-primary)">
                    Chưa có ca nào sẵn sàng thu ngân
                  </p>
                  <p className="mt-1 text-xs text-(--text-muted)">
                    Hệ thống sẽ tự cập nhật ngay khi bác sĩ finalize ca khám.
                  </p>
                </div>
              )}

            {!queueQuery.isLoading &&
              !queueQuery.isError &&
              finalizedVisits.length > 0 && (
                <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1">
                  {finalizedVisits.map((visit) => {
                    const isActive = effectiveVisitId === visit.visitId;

                    return (
                      <button
                        key={visit.visitId}
                        type="button"
                        onClick={() => {
                          setSelectedVisitId(visit.visitId);
                          setSearchParams((prev) => {
                            const next = new URLSearchParams(prev);
                            next.set('visitId', visit.visitId);
                            return next;
                          });
                        }}
                        className={`group w-full rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 ${
                          isActive
                            ? 'border-emerald-400/60 bg-emerald-500/10 shadow-[0_10px_25px_-18px_rgba(16,185,129,0.9)]'
                            : 'border-(--border-color) bg-(--bg-secondary) hover:-translate-y-0.5 hover:border-brand/50 hover:bg-(--bg-primary)'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-(--text-primary)">
                            {visit.patientName}
                          </p>
                          {isActive && (
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-(--text-secondary)">
                          Visit: {visit.visitId.slice(0, 8)}...
                        </p>
                        <p className="mt-0.5 text-xs text-(--text-muted)">
                          Bác sĩ: {visit.assignedDoctorName || 'N/A'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
          </aside>

          <section className="rounded-3xl border border-(--border-color) bg-(--bg-primary) p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold text-(--text-primary)">
                  Bảng giá thủ công
                </h2>
                <p className="mt-1 text-xs text-(--text-muted)">
                  Nhập chi phí theo từng thuốc và dịch vụ trong ca khám đã chọn.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-(--border-color) bg-(--bg-secondary) px-2.5 py-1 text-[11px] font-medium text-(--text-secondary)">
                <FileText className="h-3.5 w-3.5" />
                {effectiveVisitId
                  ? `Visit ${effectiveVisitId.slice(0, 8)}...`
                  : 'Chưa chọn ca'}
              </span>
            </div>

            {!effectiveVisitId && (
              <div className="mt-5 rounded-2xl border border-dashed border-(--border-color) bg-(--bg-secondary) p-8 text-center">
                <ReceiptText className="mx-auto h-9 w-9 text-(--text-muted)" />
                <p className="mt-3 text-sm font-medium text-(--text-primary)">
                  Chọn một ca khám để bắt đầu nhập giá
                </p>
                <p className="mt-1 text-xs text-(--text-muted)">
                  Danh sách ca nằm ở cột bên trái. Sau khi chọn, thông tin đơn
                  thuốc sẽ hiển thị tại đây.
                </p>
              </div>
            )}

            {effectiveVisitId && paymentContextQuery.isLoading && (
              <div className="mt-5 space-y-3">
                <div className="skeleton-shimmer h-[76px] rounded-2xl border border-(--border-color) bg-(--bg-secondary)" />
                <div className="skeleton-shimmer h-[120px] rounded-2xl border border-(--border-color) bg-(--bg-secondary)" />
                <div className="skeleton-shimmer h-[120px] rounded-2xl border border-(--border-color) bg-(--bg-secondary)" />
              </div>
            )}

            {effectiveVisitId && paymentContextQuery.isError && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Không thể tải payment context cho visit này.</p>
                </div>
              </div>
            )}

            {paymentContext && (
              <CashierPricingPanel
                context={paymentContext}
                fallbackDoctorName={activeVisit?.assignedDoctorName}
                medicinePriceInputs={medicinePriceInputs}
                serviceFeeInput={serviceFeeInput}
                computedManualTotal={computedManualTotal}
                onMedicinePriceChange={(key, value) =>
                  setMedicinePriceInputs((prev) => ({ ...prev, [key]: value }))
                }
                onServiceFeeChange={setServiceFeeInput}
              />
            )}
          </section>
        </div>
      </main>
    </ClinicStaffLayout>
  );
}

interface CashierPricingPanelProps {
  context: ClinicPaymentContext;
  fallbackDoctorName?: string;
  medicinePriceInputs: Record<string, string>;
  serviceFeeInput: string;
  computedManualTotal: number;
  onMedicinePriceChange: (key: string, value: string) => void;
  onServiceFeeChange: (value: string) => void;
}

function CashierPricingPanel({
  context,
  fallbackDoctorName,
  medicinePriceInputs,
  serviceFeeInput,
  computedManualTotal,
  onMedicinePriceChange,
  onServiceFeeChange,
}: CashierPricingPanelProps) {
  const doctorName =
    context.diagnosis.diagnosedBy.doctorName || fallbackDoctorName;

  const parseMoney = (value: string) => {
    const normalized = Number(value.replace(/[^0-9]/g, ''));
    return Number.isFinite(normalized) ? normalized : 0;
  };

  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
              <UserRound className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                Bệnh nhân
              </p>
              <p className="mt-1 text-sm font-semibold text-(--text-primary)">
                {context.patientName}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-600 dark:text-cyan-400">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--text-secondary)">
                Bác sĩ phụ trách
              </p>
              <p className="mt-1 text-sm font-semibold text-(--text-primary)">
                {doctorName || 'N/A'}
              </p>
            </div>
          </div>
        </article>
      </div>

      {context.diagnosis.noMedicationPrescribed ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Bác sĩ đánh dấu không kê thuốc cho ca này.</p>
          </div>
        </div>
      ) : (
        <section className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Pill className="h-3.5 w-3.5" />
            Có {context.diagnosis.prescriptionItems.length} thuốc trong đơn
          </div>

          {context.diagnosis.prescriptionItems.map((item, index) => {
            const inputKey = `medicine-${index}`;
            const medicinePrice = parseMoney(
              medicinePriceInputs[inputKey] ?? ''
            );

            return (
              <article
                key={inputKey}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4 md:grid-cols-[2fr_1fr]"
              >
                <div>
                  <p className="text-sm font-semibold text-(--text-primary)">
                    {item.medicineName}
                  </p>
                  <p className="mt-1 text-xs text-(--text-muted)">
                    {item.dosage} · {item.frequency} · {item.duration}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={inputKey}
                    className="block text-xs font-semibold text-(--text-secondary)"
                  >
                    Giá thuốc (VND)
                  </label>
                  <input
                    id={inputKey}
                    inputMode="numeric"
                    value={medicinePriceInputs[inputKey] ?? ''}
                    onChange={(event) =>
                      onMedicinePriceChange(inputKey, event.target.value)
                    }
                    placeholder="Nhập giá thủ công"
                    className="w-full rounded-xl border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) [font-variant-numeric:tabular-nums] placeholder:text-(--text-muted) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  />
                  <p className="text-[11px] text-(--text-muted)">
                    Tạm tính:{' '}
                    {formatCurrency(medicinePrice, { absolute: true })}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4 md:grid-cols-[2fr_1fr] md:items-end">
        <div>
          <p className="text-sm font-semibold text-(--text-primary)">
            Phí khám / dịch vụ khác
          </p>
          <p className="mt-1 text-xs text-(--text-muted)">
            Nhập khoản phí ngoài giá thuốc nếu có.
          </p>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="service-fee-input"
            className="block text-xs font-semibold text-(--text-secondary)"
          >
            Phí dịch vụ (VND)
          </label>
          <input
            id="service-fee-input"
            inputMode="numeric"
            value={serviceFeeInput}
            onChange={(event) => onServiceFeeChange(event.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) [font-variant-numeric:tabular-nums] placeholder:text-(--text-muted) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <p className="text-[11px] text-(--text-muted)">
            Tạm tính:{' '}
            {formatCurrency(parseMoney(serviceFeeInput), { absolute: true })}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
        <p className="text-xs font-medium text-(--text-secondary)">
          Tổng tiền thủ công
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 [font-variant-numeric:tabular-nums]">
            {formatCurrency(computedManualTotal, { absolute: true })}
          </p>
        </div>
      </section>
    </div>
  );
}
