export interface ToggleState {
  vesselSegmentation: boolean;
  hemorrhages: boolean;
  exudates: boolean;
  opticDisc: boolean;
}

export interface Location {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Anomaly {
  id: string;
  name: string;
  confidence: number;
  description: string;
  color: string;
  type: 'warning' | 'priority_high' | 'info';
  location?: Location;
  friendlyName?: string;
  friendlyDescription?: string;
  isHighest?: boolean;
  /** V2 disease code (e.g. BRVO, WNL) */
  code?: string;
  /** V2 group display name (e.g. "Mạch máu (Vascular)") */
  groupDisplay?: string;
}

export interface Patient {
  name: string;
  id: string;
  dob: string;
  scanDate: string;
  eye: 'Left Eye (OS)' | 'Right Eye (OD)';
  status: 'Attention Needed' | 'Normal';
}

export interface RetinalImage {
  id: string;
  url: string;
  name: string;
  eye: 'Left Eye (OS)' | 'Right Eye (OD)' | 'Both Eyes';
  uploadedAt: string;
  analyzed: boolean;
  anomalies: Anomaly[];
  thumbnail?: string;
  heatmapUrl?: string;
}
