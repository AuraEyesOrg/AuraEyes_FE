import { Activity, Eye, Loader2, ScanEye } from 'lucide-react';
import type { RefObject } from 'react';
import { getDetectionStyle } from '@/features/organisation/utils/screening-result.util';
import type {
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
}: OrganisationRetinalViewerCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden bg-(--bg-secondary) border border-(--border-primary)">
        <div className="px-5 py-4 border-b border-(--border-primary) flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-(--text-primary)">
              Retinal Viewer
            </p>
            <p className="text-xs text-(--text-tertiary)">
              {selectedImage?.eyeSide ?? 'Unknown eye'} · Image{' '}
              {Math.min(selectedImageIndex + 1, images.length)}/{images.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
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

            {analyzing ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI scanner
                active
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-(--border-primary) bg-(--bg-primary) px-3 py-1 text-xs font-medium text-(--text-secondary)">
                <ScanEye className="w-3.5 h-3.5" /> Ready for review
              </span>
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

              {showHighlights && detectedBoxes.length > 0 && imageLayout && (
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
                          }}
                        />
                        <div
                          className={`absolute left-0 bottom-full mb-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${style.labelClass}`}
                        >
                          {box.localizedName} ({box.confidence}%)
                        </div>
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
