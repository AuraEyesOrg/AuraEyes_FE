import type { Anomaly, RetinalImage } from './type';

export interface ScreeningConsultationContext {
  screeningId: string;
  images: RetinalImage[];
  anomalies: Anomaly[];
  riskLevel: 'low' | 'moderate' | 'high';
  riskScore?: number;
  rawJsonOutput?: string;
  createdAt: string;
}

const CONSULTATION_CONTEXT_KEY = 'patient-screening-consultation-context';

export function saveScreeningConsultationContext(
  context: ScreeningConsultationContext
): void {
  try {
    sessionStorage.setItem(CONSULTATION_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    // no-op: sessionStorage can be blocked in some environments
  }
}

export function loadScreeningConsultationContext(): ScreeningConsultationContext | null {
  try {
    const raw = sessionStorage.getItem(CONSULTATION_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ScreeningConsultationContext;
    if (!parsed?.screeningId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearScreeningConsultationContext(): void {
  try {
    sessionStorage.removeItem(CONSULTATION_CONTEXT_KEY);
  } catch {
    // no-op
  }
}
