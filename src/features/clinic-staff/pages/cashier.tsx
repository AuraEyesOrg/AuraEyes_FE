import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Pill } from 'lucide-react';
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
      <div className="max-w-[1200px] mx-auto space-y-6">
        <section className="rounded-3xl border border-(--border-color) bg-(--bg-primary) p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Danh sách ca chờ thu ngân
            </h2>
            <span className="text-xs font-medium text-(--text-muted)">
              Finalized: {finalizedVisits.length}
            </span>
          </div>

          {!queueQuery.isLoading && finalizedVisits.length === 0 && (
            <p className="mt-4 text-sm text-(--text-secondary)">
              Chưa có ca nào bác sĩ finalize để chuyển sang cashier.
            </p>
          )}

          {!queueQuery.isLoading && finalizedVisits.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
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
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-(--border-color) bg-(--bg-secondary) hover:border-brand/40'
                    }`}
                  >
                    <p className="text-sm font-semibold text-(--text-primary)">
                      {visit.patientName}
                    </p>
                    <p className="mt-1 text-xs text-(--text-secondary)">
                      Visit: {visit.visitId.slice(0, 8)}... · Doctor:{' '}
                      {visit.assignedDoctorName || 'N/A'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {effectiveVisitId && (
          <section className="rounded-3xl border border-(--border-color) bg-(--bg-primary) p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-(--text-primary)">
                Bảng giá thủ công cho Cashier
              </h2>
              <span className="text-xs font-medium text-(--text-muted)">
                Visit: {effectiveVisitId.slice(0, 8)}...
              </span>
            </div>

            {paymentContextQuery.isError && (
              <p className="mt-4 text-sm text-red-500">
                Không thể tải payment context cho visit này.
              </p>
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
        )}
      </div>
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

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4">
        <p className="text-sm text-(--text-secondary)">
          <span className="font-semibold text-(--text-primary)">
            Bệnh nhân:
          </span>{' '}
          {context.patientName}
        </p>
        <p className="mt-1 text-sm text-(--text-secondary)">
          <span className="font-semibold text-(--text-primary)">Bác sĩ:</span>{' '}
          {doctorName || 'N/A'}
        </p>
      </div>

      {context.diagnosis.noMedicationPrescribed ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          Bác sĩ đánh dấu không kê thuốc cho ca này.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Pill className="h-3.5 w-3.5" />
            Có {context.diagnosis.prescriptionItems.length} thuốc trong đơn
          </div>
          {context.diagnosis.prescriptionItems.map((item, index) => {
            const inputKey = `medicine-${index}`;
            return (
              <div
                key={inputKey}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4 md:grid-cols-[2fr_1fr]"
              >
                <div>
                  <p className="text-sm font-semibold text-(--text-primary)">
                    {item.medicineName}
                  </p>
                  <p className="mt-1 text-xs text-(--text-muted)">
                    {item.dosage} - {item.frequency} - {item.duration}
                  </p>
                </div>
                <div className="space-y-1">
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
                    className="w-full rounded-xl border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-4 md:grid-cols-[2fr_1fr] md:items-end">
        <div>
          <p className="text-sm font-semibold text-(--text-primary)">
            Phí khám / dịch vụ khác
          </p>
          <p className="mt-1 text-xs text-(--text-muted)">
            Nhập khoản phí ngoài giá thuốc nếu có.
          </p>
        </div>
        <div className="space-y-1">
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
            className="w-full rounded-xl border border-(--border-color) bg-(--bg-primary) px-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
        <p className="text-xs text-(--text-secondary)">Tổng tiền thủ công</p>
        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(computedManualTotal, { absolute: true })}
        </p>
      </div>
    </div>
  );
}
