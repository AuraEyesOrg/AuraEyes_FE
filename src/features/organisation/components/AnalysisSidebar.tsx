import React from 'react';
import {
  Info,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Bot,
  Download,
  FileText,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import type {
  Anomaly,
  ToggleState,
} from '@/features/organisation/types/retinal.types';

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
    <aside className="w-80 flex-none flex flex-col bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-white border-l border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200 overflow-hidden z-20 shadow-xl">
      {/* Risk Summary Card */}
      <div className="p-5 border-b border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200 bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white dark:text-white light:text-gray-900 text-sm font-semibold uppercase tracking-wider">
            AURA Risk Score
          </h3>
          <div className="group relative cursor-help">
            <Info className="w-4 h-4 text-gray-400 dark:text-gray-400 light:text-gray-600" />
            <div className="absolute right-0 top-6 w-48 p-2 bg-black dark:bg-black light:bg-white border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 rounded hidden group-hover:block z-50 shadow-xl">
              Based on real-time AI analysis of retinal features.
            </div>
          </div>
        </div>
        <div className="flex items-end gap-3 mb-3">
          <span className="text-4xl font-bold text-white dark:text-white light:text-gray-900">
            {isAnalyzing ? '--' : riskScore}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 mb-1.5">
            / 10
          </span>
          {Number(riskScore) > 5 && (
            <span className="ml-auto px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30">
              Referral Recommended
            </span>
          )}
        </div>
        <div className="w-full bg-[#2d4a6f] dark:bg-[#2d4a6f] light:bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#13ecec] to-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: isAnalyzing ? '0%' : `${Number(riskScore) * 10}%` }}
          ></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Analysis Trigger */}
        <div className="bg-[#1e3a5f]/20 dark:bg-[#1e3a5f]/20 light:bg-gray-50 rounded-lg p-1 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200 flex flex-col gap-2">
          {!analyzed && !isAnalyzing ? (
            <div className="p-3 text-center">
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs mb-3">
                No active analysis data. Start AI processing to detect
                anomalies.
              </p>
              <button
                onClick={onAnalyze}
                className="w-full py-2.5 bg-[#13ecec] hover:bg-[#13ecec]/90 text-[#102222] font-bold rounded text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Start AI Diagnosis
              </button>
            </div>
          ) : isAnalyzing ? (
            <div className="p-4 flex flex-col items-center justify-center gap-3">
              <Spinner size={32} />
              <span className="text-[#13ecec] text-xs font-medium animate-pulse">
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
                  className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 underline"
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
          <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider mb-2">
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

        <div className="h-px bg-[#2d4a6f] dark:bg-[#2d4a6f] light:bg-gray-200 w-full"></div>

        {/* Detailed Findings */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider mb-2">
            Detected Anomalies
          </h4>

          {anomalies.length === 0 && analyzed && (
            <div className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 italic text-center py-4">
              No significant anomalies detected.
            </div>
          )}

          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`bg-[#1e3a5f]/30 dark:bg-[#1e3a5f]/30 light:bg-gray-50 rounded-lg p-3 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200 hover:border-[#13ecec]/50 transition-colors cursor-pointer group ${anomaly.confidence < 50 ? 'opacity-70' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
                  {anomaly.name}
                </span>
                <span
                  className={`text-xs font-mono ${anomaly.confidence < 50 ? 'text-gray-400 dark:text-gray-400 light:text-gray-600' : 'text-[#13ecec]'}`}
                >
                  {anomaly.confidence}%
                </span>
              </div>
              {anomaly.description && (
                <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                  {anomaly.description}
                </p>
              )}
              <div className="w-full bg-black/40 dark:bg-black/40 light:bg-gray-200 rounded-full h-1.5">
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
      <div className="p-4 border-t border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200 bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-gray-50 space-y-3">
        <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
          <Bot className="w-4 h-4 flex-shrink-0" />
          <span>AI findings are assistive. Please verify.</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 bg-[#1e3a5f]/50 dark:bg-[#1e3a5f]/50 light:bg-gray-100 text-white dark:text-white light:text-gray-900 text-sm font-bold hover:bg-[#1e3a5f] dark:hover:bg-[#1e3a5f] light:hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#13ecec] text-[#102222] text-sm font-bold hover:bg-[#13ecec]/90 transition-colors shadow-lg shadow-[#13ecec]/20">
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
      <span className="text-sm text-white dark:text-white light:text-gray-900 group-hover:text-[#13ecec] transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked
            ? 'bg-[#13ecec]'
            : 'bg-[#2d4a6f] dark:bg-[#2d4a6f] light:bg-gray-300'
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
