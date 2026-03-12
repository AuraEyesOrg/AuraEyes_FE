import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ToggleState, Anomaly, RetinalImage } from '../types/type';
import { AlertTriangle, Info } from 'lucide-react';

interface ImageViewerProps {
  toggles: ToggleState;
  zoomLevel: number;
  anomalies: Anomaly[];
  isAnalyzing: boolean;
  currentImage?: RetinalImage | null;
  showHighlights?: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  toggles,
  anomalies,
  isAnalyzing,
  currentImage,
  showHighlights = false,
}) => {
  const defaultImageUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAnZvlMnDS-CcafTkkjgVLz-0UddpNaBx3OsGxIO9zGXC9fp7Xcw_1SoKlkYiy7zNvYBqtRA86b0wkhPKl9mX-MPsS7JyyMvW5eklHCPWjWy_hdxnGKOfLpWcKa1TvNvRs2wBtJzkygxKDBLqzveve9FQ-CH5A0ZR2TUS5U1KIWHEXQIs-lMeoR4Vx0jsbZlr095MuZggI7VU6BetlAaUJ6cCo_VHXoG5BRAPPmnS-xb7dR8aU3buiURokmF5U3L7W6KKyRilnvR6x4';
  const imageUrl = currentImage?.url || defaultImageUrl;
  const imageName = currentImage?.name || 'Your retinal scan';

  // Track the rendered image rect so annotations align perfectly
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgRect, setImgRect] = useState<{
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  } | null>(null);

  const updateImgRect = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const nw = img.naturalWidth || 1;
    const nh = img.naturalHeight || 1;

    // Replicate object-contain math
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
        labelBg: 'rgba(220, 38, 38, 0.92)',
        icon: <AlertTriangle className="w-3 h-3 text-white" />,
        glow: true,
      };
    if (type === 'warning')
      return {
        border: 'rgba(239, 68, 68, 0.7)',
        bg: 'rgba(239, 68, 68, 0.12)',
        labelBg: 'rgba(30, 30, 30, 0.85)',
        icon: <AlertTriangle className="w-3 h-3 text-red-400" />,
        glow: false,
      };
    if (type === 'priority_high')
      return {
        border: 'rgba(251, 191, 36, 0.7)',
        bg: 'rgba(251, 191, 36, 0.1)',
        labelBg: 'rgba(30, 30, 30, 0.85)',
        icon: <Info className="w-3 h-3 text-amber-400" />,
        glow: false,
      };
    return {
      border: 'rgba(96, 165, 250, 0.6)',
      bg: 'rgba(96, 165, 250, 0.08)',
      labelBg: 'rgba(30, 30, 30, 0.85)',
      icon: <Info className="w-3 h-3 text-blue-400" />,
      glow: false,
    };
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Image — fills the container with object-contain */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt={imageName}
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

      {/* AI highlight annotations — positioned relative to the actual rendered image */}
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
                {/* Rectangle border — glowing pulse for highest confidence */}
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
                {/* Text label */}
                <div
                  className="absolute left-0 bottom-full mb-1.5 flex items-center gap-1 px-2 py-1 rounded-md text-white text-xs font-medium whitespace-nowrap shadow-md"
                  style={{ backgroundColor: style.labelBg }}
                >
                  {style.icon}
                  <span>{anomaly.friendlyName || anomaly.name}</span>
                </div>
              </div>
            );
          })}
        </div>
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
