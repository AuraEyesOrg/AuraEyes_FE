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
  heatmapData?: number[][] | null;
  heatmapOpacity?: number;
  heatmapThreshold?: number;
}

const HEATMAP_DEFAULT_OPACITY = 0.55;
const HEATMAP_DEFAULT_THRESHOLD = 0.15;

const ImageViewer: React.FC<ImageViewerProps> = ({
  toggles,
  anomalies,
  isAnalyzing,
  currentImage,
  showHighlights = false,
  showHeatmap = false,
  heatmapUrl,
  heatmapData = null,
  heatmapOpacity = HEATMAP_DEFAULT_OPACITY,
  heatmapThreshold = HEATMAP_DEFAULT_THRESHOLD,
}) => {
  const [imgRect, setImgRect] = useState<{
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);

  const updateImgRect = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // Must have natural dimensions — guard against 0
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;

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

  // Re-run on image src change
  useEffect(() => {
    setImgRect(null);
  }, [currentImage?.url]);

  useEffect(() => {
    window.addEventListener('resize', updateImgRect);
    return () => window.removeEventListener('resize', updateImgRect);
  }, [updateImgRect]);

  // Also observe container size changes (e.g. sidebar toggle, panel resize)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => updateImgRect());
    ro.observe(container);
    return () => ro.disconnect();
  }, [updateImgRect]);

  // Render heatmap_data matrix onto canvas using JET colormap (matches ophthalmologist view)
  useEffect(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas || !heatmapData || heatmapData.length === 0) return;
    const rows = heatmapData.length;
    const cols = heatmapData[0]?.length ?? 0;
    if (cols === 0) return;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cols, rows);
    const imageData = ctx.createImageData(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = Math.max(0, Math.min(1, heatmapData[r]?.[c] ?? 0));
        const idx = (r * cols + c) * 4;
        if (v <= heatmapThreshold) {
          imageData.data[idx + 3] = 0;
        } else {
          const nv = (v - heatmapThreshold) / (1 - heatmapThreshold);
          const r4 = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 3)));
          const g4 = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 2)));
          const b4 = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * nv - 1)));
          const alpha = Math.min(
            255,
            Math.max(0, Math.round((0.3 + 0.7 * nv) * 255))
          );
          imageData.data[idx] = Math.round(r4 * 255);
          imageData.data[idx + 1] = Math.round(g4 * 255);
          imageData.data[idx + 2] = Math.round(b4 * 255);
          imageData.data[idx + 3] = alpha;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    // showHeatmap in deps ensures the effect re-runs after the canvas mounts
  }, [heatmapData, heatmapThreshold, showHeatmap]);

  const hasHeatmapMatrix = heatmapData != null && heatmapData.length > 0;

  const getAnnotationStyle = (type: string, isHighest?: boolean) => {
    if (isHighest)
      return {
        border: 'rgba(239, 68, 68, 0.9)',
        bg: 'rgba(239, 68, 68, 0.12)',
        glow: true,
      };
    if (type === 'warning')
      return {
        border: 'rgba(239, 68, 68, 0.65)',
        bg: 'rgba(239, 68, 68, 0.08)',
        glow: false,
      };
    if (type === 'priority_high')
      return {
        border: 'rgba(251, 191, 36, 0.7)',
        bg: 'rgba(251, 191, 36, 0.08)',
        glow: false,
      };
    return {
      border: 'rgba(96, 165, 250, 0.6)',
      bg: 'rgba(96, 165, 250, 0.06)',
      glow: false,
    };
  };

  return (
    // KEY FIX: relative + explicit w-full h-full so offsetX/Y math is stable
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black rounded-2xl"
    >
      {/* Base retinal image */}
      <img
        ref={imgRef}
        src={currentImage?.url || ''}
        alt={currentImage?.name || 'Retinal scan'}
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
        // onLoad is the authoritative trigger — naturalWidth is guaranteed here
        onLoad={updateImgRect}
      />

      {/* Heatmap overlay — canvas (matrix) takes priority over static URL */}
      {showHeatmap && hasHeatmapMatrix && imgRect && (
        <canvas
          ref={heatmapCanvasRef}
          className="absolute pointer-events-none"
          style={{
            left: imgRect.offsetX,
            top: imgRect.offsetY,
            width: imgRect.width,
            height: imgRect.height,
            opacity: heatmapOpacity,
            mixBlendMode: 'normal',
            zIndex: 15,
          }}
        />
      )}
      {showHeatmap && !hasHeatmapMatrix && heatmapUrl && imgRect && (
        <img
          src={heatmapUrl}
          alt="AI heatmap overlay"
          className="absolute pointer-events-none"
          style={{
            left: imgRect.offsetX,
            top: imgRect.offsetY,
            width: imgRect.width,
            height: imgRect.height,
            opacity: 0.5,
            mixBlendMode: 'screen',
            zIndex: 15,
          }}
        />
      )}

      {/* BBox annotations — positioned in the same imgRect coordinate space */}
      {showHighlights && imgRect && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: imgRect.offsetX,
            top: imgRect.offsetY,
            width: imgRect.width,
            height: imgRect.height,
            zIndex: 20,
          }}
        >
          {anomalies.map((anomaly) => {
            if (!anomaly.location) return null;

            // Toggle filtering
            const name = anomaly.name.toLowerCase();
            const isVisible =
              ((name.includes('hemorrhage') || name.includes('aneurysm')) &&
                toggles.hemorrhages) ||
              (name.includes('exudate') && toggles.exudates) ||
              (!name.includes('hemorrhage') &&
                !name.includes('aneurysm') &&
                !name.includes('exudate'));

            if (!isVisible) return null;

            const style = getAnnotationStyle(anomaly.type, anomaly.isHighest);
            const { x, y, width, height } = anomaly.location;

            return (
              <div
                key={anomaly.id}
                className="absolute"
                style={{
                  top: `${y}%`,
                  left: `${x}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
              >
                <div
                  className={`absolute inset-0 rounded-md border-2 ${
                    style.glow
                      ? 'animate-[glow-pulse_2s_ease-in-out_infinite]'
                      : ''
                  }`}
                  style={{
                    borderColor: style.border,
                    backgroundColor: style.bg,
                    ...(style.glow
                      ? {
                          boxShadow: `0 0 12px 2px ${style.border}, inset 0 0 8px 1px rgba(239,68,68,0.1)`,
                          borderWidth: '2.5px',
                        }
                      : {}),
                  }}
                />
                {/* Label chip at top-left of box */}
                {anomaly.isHighest && (
                  <span
                    className="absolute -top-5 left-0 text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
                    style={{ background: style.border }}
                  >
                    {anomaly.friendlyName ?? anomaly.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Scan animation during analysis */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-80 animate-[scan_2.5s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-teal-400/5 animate-pulse" />
        </div>
      )}

      <style>{`
        @keyframes scan {
          0%   { top: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes glow-pulse {
          0%,100% { opacity: 1;    box-shadow: 0 0 12px 2px rgba(239,68,68,0.55), inset 0 0 8px 1px rgba(239,68,68,0.12); }
          50%      { opacity: 0.8; box-shadow: 0 0 22px 6px rgba(239,68,68,0.4),  inset 0 0 14px 3px rgba(239,68,68,0.08); }
        }
      `}</style>
    </div>
  );
};

export default ImageViewer;
