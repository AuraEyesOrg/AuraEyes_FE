import { isAxiosError } from 'axios';
import {
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { toDisplayDiseaseName } from '@/features/patient/lib/disease-translation';
import { aiCoreClient } from '@/lib/axios';
import type {
  AiFindingItem,
  AIStandardPrediction,
  AIStandardResponse,
  DetectionBox,
  DetectionBoxLocation,
  DiseaseUrgency,
  RiskLevel,
} from '@/features/organisation/types/screening-result.types';

interface RiskConfigItem {
  color: string;
  bg: string;
  border: string;
  icon: LucideIcon;
}

const ORGANISATION_NOTE_MARKER = '[Organisation Note]';

function resolveFindingName(item: AIStandardPrediction): string {
  return item.code ?? item.class_name ?? item.name_en ?? item.name_vi ?? '';
}

function resolveFindingDisplayName(
  item: AIStandardPrediction,
  language: string
): string {
  const isVietnamese = language.toLowerCase().startsWith('vi');

  if (item.code && (item.name_vi || item.name_en)) {
    if (isVietnamese) {
      return item.name_vi ?? item.name_en ?? item.code;
    }

    return item.name_en ?? item.name_vi ?? item.code;
  }

  if (item.name_vi || item.name_en) {
    return isVietnamese
      ? (item.name_vi ?? item.name_en ?? item.code ?? item.class_name ?? '')
      : (item.name_en ?? item.name_vi ?? item.code ?? item.class_name ?? '');
  }

  return toDisplayDiseaseName(item.class_name ?? item.code ?? '', language);
}

export const riskConfig: Record<RiskLevel, RiskConfigItem> = {
  Low: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    icon: ShieldCheck,
  },
  Moderate: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800/40',
    icon: AlertTriangle,
  },
  High: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800/40',
    icon: AlertCircle,
  },
};

export function clampConfidence(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
}

export function normalizeRiskLevel(value?: string): RiskLevel {
  const normalized = value?.toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'moderate') return 'Moderate';
  return 'Low';
}

export function toRiskLevelFromUrgency(
  urgency: DiseaseUrgency,
  confidence: number
): RiskLevel {
  if (urgency === 'critical') return 'High';

  if (urgency === 'warning') {
    return confidence >= 70 ? 'High' : 'Moderate';
  }

  if (urgency === 'caution') {
    return confidence >= 70 ? 'Moderate' : 'Low';
  }

  return 'Low';
}

export function buildSummary(
  riskLevel: RiskLevel,
  primaryLabel?: string
): string {
  if (riskLevel === 'High') {
    return `Findings need attention from an ophthalmologist${primaryLabel ? ` (${primaryLabel})` : ''}.`;
  }

  if (riskLevel === 'Moderate') {
    return `Some findings may need specialist review${primaryLabel ? ` (${primaryLabel})` : ''}.`;
  }

  return primaryLabel
    ? `Low-risk findings detected (${primaryLabel}). Routine specialist follow-up is recommended.`
    : 'Low-risk findings detected. Routine specialist follow-up is recommended.';
}

export function buildFindingsText(items: AiFindingItem[]): string {
  const findingNames = items
    .slice(0, 4)
    .map((item) => item.localizedName.trim())
    .filter((name) => name.length > 0);

  if (findingNames.length === 0) return '';

  const [primaryFinding, ...secondaryFindings] = findingNames;

  if (secondaryFindings.length === 0) {
    return `Primary Finding: ${primaryFinding}`;
  }

  return `Primary Finding: ${primaryFinding}\nRelated Findings: ${secondaryFindings.join(', ')}`;
}

export function splitFindingsAndNote(content?: string): {
  findings: string;
  note: string;
} {
  if (!content) {
    return { findings: '', note: '' };
  }

  const marker = `${ORGANISATION_NOTE_MARKER}\n`;
  const markerIndex = content.lastIndexOf(marker);

  if (markerIndex === -1) {
    return { findings: content, note: '' };
  }

  const note = content.slice(markerIndex + marker.length).trim();
  if (!note) {
    return { findings: content, note: '' };
  }

  return {
    findings: content.slice(0, markerIndex).trimEnd(),
    note,
  };
}

export function composeFindingsWithNote(
  findings: string,
  note?: string
): string {
  const cleanFindings = findings?.trim() ?? '';
  const cleanNote = note?.trim() ?? '';

  if (!cleanNote) {
    return cleanFindings;
  }

  if (!cleanFindings) {
    return `${ORGANISATION_NOTE_MARKER}\n${cleanNote}`;
  }

  return `${cleanFindings}\n\n${ORGANISATION_NOTE_MARKER}\n${cleanNote}`;
}

export function mapAiFindings(
  predictions: AIStandardPrediction[],
  language: string,
  maxItems = 6
): AiFindingItem[] {
  return predictions.slice(0, maxItems).map((item) => {
    const displayName = resolveFindingDisplayName(item, language);
    return {
      id: `${item.rank}-${resolveFindingName(item)}`,
      name: resolveFindingName(item),
      localizedName: displayName,
      confidence: clampConfidence((item.confidence ?? 0) * 100),
      status: item.status ?? 'primary',
    };
  });
}

function toPercentLocation(
  bbox: { x: number; y: number; width: number; height: number },
  imgWidth: number,
  imgHeight: number
): DetectionBoxLocation | undefined {
  if (imgWidth <= 0 || imgHeight <= 0) return undefined;

  return {
    x: Math.round((bbox.x / imgWidth) * 1000) / 10,
    y: Math.round((bbox.y / imgHeight) * 1000) / 10,
    width: Math.round((bbox.width / imgWidth) * 1000) / 10,
    height: Math.round((bbox.height / imgHeight) * 1000) / 10,
  };
}

function resolveAiAssetUrl(url?: string): string | undefined {
  if (!url) return undefined;

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  try {
    const base =
      typeof aiCoreClient.defaults.baseURL === 'string' &&
      aiCoreClient.defaults.baseURL.length > 0
        ? aiCoreClient.defaults.baseURL
        : window.location.origin;

    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function toDetectionType(
  confidence: number,
  status?: string
): 'warning' | 'priority_high' | 'info' {
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === 'primary' || confidence >= 70) return 'warning';
  if (confidence >= 45) return 'priority_high';
  return 'info';
}

export function getDetectionStyle(type: DetectionBox['type']) {
  if (type === 'warning') {
    return {
      borderColor: 'rgba(239, 68, 68, 0.88)',
      backgroundColor: 'rgba(239, 68, 68, 0.14)',
      labelClass: 'bg-red-600/90 text-white border-red-400/40',
    };
  }

  if (type === 'priority_high') {
    return {
      borderColor: 'rgba(245, 158, 11, 0.88)',
      backgroundColor: 'rgba(245, 158, 11, 0.14)',
      labelClass: 'bg-amber-500/90 text-white border-amber-300/40',
    };
  }

  return {
    borderColor: 'rgba(59, 130, 246, 0.82)',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    labelClass: 'bg-blue-500/85 text-white border-blue-300/40',
  };
}

export function extractVisualArtifactsFromRaw(
  rawJsonOutput: string | undefined,
  imgWidth: number,
  imgHeight: number,
  language: string
): { boxes: DetectionBox[]; heatmapUrl?: string } {
  if (!rawJsonOutput) return { boxes: [] };

  try {
    const parsed = JSON.parse(rawJsonOutput) as AIStandardResponse & {
      anomalies?: Array<{
        id?: string;
        name?: string;
        confidence?: number;
        status?: string;
        location?: DetectionBoxLocation;
      }>;
    };

    const heatmapUrl = resolveAiAssetUrl(
      parsed.heatmap_url ?? parsed.heatmap_colormap_url
    );

    const topK = [...(parsed.prediction?.top_k ?? [])].sort(
      (a, b) => a.rank - b.rank
    );
    const lesions = parsed.localization?.all_lesions ?? [];

    if (
      topK.length > 0 &&
      lesions.length > 0 &&
      imgWidth > 0 &&
      imgHeight > 0
    ) {
      const boxes = topK
        .map((prediction, index) => {
          const lesion = lesions[index];
          if (!lesion?.bbox) return null;

          const location = toPercentLocation(lesion.bbox, imgWidth, imgHeight);
          if (!location) return null;

          const confidence = clampConfidence(
            (prediction.confidence ?? 0) * 100
          );

          const predName = prediction.code ?? prediction.class_name ?? '';
          const isVietnamese = language.toLowerCase().startsWith('vi');
          const localizedName =
            prediction.code && prediction.name_vi
              ? isVietnamese
                ? prediction.name_vi
                : (prediction.name_en ?? prediction.code)
              : toDisplayDiseaseName(predName, language);

          return {
            id: `${prediction.rank}-${predName}`,
            name: predName,
            localizedName,
            confidence,
            type: toDetectionType(confidence, prediction.status),
            location,
          } satisfies DetectionBox;
        })
        .filter((item): item is DetectionBox => Boolean(item));

      return { boxes, heatmapUrl };
    }

    if (Array.isArray(parsed.anomalies)) {
      const boxes = parsed.anomalies
        .map((item, index) => {
          if (!item.location || !item.name) return null;

          const rawConfidence = Number(item.confidence ?? 0);
          const confidence = clampConfidence(
            rawConfidence > 1 ? rawConfidence : rawConfidence * 100
          );

          return {
            id: item.id ?? `saved-${index + 1}`,
            name: item.name,
            localizedName: toDisplayDiseaseName(item.name, language),
            confidence,
            type: toDetectionType(confidence, item.status),
            location: item.location,
          } satisfies DetectionBox;
        })
        .filter((item): item is DetectionBox => Boolean(item));

      return { boxes, heatmapUrl };
    }

    return { boxes: [], heatmapUrl };
  } catch {
    return { boxes: [] };
  }
}

export function extractTopKFromRaw(
  rawJsonOutput?: string
): AIStandardPrediction[] {
  if (!rawJsonOutput) return [];

  try {
    const parsed = JSON.parse(rawJsonOutput) as Partial<AIStandardResponse>;
    const topK = parsed.prediction?.top_k ?? [];

    if (topK.length > 0) {
      return [...topK].sort((a, b) => a.rank - b.rank);
    }

    const anomalies = parsed.anomalies ?? [];
    if (anomalies.length === 0) return [];

    return anomalies.map((item, index) => ({
      rank: index + 1,
      class_name: item.name,
      code: item.name,
      name_en: item.name,
      name_vi: item.name,
      confidence:
        typeof item.confidence === 'number' && item.confidence > 1
          ? item.confidence / 100
          : (item.confidence ?? 0),
      status: item.status,
    }));
  } catch {
    return [];
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error) || !error.response?.data) return fallback;

  const payload = error.response.data as {
    message?: string;
    detail?: string;
    errors?: Array<{ error?: string }>;
  };

  if (payload.message) return payload.message;
  if (payload.detail) return payload.detail;
  if (Array.isArray(payload.errors) && payload.errors[0]?.error) {
    return payload.errors
      .map((item) => item.error)
      .filter(Boolean)
      .join(', ');
  }

  return fallback;
}
