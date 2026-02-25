/**
 * AI Model Monitoring Page
 * System Admin view for monitoring AI model performance and fairness metrics
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  Target,
  AlertTriangle,
  Zap,
  History,
  Rocket,
  X,
  MoreVertical,
  Verified,
  FlaskConical,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { aiModelApi } from '../api';
import type {
  AIModel,
  AIModelMetrics,
  DemographicParity,
  ModelVersion,
} from '../types/system-admin.types';

// Mock data for demonstration
const getMockCurrentModel = (): AIModel => ({
  id: 'model-001',
  name: 'RetinaVesselNet',
  version: 'v3.2.0',
  status: 'active',
  accuracy: 98.4,
  precision: 96.1,
  recall: 97.8,
  f1Score: 96.9,
  lastUpdated: 'Oct 24, 2023',
  author: 'Dr. Ray',
});

const getMockKPIs = (): AIModelMetrics => ({
  globalAccuracy: 98.4,
  accuracyChange: 0.2,
  precision: 96.1,
  precisionChange: 0.1,
  falsePositiveRate: 1.2,
  fprChange: -0.05,
  avgInferenceTime: 120,
  inferenceTimeChange: 0,
});

const getMockDemographicParity = (): DemographicParity[] => [
  { group: 'Age 18-40', accuracy: 99.1, hasWarning: false },
  { group: 'Age 41-60', accuracy: 98.5, hasWarning: false },
  { group: 'Age 61-75', accuracy: 97.8, hasWarning: false },
  {
    group: 'Age > 75',
    accuracy: 96.3,
    hasWarning: true,
    warning: 'Drift detected - requires review',
  },
];

const getMockVersionHistory = (): ModelVersion[] => [
  {
    version: 'v3.2.0',
    status: 'active',
    releaseDate: 'Oct 24, 2023',
    accuracy: 98.4,
    author: 'Dr. Ray',
  },
  {
    version: 'v3.3.0-beta',
    status: 'staging',
    releaseDate: 'Nov 02, 2023',
    accuracy: 98.6,
    author: 'Sarah C.',
  },
  {
    version: 'v3.1.5',
    status: 'deprecated',
    releaseDate: 'Sep 15, 2023',
    accuracy: 97.9,
    author: 'Dr. Ray',
  },
  {
    version: 'v3.1.0',
    status: 'deprecated',
    releaseDate: 'Aug 01, 2023',
    accuracy: 97.2,
    author: 'Sarah C.',
  },
];

const versionStatusColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  active: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  staging: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  deprecated: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
};

export default function AIModelsPage() {
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);
  const [kpis, setKpis] = useState<AIModelMetrics | null>(null);
  const [demographicParity, setDemographicParity] = useState<
    DemographicParity[]
  >([]);
  const [versionHistory, setVersionHistory] = useState<ModelVersion[]>([]);
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [modelData, kpisData, parityData] = await Promise.all([
        aiModelApi.getCurrentModel().catch(() => null),
        aiModelApi.getModelKPIs().catch(() => null),
        aiModelApi.getDemographicParity().catch(() => null),
      ]);

      setCurrentModel(modelData || getMockCurrentModel());
      setKpis(kpisData || getMockKPIs());
      setDemographicParity(parityData || getMockDemographicParity());
      setVersionHistory(getMockVersionHistory());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check if there's a drift warning
  const hasDriftWarning = demographicParity.some((d) => d.hasWarning);

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          title="AI Model Monitoring"
          description={
            <>
              Real-time performance metrics for{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {currentModel?.name} {currentModel?.version}
              </span>
            </>
          }
          badge={<StatusBadge status="success" label="Live" />}
          actions={
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-all">
                <History className="w-4 h-4" />
                View Logs
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-primary/20">
                <Rocket className="w-4 h-4" />
                Deploy New Model
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-10 py-6 max-w-[1600px] mx-auto w-full space-y-6">
            {/* Alert Banner */}
            {showAlert && hasDriftWarning && (
              <div className="flex w-full items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-amber-800">
                    Minor Fairness Drift Detected
                  </h3>
                  <p className="text-sm text-amber-700">
                    The model is showing a 1.5% variance in recall rates for the
                    "Age &gt; 75" demographic group. Please review the bias
                    indicators below.
                  </p>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  className="ml-auto text-amber-800 hover:text-amber-950"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Global Accuracy"
                value={`${kpis?.globalAccuracy}%`}
                icon={CheckCircle2}
                trend={
                  kpis?.accuracyChange && kpis.accuracyChange > 0
                    ? 'up'
                    : 'down'
                }
                change={kpis?.accuracyChange}
                description="Target: >98.0%"
                variant="primary"
              />
              <StatsCard
                title="Precision"
                value={`${kpis?.precision}%`}
                icon={Target}
                trend={
                  kpis?.precisionChange && kpis.precisionChange > 0
                    ? 'up'
                    : 'down'
                }
                change={kpis?.precisionChange}
                description="High confidence score"
                variant="success"
              />
              <StatsCard
                title="False Positive Rate"
                value={`${kpis?.falsePositiveRate}%`}
                icon={AlertTriangle}
                trend={kpis?.fprChange && kpis.fprChange < 0 ? 'up' : 'down'}
                change={Math.abs(kpis?.fprChange || 0)}
                description="Within safety margins"
                variant="warning"
              />
              <StatsCard
                title="Avg Inference Time"
                value={`${kpis?.avgInferenceTime}ms`}
                icon={Zap}
                description="Optimal performance"
                variant="primary"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Performance Chart */}
              <div className="lg:col-span-2 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      30-Day Performance Trend
                    </h3>
                    <p className="text-sm text-slate-500">
                      Sensitivity vs. Specificity over time
                    </p>
                  </div>
                  <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary p-2">
                    <option>Last 30 Days</option>
                    <option>Last 3 Months</option>
                    <option>Year to Date</option>
                  </select>
                </div>
                <div className="p-6">
                  <div className="relative h-64 w-full">
                    {/* Simplified SVG Chart */}
                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 800 300"
                      preserveAspectRatio="none"
                    >
                      {/* Grid lines */}
                      <line
                        x1="0"
                        y1="0"
                        x2="800"
                        y2="0"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1="75"
                        x2="800"
                        y2="75"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1="150"
                        x2="800"
                        y2="150"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1="225"
                        x2="800"
                        y2="225"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1="300"
                        x2="800"
                        y2="300"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />

                      {/* Area Gradient */}
                      <defs>
                        <linearGradient
                          id="chartGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#00E5FF"
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="100%"
                            stopColor="#00E5FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      {/* Data Area */}
                      <path
                        d="M0 200 C100 180, 200 220, 300 150 C400 80, 500 100, 600 60 C700 30, 750 50, 800 40 V 300 H 0 Z"
                        fill="url(#chartGradient)"
                      />

                      {/* Primary Line (Sensitivity) */}
                      <path
                        d="M0 200 C100 180, 200 220, 300 150 C400 80, 500 100, 600 60 C700 30, 750 50, 800 40"
                        fill="none"
                        stroke="#00E5FF"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Secondary Line (Specificity) */}
                      <path
                        d="M0 220 C100 210, 200 240, 300 180 C400 120, 500 130, 600 90 C700 70, 750 80, 800 75"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        strokeLinecap="round"
                      />

                      {/* Active Point */}
                      <circle
                        cx="600"
                        cy="60"
                        r="6"
                        fill="#00E5FF"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary"></span>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Sensitivity
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Specificity
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demographic Parity Panel */}
              <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-slate-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Demographic Parity
                  </h3>
                </div>
                <div className="p-6 flex flex-col gap-6 flex-1 justify-center">
                  {demographicParity.map((item) => (
                    <div key={item.group} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {item.group}
                          </span>
                          {item.hasWarning && (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-bold ${item.hasWarning ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}
                        >
                          {item.accuracy}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.hasWarning ? 'bg-amber-400' : 'bg-primary'}`}
                          style={{ width: `${item.accuracy}%` }}
                        ></div>
                      </div>
                      {item.warning && (
                        <p className="text-[11px] text-slate-400">
                          {item.warning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 rounded-b-xl">
                  <button className="text-sm text-primary font-semibold hover:opacity-80 transition-colors flex items-center gap-1">
                    View Full Bias Report
                    <span className="ml-1">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Version History Table */}
            <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Model Version History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Version
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Release Date
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Accuracy
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Author
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {versionHistory.map((version) => {
                      const statusStyle =
                        versionStatusColors[version.status] ||
                        versionStatusColors.deprecated;
                      const isDeprecated = version.status === 'deprecated';

                      return (
                        <tr
                          key={version.version}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                            version.status === 'staging'
                              ? 'bg-blue-50/30 dark:bg-blue-900/10'
                              : ''
                          } ${isDeprecated ? 'opacity-70' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {version.status === 'active' && (
                                <Verified className="w-5 h-5 text-emerald-500" />
                              )}
                              {version.status === 'staging' && (
                                <FlaskConical className="w-5 h-5 text-blue-500" />
                              )}
                              <span
                                className={`text-sm font-semibold ${isDeprecated ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}
                              >
                                {version.version}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                            >
                              {version.status.charAt(0).toUpperCase() +
                                version.status.slice(1)}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${isDeprecated ? 'text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}
                          >
                            {version.releaseDate}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm font-medium ${isDeprecated ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}
                          >
                            {version.accuracy}%
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                                {version.author
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </div>
                              <span
                                className={`text-sm ${isDeprecated ? 'text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}
                              >
                                {version.author}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {version.status === 'staging' && (
                              <button className="text-primary hover:opacity-80 text-sm font-semibold mr-2">
                                Promote
                              </button>
                            )}
                            <button className="text-slate-400 hover:text-primary transition-colors align-middle">
                              <MoreVertical className="w-5 h-5 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
