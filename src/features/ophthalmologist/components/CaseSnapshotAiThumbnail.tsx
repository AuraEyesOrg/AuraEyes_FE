import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import PatientImageViewer from '@/features/patient/components/ImageViewer';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type {
  Anomaly,
  RetinalImage,
  ToggleState,
} from '@/features/patient/types/type';
import { hydrateConsultationPreviewAnomalies } from '@/features/patient/pages/retinal-analysis';
import type { ConsultationCaseSnapshotDto } from '@/types/consultation';

const VIEWER_TOGGLES: ToggleState = {
  vesselSegmentation: false,
  hemorrhages: false,
  exudates: false,
  opticDisc: false,
};

/**
 * Shows fundus + AI overlays from persisted JSON (same mapping as patient analysis).
 * Falls back to legacy annotatedImageUrl when present.
 */
export function CaseSnapshotAiThumbnail({
  snapshot,
}: {
  snapshot: ConsultationCaseSnapshotDto;
}) {
  const { t } = useSafeTranslation();
  const imageUrl = snapshot.originalImageUrls[0] ?? null;
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    if (!snapshot.rawJsonOutput || !imageUrl) {
      setAnomalies([]);
      return;
    }
    let cancelled = false;
    hydrateConsultationPreviewAnomalies(snapshot.rawJsonOutput, imageUrl).then(
      (mapped) => {
        if (!cancelled) setAnomalies(mapped);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [snapshot.rawJsonOutput, imageUrl]);

  const currentImage = useMemo((): RetinalImage | null => {
    if (!imageUrl) return null;
    return {
      id: 'consultation-case',
      url: imageUrl,
      name: 'Retinal',
      eye: 'Both Eyes',
      uploadedAt: new Date().toISOString(),
      analyzed: true,
      anomalies,
    };
  }, [imageUrl, anomalies]);

  const showHighlights = anomalies.some((a) => a.location);

  if (snapshot.rawJsonOutput && currentImage) {
    return (
      <div className="h-24 w-full min-h-[96px] relative overflow-hidden bg-slate-100 dark:bg-[#0a1929]">
        <PatientImageViewer
          toggles={VIEWER_TOGGLES}
          zoomLevel={1}
          anomalies={anomalies}
          isAnalyzing={false}
          currentImage={currentImage}
          showHighlights={showHighlights}
        />
      </div>
    );
  }

  if (snapshot.annotatedImageUrl) {
    return (
      <img
        src={snapshot.annotatedImageUrl}
        alt={t('Ophthalmologist.caseSnapshot.alt', 'AI annotated retinal image')}
        className="h-24 w-full object-cover"
      />
    );
  }

  return (
    <div className="h-24 w-full flex items-center justify-center text-[11px] text-slate-500">
      {t('Ophthalmologist.caseSnapshot.noImage', 'No AI image')}
    </div>
  );
}

export function ScreeningReviewLink({ screeningId }: { screeningId: string }) {
  const { t } = useSafeTranslation();
  const to = `/ophthalmologist/screenings/${screeningId}/review`;
  return (
    <Link
      to={to}
      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
    >
      <ExternalLink className="h-3 w-3" />
      {t('Ophthalmologist.caseSnapshot.openReview', 'Open full AI screening review')}
    </Link>
  );
}
