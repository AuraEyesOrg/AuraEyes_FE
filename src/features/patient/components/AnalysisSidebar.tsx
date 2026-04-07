import React from 'react';
import { ToggleState, Anomaly } from '../types/type';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { isNormalDisease } from '@/features/patient/lib/disease-translation';
import { getDiseaseUrgency } from '../mock';

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
    label: string;
    labelColor: string;
    badgeBg: string;
    borderLeft: string;
    suggestion: string;
  }
> = {
  critical: {
    label: 'Cần khẩn cấp',
    labelColor: 'text-red-700',
    badgeBg: 'bg-red-50',
    borderLeft: 'border-l-red-500',
    suggestion: 'Cần đến bác sĩ nhãn khoa ngay.',
  },
  warning: {
    label: 'Cần theo dõi',
    labelColor: 'text-orange-700',
    badgeBg: 'bg-orange-50',
    borderLeft: 'border-l-orange-400',
    suggestion: 'Nên tham khảo ý kiến bác sĩ nhãn khoa.',
  },
  caution: {
    label: 'Lưu ý',
    labelColor: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    borderLeft: 'border-l-amber-400',
    suggestion: 'Nên theo dõi định kỳ.',
  },
  info: {
    label: 'Thông tin',
    labelColor: 'text-blue-700',
    badgeBg: 'bg-blue-50',
    borderLeft: 'border-l-blue-400',
    suggestion: 'Không cần xử lý ngay.',
  },
  normal: {
    label: 'Bình thường',
    labelColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    borderLeft: 'border-l-emerald-400',
    suggestion: 'Tiếp tục khám mắt định kỳ.',
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
  const primary = anomalies.find((a) => a.isHighest) ?? anomalies[0] ?? null;

  if (!primary) {
    return (
      <section>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-700 mb-1">
            Không phát hiện bất thường
          </h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            AI không ghi nhận dấu hiệu bất thường trên ảnh đáy mắt. Hãy tiếp tục
            khám mắt định kỳ.
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
            Kết quả bình thường
          </h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Ảnh đáy mắt không cho thấy dấu hiệu bệnh lý. Hãy tiếp tục khám mắt
            định kỳ để bảo vệ sức khỏe thị lực.
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
        Phát hiện chính
      </h2>
      <PrimaryFindingCard
        anomaly={primary}
        friendlyName={friendlyName}
        friendlyDescription={friendlyDescription}
      />

      {/* Related diseases */}
      {related.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Bệnh liên quan
          </h3>
          {hasCriticalFinding && (
            <div className="mb-3 px-3 py-2 rounded-lg border border-red-200 bg-red-50">
              <p className="text-xs text-red-700 leading-relaxed font-medium">
                Có dấu hiệu khẩn cấp trong danh sách. Vui lòng ưu tiên khám bác
                sĩ sớm.
              </p>
            </div>
          )}
          <div className="space-y-2">
            {related.map((anomaly) => (
              <RelatedDiseaseItem
                key={anomaly.id}
                anomaly={anomaly}
                friendlyName={friendlyName}
              />
            ))}
          </div>
        </div>
      )}

      {/* Next step */}
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
        <ArrowRight className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-slate-500 leading-relaxed">
          <span className="font-medium text-slate-600">Bước tiếp theo:</span>{' '}
          Tiếp tục đến phần Xem lại để bác sĩ chuyên khoa xác nhận kết quả và tư
          vấn hướng xử trí phù hợp.
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
}

const PrimaryFindingCard: React.FC<PrimaryFindingCardProps> = ({
  anomaly,
  friendlyName,
  friendlyDescription,
}) => {
  const config = getUrgencyConfig(anomaly);

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
          {config.label}
        </span>
      </div>

      {anomaly.groupDisplay && (
        <p className="text-xs text-slate-400 mb-2">{anomaly.groupDisplay}</p>
      )}

      <p className="text-sm text-slate-500 leading-relaxed">
        {friendlyDescription(anomaly)}
      </p>

      <p className="text-xs text-slate-400 mt-2 italic">{config.suggestion}</p>
    </div>
  );
};

// --- Related Disease Item ---
interface RelatedDiseaseItemProps {
  anomaly: Anomaly;
  friendlyName: (anomaly: Anomaly) => string;
}

const RelatedDiseaseItem: React.FC<RelatedDiseaseItemProps> = ({
  anomaly,
  friendlyName,
}) => {
  const config = getUrgencyConfig(anomaly);

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
      <span className="text-sm text-slate-700 font-medium leading-snug">
        {friendlyName(anomaly)}
      </span>
      <span
        className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.badgeBg} ${config.labelColor}`}
      >
        {config.label}
      </span>
    </div>
  );
};

export default PatientFindings;
