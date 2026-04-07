import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ToggleState, Anomaly, RetinalImage } from '../types/type';

interface ImageViewerProps {
  toggles: ToggleState;
  zoomLevel: number;
  anomalies: Anomaly[];
  isAnalyzing: boolean;
  currentImage: RetinalImage | null;
  showHighlights: boolean;
  showHeatmap?: boolean;
  heatmapUrl?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  toggles,
  anomalies,
  isAnalyzing,
  currentImage,
  showHighlights = false,
  showHeatmap = false,
  heatmapUrl,
}) => {
  // Always call hooks first before any conditional rendering
  const [imgRect, setImgRect] = useState<{
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  } | null>(null);

  // Image and container references
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Function to update image dimensions and position
  const updateImgRect = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const nw = img.naturalWidth || 1;
    const nh = img.naturalHeight || 1;

    // Replicate object-contain math for scaling image
    const scale = Math.min(cw / nw, ch / nh);
    const rw = nw * scale;
    const rh = nh * scale;

    setImgRect({
      offsetX: (cw - rw) / 2,
      offsetY: (ch - rh) / 2,
      width: rw,
      height: rh,
    });
  }, []);

  useEffect(() => {
    updateImgRect();
    window.addEventListener('resize', updateImgRect);
    return () => window.removeEventListener('resize', updateImgRect);
  }, [updateImgRect]);

  const getAnnotationStyle = (type: string, isHighest?: boolean) => {
    if (isHighest)
      return {
        border: 'rgba(239, 68, 68, 0.9)',
        bg: 'rgba(239, 68, 68, 0.15)',
        glow: true,
      };
    if (type === 'warning')
      return {
        border: 'rgba(239, 68, 68, 0.7)',
        bg: 'rgba(239, 68, 68, 0.12)',
        glow: false,
      };
    if (type === 'priority_high')
      return {
        border: 'rgba(251, 191, 36, 0.7)',
        bg: 'rgba(251, 191, 36, 0.1)',
        glow: false,
      };
    return {
      border: 'rgba(96, 165, 250, 0.6)',
      bg: 'rgba(96, 165, 250, 0.08)',
      glow: false,
    };
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Image */}
      <img
        ref={imgRef}
        src={currentImage?.url || 'defaultImageUrl'}
        alt={currentImage?.name || 'Your retinal scan'}
        className="w-full h-full object-contain"
        draggable={false}
        onLoad={updateImgRect}
      />

      {/* Scanning animation during analysis */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-80 animate-[scan_2.5s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-teal-400/5 animate-pulse" />
        </div>
      )}

      {/* Annotations */}
      {showHighlights && imgRect && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: imgRect.offsetX,
            top: imgRect.offsetY,
            width: imgRect.width,
            height: imgRect.height,
          }}
        >
          {anomalies.map((anomaly) => {
            const isVisible =
              (anomaly.name.toLowerCase().includes('hemorrhage') &&
                toggles.hemorrhages) ||
              (anomaly.name.toLowerCase().includes('aneurysm') &&
                toggles.hemorrhages) ||
              (anomaly.name.toLowerCase().includes('exudate') &&
                toggles.exudates) ||
              (!anomaly.name.toLowerCase().includes('hemorrhage') &&
                !anomaly.name.toLowerCase().includes('aneurysm') &&
                !anomaly.name.toLowerCase().includes('exudate'));

            if (!isVisible || !anomaly.location) return null;

            const style = getAnnotationStyle(anomaly.type, anomaly.isHighest);

            return (
              <div
                key={anomaly.id}
                className="absolute pointer-events-none"
                style={{
                  top: `${anomaly.location.y}%`,
                  left: `${anomaly.location.x}%`,
                  width: `${anomaly.location.width}%`,
                  height: `${anomaly.location.height}%`,
                }}
              >
                <div
                  className={`absolute inset-0 rounded-md border-2 transition-opacity duration-500 ${
                    style.glow
                      ? 'animate-[glow-pulse_2s_ease-in-out_infinite]'
                      : ''
                  }`}
                  style={{
                    borderColor: style.border,
                    backgroundColor: style.bg,
                    ...(style.glow
                      ? {
                          boxShadow: `0 0 12px 2px ${style.border}, inset 0 0 8px 1px ${style.bg}`,
                          borderWidth: '3px',
                        }
                      : {}),
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Heatmap Overlay */}
      {showHeatmap && heatmapUrl && (
        <img
          src={heatmapUrl}
          alt="Heatmap overlay"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{
            opacity: 0.42,
            mixBlendMode: 'screen',
            zIndex: 20,
          }}
        />
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px 2px rgba(239,68,68,0.6), inset 0 0 8px 1px rgba(239,68,68,0.15); }
          50% { opacity: 0.85; box-shadow: 0 0 20px 6px rgba(239,68,68,0.45), inset 0 0 12px 3px rgba(239,68,68,0.1); }
        }
      `}</style>
    </div>
  );
};

export default ImageViewer;
