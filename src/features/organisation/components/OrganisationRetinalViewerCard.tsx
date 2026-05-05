import {
  Activity,
  Eraser,
  Eye,
  MousePointer2,
  PenTool,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useCallback, useRef, useState, type RefObject } from 'react';
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
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface OrganisationRetinalViewerCardProps {
  selectedImage?: OrgScreeningImage;
  selectedImageIndex: number;
  images: OrgScreeningImage[];
  analyzing: boolean;
  detectedBoxes: DetectionBox[];
  showHighlights: boolean;
  showHeatmap: boolean;
  heatmapUrl?: string; // fallback
  heatmapCanvasRef?: RefObject<HTMLCanvasElement | null>;
  heatmapData?: number[][] | null;
  heatmapOpacity?: number;
  heatmapThreshold?: number;
  heatmapEditMode?: 'draw' | 'erase' | null;
  setHeatmapOpacity?: (val: number) => void;
  setHeatmapThreshold?: (val: number) => void;
  setHeatmapEditMode?: (mode: 'draw' | 'erase' | null) => void;
  setHeatmapData?: React.Dispatch<React.SetStateAction<number[][] | null>>;
  setHasHeatmapEdits?: (has: boolean) => void;
  paintHeatmap?: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  brushSize?: number;
  setBrushSize?: (val: number) => void;
  brushTargetHeat?: number;
  setBrushTargetHeat?: (val: number) => void;
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
  onUndo?: () => void;
  canUndo?: boolean;
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
  heatmapUrl, // fallback
  heatmapCanvasRef,
  heatmapData,
  heatmapOpacity,
  heatmapThreshold,
  heatmapEditMode,
  setHeatmapOpacity,
  setHeatmapThreshold,
  setHeatmapEditMode,
  setHeatmapData,
  setHasHeatmapEdits,
  paintHeatmap,
  brushSize,
  setBrushSize,
  brushTargetHeat,
  setBrushTargetHeat,
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
  onUndo,
  canUndo,
}: OrganisationRetinalViewerCardProps) {
  const { t } = useSafeTranslation();
  const [toolkitPos, setToolkitPos] = useState({ x: 0, y: 0 });
  const [isDraggingToolkit, setIsDraggingToolkit] = useState(false);
  const toolkitRef = useRef<HTMLDivElement>(null);

  const handleToolkitDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingToolkit) return;
      setToolkitPos((prev: { x: number; y: number }) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    },
    [isDraggingToolkit]
  );

  const useAnnotationLayer =
    isEditable && onBoxCreate && onBoxUpdate && onBoxDelete && onBoxSelect;

  const manualCount = detectedBoxes.filter((b) => b.source === 'manual').length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden bg-(--bg-secondary) border border-(--border-primary)">
        <div className="px-5 py-4 border-b border-(--border-primary) flex items-center justify-between gap-4 min-h-[72px]">
          <div>
            <p className="text-sm font-semibold text-(--text-primary)">
              {t('Organisation.retinalViewer.title', 'Retinal Viewer')}
            </p>
            <p className="text-xs text-(--text-tertiary)">
              {t(
                'Organisation.retinalViewer.imageCounter',
                'Retinal Scan · Image {{current}}/{{total}}',
                {
                  current: Math.min(selectedImageIndex + 1, images.length),
                  total: images.length,
                }
              )}
              {detectedBoxes.length > 0 && (
                <span className="ml-2">
                  {detectedBoxes.length === 1
                    ? t(
                        'Organisation.retinalViewer.boxCount.one',
                        '· {{count}} box',
                        {
                          count: detectedBoxes.length,
                        }
                      )
                    : t(
                        'Organisation.retinalViewer.boxCount.other',
                        '· {{count}} boxes',
                        {
                          count: detectedBoxes.length,
                        }
                      )}
                  {manualCount > 0 && (
                    <span className="text-indigo-500 dark:text-indigo-400">
                      {' '}
                      {t(
                        'Organisation.retinalViewer.manualCount',
                        '({{count}} manual)',
                        {
                          count: manualCount,
                        }
                      )}
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
                  title={t(
                    'Organisation.retinalViewer.actions.selectEditBoxes',
                    'Select & edit boxes'
                  )}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    annotationMode === 'select'
                      ? 'bg-(--bg-secondary) text-primary shadow-sm'
                      : 'text-(--text-tertiary) hover:text-(--text-primary)'
                  }`}
                >
                  <MousePointer2 className="w-3.5 h-3.5" />
                  {t('Organisation.retinalViewer.actions.select', 'Select')}
                </button>
                <button
                  type="button"
                  onClick={() => onAnnotationModeChange?.('draw')}
                  title={t(
                    'Organisation.retinalViewer.actions.drawNewBox',
                    'Draw new detection box'
                  )}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    annotationMode === 'draw'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-(--text-tertiary) hover:text-(--text-primary)'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  {t('Organisation.retinalViewer.actions.draw', 'Draw')}
                </button>
              </div>
            )}

            {/* Keep action slot width stable to avoid toolbar reflow/jump */}
            {useAnnotationLayer && (
              <div className="flex items-center gap-2 min-w-[190px] justify-end">
                <button
                  type="button"
                  onClick={() => selectedBoxId && onBoxDelete(selectedBoxId)}
                  disabled={!selectedBoxId}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    selectedBoxId
                      ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400'
                      : 'pointer-events-none opacity-0'
                  }`}
                  title={t(
                    'Organisation.retinalViewer.actions.deleteSelectedBox',
                    'Delete selected box'
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('Organisation.retinalViewer.actions.delete', 'Delete')}
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
                {showHighlights
                  ? t(
                      'Organisation.retinalViewer.actions.hideBoxes',
                      'Hide boxes'
                    )
                  : t(
                      'Organisation.retinalViewer.actions.showBoxes',
                      'Show boxes'
                    )}
              </button>
            )}

            {isEditable && onUndo && (
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  canUndo
                    ? 'border-(--border-primary) bg-(--bg-primary) text-(--text-primary) hover:bg-(--bg-tertiary)'
                    : 'opacity-40 cursor-not-allowed border-(--border-primary) bg-(--bg-primary) text-(--text-tertiary)'
                }`}
                title={t('Organisation.retinalViewer.actions.undo', 'Undo')}
              >
                <Undo2 className="w-3.5 h-3.5" />
                {t('Organisation.retinalViewer.actions.undo', 'Undo')}
              </button>
            )}

            {(heatmapUrl || heatmapData) && (
              <div className="flex items-center gap-2 bg-(--bg-primary) border border-(--border-primary) rounded-full px-2 py-1 shadow-sm">
                <button
                  type="button"
                  onClick={onToggleHeatmap}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    showHeatmap
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                  title={
                    showHeatmap
                      ? t(
                          'Organisation.retinalViewer.heatmap.hide',
                          'Hide heatmap'
                        )
                      : t(
                          'Organisation.retinalViewer.heatmap.show',
                          'Show heatmap'
                        )
                  }
                >
                  <Activity className="w-3.5 h-3.5" />
                  {t('Organisation.retinalViewer.heatmap.label', 'Heatmap')}
                </button>

                {showHeatmap && (
                  <div className="flex items-center gap-3 border-l border-(--border-primary) pl-3 h-5">
                    {/* Opacity Slider */}
                    <div
                      className="flex items-center gap-1.5"
                      title={t(
                        'Organisation.retinalViewer.heatmap.opacity',
                        'Opacity'
                      )}
                    >
                      <span className="text-[10px] font-bold text-(--text-tertiary) uppercase tracking-tighter">
                        {t(
                          'Organisation.retinalViewer.heatmap.opacityShort',
                          'Opa'
                        )}
                      </span>
                      <input
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.05"
                        value={heatmapOpacity}
                        onChange={(e) =>
                          setHeatmapOpacity?.(Number(e.target.value))
                        }
                        className="w-12 h-1 accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Threshold Slider */}
                    <div
                      className="flex items-center gap-1.5"
                      title={t(
                        'Organisation.retinalViewer.heatmap.threshold',
                        'Threshold'
                      )}
                    >
                      <span className="text-[10px] font-bold text-(--text-tertiary) uppercase tracking-tighter">
                        {t(
                          'Organisation.retinalViewer.heatmap.thresholdShort',
                          'Thr'
                        )}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="0.9"
                        step="0.05"
                        value={heatmapThreshold}
                        onChange={(e) =>
                          setHeatmapThreshold?.(Number(e.target.value))
                        }
                        className="w-12 h-1 accent-red-500 cursor-pointer"
                      />
                    </div>

                    {isEditable && heatmapData && (
                      <>
                        <div className="w-px h-100 bg-(--border-primary) mx-0.5" />
                        <button
                          type="button"
                          onClick={() =>
                            setHeatmapEditMode?.(
                              heatmapEditMode ? null : 'draw'
                            )
                          }
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                            heatmapEditMode
                              ? 'bg-primary text-white'
                              : 'text-(--text-tertiary) hover:text-primary hover:bg-primary/10'
                          }`}
                        >
                          {heatmapEditMode
                            ? t(
                                'Organisation.retinalViewer.actions.close',
                                'Close'
                              )
                            : t(
                                'Organisation.retinalViewer.heatmap.editTool',
                                'Edit Tool'
                              )}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
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
                alt={t(
                  'Organisation.retinalViewer.image.altRetinalScan',
                  'Retinal scan'
                )}
                className="w-full h-full object-contain"
                onLoad={onImageLoad}
              />

              {/* Heatmap Layer */}
              {showHeatmap && imageLayout && (
                <>
                  {heatmapData ? (
                    <canvas
                      ref={heatmapCanvasRef}
                      onPointerDown={paintHeatmap}
                      onPointerMove={(e) => {
                        if (e.buttons === 1 && paintHeatmap) paintHeatmap(e);
                      }}
                      className="absolute z-10 select-none mix-blend-screen"
                      style={{
                        left: imageLayout.offsetX,
                        top: imageLayout.offsetY,
                        width: imageLayout.width,
                        height: imageLayout.height,
                        opacity: heatmapOpacity ?? 0.42,
                        touchAction: heatmapEditMode ? 'none' : 'auto',
                        pointerEvents: heatmapEditMode ? 'auto' : 'none',
                        cursor: heatmapEditMode ? 'crosshair' : 'default',
                      }}
                    />
                  ) : heatmapUrl ? (
                    <img
                      src={heatmapUrl}
                      alt={t(
                        'Organisation.retinalViewer.image.altHeatmapOverlay',
                        'AI heatmap overlay'
                      )}
                      className="absolute pointer-events-none"
                      style={{
                        left: imageLayout.offsetX,
                        top: imageLayout.offsetY,
                        width: imageLayout.width,
                        height: imageLayout.height,
                        opacity: heatmapOpacity ?? 0.42,
                        mixBlendMode: 'screen',
                      }}
                    />
                  ) : null}

                  {/* Heatmap Brush Toolkit Floating UI */}
                  {heatmapEditMode && isEditable && (
                    <div
                      ref={toolkitRef}
                      onPointerMove={handleToolkitDrag}
                      onPointerUp={() => setIsDraggingToolkit(false)}
                      onPointerLeave={() => setIsDraggingToolkit(false)}
                      style={{
                        transform: `translate(${toolkitPos.x}px, ${toolkitPos.y}px)`,
                      }}
                      className="absolute top-4 right-4 z-50 flex items-center gap-4 px-4 py-2 border border-(--border-primary) bg-(--bg-secondary)/90 rounded-2xl backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 select-none"
                    >
                      {/* Drag Handle */}
                      <div
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setIsDraggingToolkit(true);
                          (e.currentTarget as HTMLElement).setPointerCapture(
                            e.pointerId
                          );
                        }}
                        className="cursor-grab active:cursor-grabbing p-1 -ml-2 text-(--text-tertiary) hover:text-primary transition-colors"
                        title={t(
                          'Organisation.retinalViewer.heatmap.dragToolkit',
                          'Drag toolkit'
                        )}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <circle cx="4" cy="4" r="1.5" />
                          <circle cx="4" cy="8" r="1.5" />
                          <circle cx="4" cy="12" r="1.5" />
                          <circle cx="8" cy="4" r="1.5" />
                          <circle cx="8" cy="8" r="1.5" />
                          <circle cx="8" cy="12" r="1.5" />
                          <circle cx="12" cy="4" r="1.5" />
                          <circle cx="12" cy="8" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                        </svg>
                      </div>

                      {/* Brush Size */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black text-(--text-tertiary) tracking-widest">
                          {t(
                            'Organisation.retinalViewer.heatmap.brushSize',
                            'Size'
                          )}
                        </span>
                        <input
                          type="range"
                          min="1"
                          max="12"
                          step="1"
                          value={brushSize}
                          onChange={(e) =>
                            setBrushSize?.(Number(e.target.value))
                          }
                          className="w-20 h-1 accent-primary cursor-pointer"
                        />
                        <span className="text-[10px] font-bold text-primary w-4">
                          {brushSize}
                        </span>
                      </div>

                      <div className="w-px h-6 bg-(--border-primary)" />

                      {/* Paint Intensity */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-black text-(--text-tertiary) tracking-widest mr-0.5">
                          {t(
                            'Organisation.retinalViewer.heatmap.intensity',
                            'Heat'
                          )}
                        </span>
                        <button
                          onClick={() => {
                            setHeatmapEditMode?.('draw');
                            setBrushTargetHeat?.(1.0);
                          }}
                          className={`w-5 h-5 rounded-full bg-red-600 transition-all ${
                            brushTargetHeat === 1.0 &&
                            heatmapEditMode === 'draw'
                              ? 'ring-2 ring-offset-2 ring-primary scale-110'
                              : 'opacity-40 hover:opacity-100 hover:scale-110'
                          }`}
                          title={t(
                            'Organisation.retinalViewer.heatmap.intensityHigh',
                            'High Intensity (Red)'
                          )}
                        />
                        <button
                          onClick={() => {
                            setHeatmapEditMode?.('draw');
                            setBrushTargetHeat?.(0.7);
                          }}
                          className={`w-5 h-5 rounded-full bg-orange-500 transition-all ${
                            brushTargetHeat === 0.7 &&
                            heatmapEditMode === 'draw'
                              ? 'ring-2 ring-offset-2 ring-primary scale-110'
                              : 'opacity-40 hover:opacity-100 hover:scale-110'
                          }`}
                          title={t(
                            'Organisation.retinalViewer.heatmap.intensityMedium',
                            'Medium Intensity (Orange)'
                          )}
                        />
                        <button
                          onClick={() => {
                            setHeatmapEditMode?.('draw');
                            setBrushTargetHeat?.(0.4);
                          }}
                          className={`w-5 h-5 rounded-full bg-yellow-400 transition-all ${
                            brushTargetHeat === 0.4 &&
                            heatmapEditMode === 'draw'
                              ? 'ring-2 ring-offset-2 ring-primary scale-110'
                              : 'opacity-40 hover:opacity-100 hover:scale-110'
                          }`}
                          title={t(
                            'Organisation.retinalViewer.heatmap.intensityLow',
                            'Low Intensity (Yellow)'
                          )}
                        />
                      </div>

                      <div className="w-px h-6 bg-(--border-primary)" />

                      {/* Eraser and Clear */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setHeatmapEditMode?.('erase')}
                          className={`p-1.5 rounded-lg transition-all ${
                            heatmapEditMode === 'erase'
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-(--bg-primary) text-(--text-secondary) hover:text-primary hover:bg-primary/10'
                          }`}
                          title={t(
                            'Organisation.retinalViewer.heatmap.eraserTool',
                            'Eraser Tool'
                          )}
                        >
                          <Eraser className="w-4 h-4" />
                        </button>
                        <button
                          onClick={onUndo}
                          disabled={!canUndo}
                          className={`p-1.5 rounded-lg transition-all ${
                            canUndo
                              ? 'bg-(--bg-primary) text-(--text-primary) hover:bg-primary/10 hover:text-primary shadow-sm'
                              : 'opacity-40 cursor-not-allowed text-(--text-tertiary)'
                          }`}
                          title={t(
                            'Organisation.retinalViewer.heatmap.undoLastStroke',
                            'Undo last stroke'
                          )}
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setHeatmapData?.((prev) =>
                              prev ? prev.map((r) => r.map(() => 0)) : null
                            );
                            setHasHeatmapEdits?.(true);
                          }}
                          className="px-2 py-1 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all text-[9px] uppercase font-black"
                        >
                          {t(
                            'Organisation.retinalViewer.heatmap.clear',
                            'Clear'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
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
