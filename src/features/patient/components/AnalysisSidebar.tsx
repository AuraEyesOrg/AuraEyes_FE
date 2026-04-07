import React from 'react';
import { ToggleState, Anomaly } from '../types/type';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { isNormalDisease } from '@/features/patient/lib/disease-translation';
import { getDiseaseUrgency } from '../mock';
import { useTranslation } from 'react-i18next';

interface PatientFindingsProps {
  anomalies: Anomaly[];
  toggles: ToggleState;
  onToggleChange: (key: keyof ToggleState) => void;
  friendlyName: (anomaly: Anomaly) => string;
  friendlyDescription: (anomaly: Anomaly) => string;
}

const URGENCY_CONFIG: Record<
  string,
  {
    labelColor: string;
    badgeBg: string;
    borderLeft: string;
  }
> = {
  critical: {
    labelColor: 'text-red-700',
    badgeBg: 'bg-red-50',
    borderLeft: 'border-l-red-500',
  },
  warning: {
    labelColor: 'text-orange-700',
    badgeBg: 'bg-orange-50',
    borderLeft: 'border-l-orange-400',
  },
  caution: {
    labelColor: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    borderLeft: 'border-l-amber-400',
  },
  info: {
    labelColor: 'text-blue-700',
    badgeBg: 'bg-blue-50',
    borderLeft: 'border-l-blue-400',
  },
  normal: {
    labelColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    borderLeft: 'border-l-emerald-400',
  },
};

function getUrgencyConfig(anomaly: Anomaly) {
  const code = anomaly.code ?? anomaly.name;
  const urgency = getDiseaseUrgency(code);
  return URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG.info;
}

const PatientFindings: React.FC<PatientFindingsProps> = ({
  anomalies,
  friendlyName,
  friendlyDescription,
}) => {
  const { t: i18nT, i18n } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;
  const isVietnamese = (i18n.resolvedLanguage ?? i18n.language ?? 'vi')
    .toLowerCase()
    .startsWith('vi');
  const primary = anomalies.find((a) => a.isHighest) ?? anomalies[0] ?? null;

  if (!primary) {
    return (
      <section>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-700 mb-1">
            {t('PatientRetinalAnalysis.findings.empty.title', {
              defaultValue: isVietnamese
                ? 'Không phát hiện bất thường'
                : 'No abnormalities detected',
            })}
          </h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            {t('PatientRetinalAnalysis.findings.empty.description', {
              defaultValue: isVietnamese
                ? 'AI không ghi nhận dấu hiệu bất thường trên ảnh đáy mắt. Hãy tiếp tục khám mắt định kỳ.'
                : 'AI did not detect abnormal signs in the fundus image. Please continue regular eye check-ups.',
            })}
          </p>
        </div>
      </section>
    );
  }

  const primaryIsNormal = isNormalDisease(primary.code ?? primary.name);

  if (primaryIsNormal) {
    return (
      <section>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-700 mb-1">
            {t('PatientRetinalAnalysis.findings.normal.title', {
              defaultValue: isVietnamese
                ? 'Kết quả bình thường'
                : 'Normal result',
            })}
          </h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            {t('PatientRetinalAnalysis.findings.normal.description', {
              defaultValue: isVietnamese
                ? 'Ảnh đáy mắt không cho thấy dấu hiệu bệnh lý. Hãy tiếp tục khám mắt định kỳ để bảo vệ sức khỏe thị lực.'
                : 'No disease signs were detected in your fundus image. Continue regular eye check-ups to protect your vision.',
            })}
          </p>
        </div>
      </section>
    );
  }

  const related = anomalies.filter((a) => a !== primary);
  const hasCriticalFinding = anomalies.some(
    (a) => getDiseaseUrgency(a.code ?? a.name) === 'critical'
  );

  return (
    <section>
      {/* Primary finding */}
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        {t('PatientRetinalAnalysis.findings.primaryTitle', {
          defaultValue: isVietnamese ? 'Phát hiện chính' : 'Primary Finding',
        })}
      </h2>
      <PrimaryFindingCard
        anomaly={primary}
        friendlyName={friendlyName}
        friendlyDescription={friendlyDescription}
        t={t}
        isVietnamese={isVietnamese}
      />

      {/* Related diseases */}
      {related.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            {t('PatientRetinalAnalysis.findings.relatedTitle', {
              defaultValue: isVietnamese
                ? 'Bệnh liên quan'
                : 'Related Findings',
            })}
          </h3>
          {hasCriticalFinding && (
            <div className="mb-3 px-3 py-2 rounded-lg border border-red-200 bg-red-50">
              <p className="text-xs text-red-700 leading-relaxed font-medium">
                {t('PatientRetinalAnalysis.findings.criticalHint', {
                  defaultValue: isVietnamese
                    ? 'Có dấu hiệu khẩn cấp trong danh sách. Vui lòng ưu tiên khám bác sĩ sớm.'
                    : 'A critical finding is present in this list. Please prioritize seeing an ophthalmologist soon.',
                })}
              </p>
            </div>
          )}
          <div className="space-y-2">
            {related.map((anomaly) => (
              <RelatedDiseaseItem
                key={anomaly.id}
                anomaly={anomaly}
                friendlyName={friendlyName}
                t={t}
                isVietnamese={isVietnamese}
              />
            ))}
          </div>
        </div>
      )}

      {/* Next step */}
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
        <ArrowRight className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-slate-500 leading-relaxed">
          <span className="font-medium text-slate-600">
            {t('PatientRetinalAnalysis.findings.nextStepLabel', {
              defaultValue: isVietnamese ? 'Bước tiếp theo:' : 'Next step:',
            })}
          </span>{' '}
          {t('PatientRetinalAnalysis.findings.nextStepDescription', {
            defaultValue: isVietnamese
              ? 'Tiếp tục đến phần Xem lại để bác sĩ chuyên khoa xác nhận kết quả và tư vấn hướng xử trí phù hợp.'
              : 'Continue to Review so a specialist can confirm the results and advise an appropriate care plan.',
          })}
        </p>
      </div>
    </section>
  );
};

// --- Primary Finding Card ---
interface PrimaryFindingCardProps {
  anomaly: Anomaly;
  friendlyName: (anomaly: Anomaly) => string;
  friendlyDescription: (anomaly: Anomaly) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
  isVietnamese: boolean;
}

const PrimaryFindingCard: React.FC<PrimaryFindingCardProps> = ({
  anomaly,
  friendlyName,
  friendlyDescription,
  t,
  isVietnamese,
}) => {
  const config = getUrgencyConfig(anomaly);
  const urgency = getDiseaseUrgency(anomaly.code ?? anomaly.name);
  const title = friendlyName(anomaly).trim();
  const description = friendlyDescription(anomaly).trim();
  const shouldShowDescription =
    description.length > 0 && description.toLowerCase() !== title.toLowerCase();
  const urgencyLabel = t(`PatientRetinalAnalysis.findings.urgency.${urgency}`, {
    defaultValue: isVietnamese
      ? ({
          critical: 'Cần khẩn cấp',
          warning: 'Cần theo dõi',
          caution: 'Lưu ý',
          info: 'Thông tin',
          normal: 'Bình thường',
        }[urgency] ?? 'Thông tin')
      : urgency.charAt(0).toUpperCase() + urgency.slice(1),
  });
  const urgencySuggestion = t(
    `PatientRetinalAnalysis.findings.suggestion.${urgency}`,
    {
      defaultValue: isVietnamese
        ? 'Vui lòng tuân theo hướng dẫn của bác sĩ nhãn khoa.'
        : 'Please follow your ophthalmologist recommendations.',
    }
  );

  return (
    <div
      className={`rounded-xl border bg-white p-5 border-l-4 ${config.borderLeft} ring-2 ring-red-400/30 border-red-200 shadow-md shadow-red-50`}
    >
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-[15px] font-bold text-slate-800 leading-snug">
          {friendlyName(anomaly)}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.badgeBg} ${config.labelColor}`}
        >
          {urgencyLabel}
        </span>
      </div>

      {anomaly.groupDisplay && (
        <p className="text-xs text-slate-400 mb-2">{anomaly.groupDisplay}</p>
      )}

      {shouldShowDescription && (
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      )}

      <p className="text-xs text-slate-400 mt-2 italic">{urgencySuggestion}</p>
    </div>
  );
};

// --- Related Disease Item ---
interface RelatedDiseaseItemProps {
  anomaly: Anomaly;
  friendlyName: (anomaly: Anomaly) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
  isVietnamese: boolean;
}

const RelatedDiseaseItem: React.FC<RelatedDiseaseItemProps> = ({
  anomaly,
  friendlyName,
  t,
  isVietnamese,
}) => {
  const config = getUrgencyConfig(anomaly);
  const urgency = getDiseaseUrgency(anomaly.code ?? anomaly.name);
  const urgencyLabel = t(`PatientRetinalAnalysis.findings.urgency.${urgency}`, {
    defaultValue: isVietnamese
      ? ({
          critical: 'Cần khẩn cấp',
          warning: 'Cần theo dõi',
          caution: 'Lưu ý',
          info: 'Thông tin',
          normal: 'Bình thường',
        }[urgency] ?? 'Thông tin')
      : urgency.charAt(0).toUpperCase() + urgency.slice(1),
  });

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
      <span className="text-sm text-slate-700 font-medium leading-snug">
        {friendlyName(anomaly)}
      </span>
      <span
        className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.badgeBg} ${config.labelColor}`}
      >
        {urgencyLabel}
      </span>
    </div>
  );
};

export default PatientFindings;
