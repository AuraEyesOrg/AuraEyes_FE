import React from 'react';
import { ToggleState, Anomaly } from '../types/type';
import { CheckCircle, ArrowRight } from 'lucide-react';

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

      {/* Recommended next step */}
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
        <ArrowRight className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-slate-500 leading-relaxed">
          <span className="font-medium text-slate-600">Next step:</span>{' '}
          Continue to the Review stage where a specialist can confirm these
          findings and discuss your options.
        </p>
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
      borderLeft: 'border-l-orange-400',
      label: 'Needs attention',
      labelColor: 'text-orange-700',
      badgeBg: 'bg-orange-50',
      suggestion: 'Consider consulting an ophthalmologist.',
    },
    priority_high: {
      borderLeft: 'border-l-amber-400',
      label: 'Worth monitoring',
      labelColor: 'text-amber-700',
      badgeBg: 'bg-amber-50',
      suggestion: 'A specialist can advise on monitoring.',
    },
    info: {
      borderLeft: 'border-l-blue-400',
      label: 'For your info',
      labelColor: 'text-blue-700',
      badgeBg: 'bg-blue-50',
      suggestion: 'No immediate action needed.',
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
      {/* Suggested next step */}
      <p className="text-xs text-slate-400 mt-1.5 italic">
        {config.suggestion}
      </p>
    </div>
  );
};

export default PatientFindings;
