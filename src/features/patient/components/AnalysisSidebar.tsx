import React from 'react';
import { ToggleState, Anomaly } from '../types/type';
import {
  Info,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Bot,
  Download,
  FileText,
} from 'lucide-react';

interface AnalysisSidebarProps {
  toggles: ToggleState;
  onToggleChange: (key: keyof ToggleState) => void;
  anomalies: Anomaly[];
  isAnalyzing: boolean;
  onAnalyze: () => void;
  analyzed: boolean;
  isFallback?: boolean;
  errorMessage?: string | null;
}

const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({
  toggles,
  onToggleChange,
  anomalies,
  isAnalyzing,
  onAnalyze,
  analyzed,
  isFallback,
  errorMessage,
}) => {
  // Calculate a mock risk score based on findings
  const riskScore =
    anomalies.length > 0
      ? (
          (anomalies.reduce((acc, curr) => acc + curr.confidence, 0) /
            (anomalies.length * 100)) *
          10
        ).toFixed(1)
      : '0.0';

  return (
    <aside className="w-80 flex-none flex flex-col bg-[var(--bg-secondary)] border-l border-[var(--border-color)] overflow-hidden z-20 shadow-xl">
      {/* Risk Summary Card */}
      <div className="p-5 border-b border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[var(--text-primary)] text-sm font-semibold uppercase tracking-wider">
            AURA Risk Score
          </h3>
          <div className="group relative cursor-help">
            <Info className="w-4 h-4 text-[var(--text-secondary)]" />
            <div className="absolute right-0 top-6 w-48 p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] rounded hidden group-hover:block z-50 shadow-xl">
              Based on real-time AI analysis of retinal features.
            </div>
          </div>
        </div>
        <div className="flex items-end gap-3 mb-3">
          <span className="text-4xl font-bold text-[var(--text-primary)]">
            {isAnalyzing ? '--' : riskScore}
          </span>
          <span className="text-sm text-[var(--text-secondary)] mb-1.5">
            / 10
          </span>
          {Number(riskScore) > 5 && (
            <span className="ml-auto px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30">
              Referral Recommended
            </span>
          )}
        </div>
        <div className="w-full bg-[var(--border-color)] rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand to-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: isAnalyzing ? '0%' : `${Number(riskScore) * 10}%` }}
          ></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Analysis Trigger */}
        <div className="bg-[var(--bg-tertiary)]/20 rounded-lg p-1 border border-[var(--border-color)] flex flex-col gap-2">
          {!analyzed && !isAnalyzing ? (
            <div className="p-3 text-center">
              <p className="text-[var(--text-secondary)] text-xs mb-3">
                No active analysis data. Start AI processing to detect
                anomalies.
              </p>
              <button
                onClick={onAnalyze}
                className="w-full py-2.5 bg-brand hover:bg-brand/90 text-[var(--bg-primary)] font-bold rounded text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Start AI Diagnosis
              </button>
            </div>
          ) : isAnalyzing ? (
            <div className="p-4 flex flex-col items-center justify-center gap-3">
              <div className="size-8 border-4 border-[var(--border-color)] border-t-brand rounded-full animate-spin"></div>
              <span className="text-brand text-xs font-medium animate-pulse">
                Processing Retinal Data...
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Analysis Complete
                </span>
                <button
                  onClick={onAnalyze}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
                >
                  Re-run
                </button>
              </div>
              {isFallback && (
                <div className="text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    {errorMessage ||
                      'API unavailable. Showing simulated results.'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Layers Control */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Annotation Layers
          </h4>

          <ToggleItem
            label="Vessel Segmentation"
            checked={toggles.vesselSegmentation}
            onChange={() => onToggleChange('vesselSegmentation')}
          />
          <ToggleItem
            label="Hemorrhages"
            checked={toggles.hemorrhages}
            onChange={() => onToggleChange('hemorrhages')}
          />
          <ToggleItem
            label="Exudates"
            checked={toggles.exudates}
            onChange={() => onToggleChange('exudates')}
          />
        </div>

        <div className="h-px bg-[var(--border-color)] w-full"></div>

        {/* Detailed Findings */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Detected Anomalies
          </h4>

          {anomalies.length === 0 && analyzed && (
            <div className="text-sm text-[var(--text-secondary)] italic text-center py-4">
              No significant anomalies detected.
            </div>
          )}

          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`bg-[var(--bg-tertiary)]/30 rounded-lg p-3 border border-[var(--border-color)] hover:border-brand/50 transition-colors cursor-pointer group ${anomaly.confidence < 50 ? 'opacity-70' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {anomaly.name}
                </span>
                <span
                  className={`text-xs font-mono ${anomaly.confidence < 50 ? 'text-[var(--text-secondary)]' : 'text-brand'}`}
                >
                  {anomaly.confidence}%
                </span>
              </div>
              {anomaly.description && (
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  {anomaly.description}
                </p>
              )}
              <div className="w-full bg-[var(--bg-primary)]/40 rounded-full h-1.5">
                <div
                  className={`${anomaly.color} h-1.5 rounded-full`}
                  style={{ width: `${anomaly.confidence}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3">
        <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
          <Bot className="w-4 h-4 flex-shrink-0" />
          <span>AI findings are assistive. Please verify.</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 text-[var(--text-primary)] text-sm font-bold hover:bg-[var(--bg-tertiary)] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand text-[var(--bg-primary)] text-sm font-bold hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20">
            <FileText className="w-4 h-4" />
            Report
          </button>
        </div>
      </div>
    </aside>
  );
};

// Toggle Switch Component
interface ToggleItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-center justify-between cursor-pointer group select-none py-1">
      <span className="text-sm text-[var(--text-primary)] group-hover:text-brand transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-brand' : 'bg-[var(--border-color)]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
};

export default AnalysisSidebar;
