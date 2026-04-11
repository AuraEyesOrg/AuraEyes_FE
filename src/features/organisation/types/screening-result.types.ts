export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface OrgScreeningImage {
  id: string;
  imageUrl: string;
  eyeSide: string;
}

export interface OrgScreeningLatestResult {
  screeningResultId: string;
  riskLevel: string;
  confidenceScore: number;
  summary?: string;
  findings?: string;
  assessedAt: string;
}

export interface OrgScreeningSessionDetail {
  screeningId: string;
  patientId: string;
  patientName?: string;
  patientEmail?: string;
  isWalkIn: boolean;
  modelVersion: string;
  createdAt: string;
  rawJsonOutput?: string;
  images: OrgScreeningImage[];
  latestResult?: OrgScreeningLatestResult;
}

export interface AIStandardPrediction {
  rank: number;
  class_name?: string;
  code?: string;
  name_en?: string;
  name_vi?: string;
  confidence: number;
  status?: string;
  class_index?: number;
}

export interface AIStandardResponse {
  prediction: {
    code?: string;
    name_en?: string;
    name_vi?: string;
    top_k: AIStandardPrediction[];
    group?: {
      code: string;
      display: string;
      description?: string;
      confidence: number;
    } | null;
  };
  model_note?: {
    status: string;
    notes: string[];
    disclaimer: string;
  };
  localization?: {
    all_lesions: Array<{
      bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      confidence?: number;
    }>;
  } | null;
  heatmap_colormap_url?: string;
  heatmap_url?: string | null;
}

export interface DetectionBoxLocation {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionBox {
  id: string;
  name: string;
  localizedName: string;
  confidence: number;
  type: 'warning' | 'priority_high' | 'info';
  location: DetectionBoxLocation;
}

export interface ImageLayout {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export interface AiFindingItem {
  id: string;
  name: string;
  localizedName: string;
  confidence: number;
  status: string;
}

export interface ResultDraft {
  riskLevel: RiskLevel;
  confidenceScore: number;
  summary: string;
  findings: string;
}

export type DiseaseUrgency =
  | 'critical'
  | 'warning'
  | 'caution'
  | 'info'
  | 'normal';
