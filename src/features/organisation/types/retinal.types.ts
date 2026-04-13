export interface ToggleState {
  vesselSegmentation: boolean;
  hemorrhages: boolean;
  exudates: boolean;
  opticDisc: boolean;
}

export interface AnomalyLocation {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AnomalyType = 'warning' | 'priority_high' | 'info';

export interface Anomaly {
  id: string;
  name: string;
  confidence: number;
  description: string;
  color: string;
  type: AnomalyType;
  location: AnomalyLocation;
}

export interface RetinalImage {
  id: string;
  url: string;
  name: string;
  eye: string;
  uploadedAt: string;
  analyzed: boolean;
  anomalies: Anomaly[];
}
