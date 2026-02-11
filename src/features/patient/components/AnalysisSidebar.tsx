import React, { useState } from 'react';
import { ToggleState, Anomaly } from '../types/type';
import { HelpCircle, CheckCircle } from 'lucide-react';

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
      <h2 className="text-lg font-bold text-slate-800 mb-4">What We Found</h2>
      <div className="grid grid-cols-2 gap-3">
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
  const [showTooltip, setShowTooltip] = useState(false);

  const typeConfig = {
    warning: {
      dot: 'bg-rose-500',
      label: 'Needs attention',
      labelColor: 'text-rose-600',
    },
    priority_high: {
      dot: 'bg-amber-500',
      label: 'Worth monitoring',
      labelColor: 'text-amber-600',
    },
    info: {
      dot: 'bg-blue-500',
      label: 'For your info',
      labelColor: 'text-blue-600',
    },
  };

  const config = typeConfig[anomaly.type] || typeConfig.info;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50">
      {/* Dot + Name + Severity */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${config.dot} mt-1.5 flex-shrink-0`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-sm font-bold text-slate-700 leading-snug">
              {friendlyName(anomaly)}
            </span>
            <span className={`text-sm font-bold leading-snug`}> — </span>
            <span
              className={`text-sm font-semibold ${config.labelColor} leading-snug`}
            >
              {config.label}.
            </span>
            {/* Tooltip */}
            <div className="relative inline-block">
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Medical term"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {showTooltip && (
                <div className="absolute left-0 top-full mt-1 z-50 w-52 p-3 bg-white rounded-lg shadow-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <p className="font-medium text-slate-700 mb-1">
                    Medical term: {anomaly.name}
                  </p>
                  <p>
                    Your eye doctor can explain this in more detail during your
                    visit.
                  </p>
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="mt-2 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed pl-[18px]">
        {friendlyDescription(anomaly)}
      </p>
    </div>
  );
};

export default PatientFindings;
