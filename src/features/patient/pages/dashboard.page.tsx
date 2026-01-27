import HighlightCard from '../components/highlight-card';
import type { AnalysisResult } from '@/types';

const mockAnalysis: AnalysisResult = {
  studyId: 'AURA-2026-0001',
  risk_level: 'Medium',
  vessel_annotations: [
    { id: 'v1', location: 'Superotemporal arcade', severity: 'Medium' },
    { id: 'v2', location: 'Inferonasal arcade', severity: 'Low' },
  ],
  recommendations: [
    'Schedule OCT in 2 weeks',
    'Maintain blood pressure log',
    'Upload follow-up fundus images',
  ],
  created_at: '2026-01-03T08:00:00Z',
};

export default function PatientDashboard() {
  return (
    <section className="space-y-8">
      <header className="glass-panel rounded-3xl border border-white/5 px-8 py-6">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral">AURA</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Retinal Vascular Health Overview
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral">
          Unified dashboard for patients to monitor AI-driven retinal
          screenings, review clinician feedback, and track follow-up
          recommendations.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <HighlightCard
          title="Next action"
          value="Upload OCT scan"
          badge="Due"
          tone="accent"
        />
        <HighlightCard
          title="Risk level"
          value={mockAnalysis.risk_level}
          tone="danger"
        />
        <HighlightCard
          title="Pending reviews"
          value="02"
          badge="AI"
          tone="primary"
        />
      </div>

      <div className="glass-panel grid gap-6 rounded-3xl border border-white/5 p-6 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral">
            AI Findings
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Vessel annotations
          </h2>
          <ul className="mt-4 space-y-3">
            {mockAnalysis.vessel_annotations.map((vessel) => (
              <li
                key={vessel.id}
                className="flex items-start justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {vessel.location}
                  </p>
                  <p className="text-xs text-neutral">
                    Severity: {vessel.severity}
                  </p>
                </div>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">
                  {vessel.id}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral">
            Care Plan
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Recommendations
          </h2>
          <div className="mt-4 space-y-3">
            {mockAnalysis.recommendations.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
