import React from 'react';
import { ToggleState, Anomaly } from '../types/type';
import { CheckCircle } from 'lucide-react';

interface PatientFindingsProps {
  anomalies: Anomaly[];
  toggles: ToggleState;
  onToggleChange: (key: keyof ToggleState) => void;
  friendlyName: (anomaly: Anomaly) => string;
  friendlyDescription: (anomaly: Anomaly) => string;
}

const PatientFindings: React.FC<PatientFindingsProps> = ({
  anomalies,
  friendlyName,
  friendlyDescription,
}) => {
  if (anomalies.length === 0) {
    return (
      <section>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-700 mb-1">
            No Issues Found
          </h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Our AI screening didn't find anything unusual. We still recommend
            regular eye check-ups.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        What We Found
      </h2>
      <div className="space-y-3">
        {anomalies.map((anomaly) => (
          <FindingCard
            key={anomaly.id}
            anomaly={anomaly}
            friendlyName={friendlyName}
            friendlyDescription={friendlyDescription}
          />
        ))}
      </div>
    </section>
  );
};

// --- Individual Finding Card ---
interface FindingCardProps {
  anomaly: Anomaly;
  friendlyName: (anomaly: Anomaly) => string;
  friendlyDescription: (anomaly: Anomaly) => string;
}

const FindingCard: React.FC<FindingCardProps> = ({
  anomaly,
  friendlyName,
  friendlyDescription,
}) => {
  const typeConfig = {
    warning: {
      borderLeft: 'border-l-rose-500',
      label: 'Needs attention',
      labelColor: 'text-rose-700',
      badgeBg: 'bg-rose-50',
    },
    priority_high: {
      borderLeft: 'border-l-amber-500',
      label: 'Worth monitoring',
      labelColor: 'text-amber-700',
      badgeBg: 'bg-amber-50',
    },
    info: {
      borderLeft: 'border-l-blue-500',
      label: 'For your info',
      labelColor: 'text-blue-700',
      badgeBg: 'bg-blue-50',
    },
  };

  const config = typeConfig[anomaly.type] || typeConfig.info;

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 border-l-4 ${config.borderLeft} transition-colors hover:bg-slate-50`}
    >
      {/* Title + Severity Badge */}
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
      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed">
        {friendlyDescription(anomaly)}
      </p>
    </div>
  );
};

export default PatientFindings;
