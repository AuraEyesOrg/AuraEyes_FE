import {
  Activity,
  Eye,
  MousePointer2,
  Pencil,
  PenTool,
  Trash2,
} from 'lucide-react';
import type { RefObject } from 'react';
import { getDetectionStyle } from '@/features/organisation/utils/screening-result.util';
import { RetinalAnnotationLayer } from './RetinalAnnotationLayer';
import type {
  AnnotationMode,
  BoxCreatePayload,
  BoxUpdatePayload,
  DetectionBox,
  ImageLayout,
  OrgScreeningImage,
} from '@/features/organisation/types/screening-result.types';

interface OrganisationRetinalViewerCardProps {
  selectedImage?: OrgScreeningImage;
  selectedImageIndex: number;
  images: OrgScreeningImage[];
  analyzing: boolean;
  detectedBoxes: DetectionBox[];
  showHighlights: boolean;
  showHeatmap: boolean;
  heatmapUrl?: string;
  imageLayout: ImageLayout | null;
  imageContainerRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  onToggleHighlights: () => void;
  onToggleHeatmap: () => void;
  onImageLoad: () => void;
  onSelectImage: (index: number) => void;
  // Annotation props (optional for backward compat)
  isEditable?: boolean;
  annotationMode?: AnnotationMode;
  selectedBoxId?: string | null;
  onAnnotationModeChange?: (mode: AnnotationMode) => void;
  onBoxCreate?: (payload: BoxCreatePayload) => void;
  onBoxUpdate?: (payload: BoxUpdatePayload) => void;
  onBoxDelete?: (id: string) => void;
  onBoxSelect?: (id: string | null) => void;
  onBoxDoubleClick?: (id: string) => void;
}

function OrganisationScanAnimationOverlay() {
  return (
    <>
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-full left-0 h-full w-full bg-gradient-to-b from-transparent via-cyan-300/35 to-transparent"
          style={{
            animation: 'orgScanSweep 2.5s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-0 -left-full h-full w-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent"
          style={{
            animation: 'orgScanCross 2.8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0 bg-cyan-300/5"
          style={{
            animation: 'orgScanPulse 1.8s ease-in-out infinite',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="h-24 w-24 rounded-full border border-cyan-300/40"
            style={{
              animation: 'orgScanRing 2.2s ease-out infinite',
            }}
          />
          <span
            className="absolute h-36 w-36 rounded-full border border-cyan-300/30"
            style={{
              animation: 'orgScanRing 2.2s ease-out 0.65s infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes orgScanSweep {
          0% {
            transform: translateY(0%);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            transform: translateY(200%);
            opacity: 0;
          }
        }

        @keyframes orgScanCross {
          0% {
            transform: translateX(0%);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            transform: translateX(200%);
            opacity: 0;
          }
        }

        @keyframes orgScanPulse {
          0%,
          100% {
            opacity: 0.12;
          }
          50% {
            opacity: 0.32;
          }
        }

        @keyframes orgScanRing {
          0% {
            transform: scale(0.75);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

export function OrganisationRetinalViewerCard({
  selectedImage,
  selectedImageIndex,
  images,
  analyzing,
  detectedBoxes,
  showHighlights,
  showHeatmap,
  heatmapUrl,
  imageLayout,
  imageContainerRef,
  imageRef,
  onToggleHighlights,
  onToggleHeatmap,
  onImageLoad,
  onSelectImage,
  isEditable = false,
  annotationMode = 'select',
  selectedBoxId = null,
  onAnnotationModeChange,
  onBoxCreate,
  onBoxUpdate,
  onBoxDelete,
  onBoxSelect,
  onBoxDoubleClick,
}: OrganisationRetinalViewerCardProps) {
  const useAnnotationLayer =
    isEditable && onBoxCreate && onBoxUpdate && onBoxDelete && onBoxSelect;

  const manualCount = detectedBoxes.filter((b) => b.source === 'manual').length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden bg-(--bg-secondary) border border-(--border-primary)">
        <div className="px-5 py-4 border-b border-(--border-primary) flex items-center justify-between gap-4 min-h-[72px]">
          <div>
            <p className="text-sm font-semibold text-(--text-primary)">
              Retinal Viewer
            </p>
            <p className="text-xs text-(--text-tertiary)">
              {selectedImage?.eyeSide ?? 'Unknown eye'} · Image{' '}
              {Math.min(selectedImageIndex + 1, images.length)}/{images.length}
              {detectedBoxes.length > 0 && (
                <span className="ml-2">
                  · {detectedBoxes.length} box
                  {detectedBoxes.length !== 1 ? 'es' : ''}
                  {manualCount > 0 && (
                    <span className="text-indigo-500 dark:text-indigo-400">
                      {' '}
                      ({manualCount} manual)
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Annotation mode toggles */}
            {useAnnotationLayer && (
              <div className="flex items-center gap-0.5 rounded-full border border-(--border-primary) bg-(--bg-primary) p-0.5">
                <button
                  type="button"
                  onClick={() => onAnnotationModeChange?.('select')}
                  title="Select & edit boxes"
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    annotationMode === 'select'
                      ? 'bg-(--bg-secondary) text-primary shadow-sm'
                      : 'text-(--text-tertiary) hover:text-(--text-primary)'
                  }`}
                >
                  <MousePointer2 className="w-3.5 h-3.5" />
                  Select
                </button>
                <button
                  type="button"
                  onClick={() => onAnnotationModeChange?.('draw')}
                  title="Draw new detection box"
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    annotationMode === 'draw'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-(--text-tertiary) hover:text-(--text-primary)'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Draw
                </button>
              </div>
            )}

            {/* Keep action slot width stable to avoid toolbar reflow/jump */}
            {useAnnotationLayer && (
              <div className="flex items-center gap-2 min-w-[190px] justify-end">
                <button
                  type="button"
                  onClick={() =>
                    selectedBoxId && onBoxDoubleClick?.(selectedBoxId)
                  }
                  disabled={!selectedBoxId}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    selectedBoxId
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-800/40 dark:bg-indigo-900/20 dark:text-indigo-400'
                      : 'pointer-events-none opacity-0'
                  }`}
                  title="Edit label of selected box"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit label
                </button>
                <button
                  type="button"
                  onClick={() => selectedBoxId && onBoxDelete(selectedBoxId)}
                  disabled={!selectedBoxId}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    selectedBoxId
                      ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400'
                      : 'pointer-events-none opacity-0'
                  }`}
                  title="Delete selected box"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}

            {detectedBoxes.length > 0 && (
              <button
                type="button"
                onClick={onToggleHighlights}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  showHighlights
                    ? 'border-primary/35 bg-primary/10 text-primary'
                    : 'border-(--border-primary) bg-(--bg-primary) text-(--text-secondary)'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {showHighlights ? 'Hide boxes' : 'Show boxes'}
              </button>
            )}

            {heatmapUrl && (
              <button
                type="button"
                onClick={onToggleHeatmap}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  showHeatmap
                    ? 'border-amber-300 bg-amber-100 text-amber-700'
                    : 'border-(--border-primary) bg-(--bg-primary) text-(--text-secondary)'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                {showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
              </button>
            )}
          </div>
        </div>

        <div
          ref={imageContainerRef}
          className="relative w-full h-[420px] md:h-[520px] flex items-center justify-center bg-black"
        >
          {selectedImage ? (
            <>
              <img
                ref={imageRef}
                src={selectedImage.imageUrl}
                alt="Retinal scan"
                className="w-full h-full object-contain"
                onLoad={onImageLoad}
              />

              {showHeatmap && heatmapUrl && imageLayout && (
                <img
                  src={heatmapUrl}
                  alt="AI heatmap overlay"
                  className="absolute pointer-events-none"
                  style={{
                    left: imageLayout.offsetX,
                    top: imageLayout.offsetY,
                    width: imageLayout.width,
                    height: imageLayout.height,
                    opacity: 0.42,
                    mixBlendMode: 'screen',
                  }}
                />
              )}

              {/* Interactive annotation layer (edit mode) */}
              {showHighlights && useAnnotationLayer && imageLayout && (
                <RetinalAnnotationLayer
                  boxes={detectedBoxes}
                  imageLayout={imageLayout}
                  mode={annotationMode}
                  isEditable={isEditable}
                  selectedBoxId={selectedBoxId}
                  onBoxCreate={onBoxCreate}
                  onBoxUpdate={onBoxUpdate}
                  onBoxDelete={onBoxDelete}
                  onBoxSelect={onBoxSelect}
                  onBoxDoubleClick={onBoxDoubleClick}
                />
              )}

              {/* Static box overlay (view-only / non-editable fallback) */}
              {showHighlights &&
                !useAnnotationLayer &&
                detectedBoxes.length > 0 &&
                imageLayout && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: imageLayout.offsetX,
                      top: imageLayout.offsetY,
                      width: imageLayout.width,
                      height: imageLayout.height,
                    }}
                  >
                    {detectedBoxes.map((box) => {
                      const style = getDetectionStyle(box.type);

                      return (
                        <div
                          key={box.id}
                          className="absolute"
                          style={{
                            top: `${box.location.y}%`,
                            left: `${box.location.x}%`,
                            width: `${box.location.width}%`,
                            height: `${box.location.height}%`,
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-md border-2"
                            style={{
                              borderColor: style.borderColor,
                              backgroundColor: style.backgroundColor,
                              borderStyle:
                                box.source === 'manual' ? 'dashed' : 'solid',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

              {analyzing && <OrganisationScanAnimationOverlay />}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <Eye className="w-16 h-16 text-slate-700" />
            </div>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="rounded-2xl bg-(--bg-secondary) border border-(--border-primary) p-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => onSelectImage(index)}
                className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                  index === selectedImageIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-(--border-primary) opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={image.eyeSide}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
