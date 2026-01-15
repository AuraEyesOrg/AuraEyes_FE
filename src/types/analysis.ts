export type RiskLevel = 'Low' | 'Medium' | 'High';

export type VesselAnnotation = {
  id: string;
  location: string;
  severity: RiskLevel;
  notes?: string;
};

export type AnalysisResult = {
  studyId: string;
  risk_level: RiskLevel;
  vessel_annotations: VesselAnnotation[];
  recommendations: string[];
  created_at?: string;
};
