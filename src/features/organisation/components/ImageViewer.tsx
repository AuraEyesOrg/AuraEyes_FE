import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import type {
  Anomaly,
  RetinalImage,
  ToggleState,
} from '@/features/organisation/types/retinal.types';

interface ImageViewerProps {
  toggles: ToggleState;
  zoomLevel: number;
  anomalies: Anomaly[];
  isAnalyzing: boolean;
  currentImage?: RetinalImage | null;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  toggles,
  zoomLevel,
  anomalies,
  isAnalyzing,
  currentImage,
}) => {
  const defaultImageUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAnZvlMnDS-CcafTkkjgVLz-0UddpNaBx3OsGxIO9zGXC9fp7Xcw_1SoKlkYiy7zNvYBqtRA86b0wkhPKl9mX-MPsS7JyyMvW5eklHCPWjWy_hdxnGKOfLpWcKa1TvNvRs2wBtJzkygxKDBLqzveve9FQ-CH5A0ZR2TUS5U1KIWHEXQIs-lMeoR4Vx0jsbZlr095MuZggI7VU6BetlAaUJ6cCo_VHXoG5BRAPPmnS-xb7dR8aU3buiURokmF5U3L7W6KKyRilnvR6x4';
  const imageUrl = currentImage?.url || defaultImageUrl;
  const imageName = currentImage?.name || 'Fundus photograph';

  return (
    <section className="flex-1 relative bg-[#0a1929] dark:bg-[#0a1929] light:bg-gray-100 flex items-center justify-center overflow-hidden cursor-move select-none">
      {/* Grid Background Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(45, 74, 111, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 74, 111, 0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      {/* Image Container with Transforms */}
      <div
        className="relative max-w-full max-h-full p-10 transition-transform duration-200 ease-out origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <div className="relative rounded-full overflow-hidden shadow-2xl border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 group">
          <img
            src={imageUrl}
            alt={imageName}
            className="block max-h-[80vh] w-auto object-contain opacity-90"
          />

          {/* Real-time Scanning Effect */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#13ecec]/80 shadow-[0_0_15px_rgba(19,236,236,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
              <div className="absolute inset-0 bg-[#13ecec]/5 animate-pulse"></div>
            </div>
          )}

          {/* Dynamic AI Annotation Overlays */}
          {anomalies.map((anomaly, index) => {
            // Check if this anomaly type is toggled on
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

            return (
              <React.Fragment key={anomaly.id}>
                <div
                  className={`absolute border-2 rounded-lg pointer-events-none animate-in fade-in zoom-in duration-500`}
                  style={{
                    top: `${anomaly.location.y}%`,
                    left: `${anomaly.location.x}%`,
                    width: `${anomaly.location.width}%`,
                    height: `${anomaly.location.height}%`,
                    borderColor:
                      anomaly.type === 'warning'
                        ? '#ef4444'
                        : anomaly.type === 'priority_high'
                          ? '#facc15'
                          : '#3b82f6',
                    backgroundColor:
                      anomaly.type === 'warning'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : anomaly.type === 'priority_high'
                          ? 'rgba(250, 204, 21, 0.1)'
                          : 'rgba(59, 130, 246, 0.1)',
                    animationDelay: `${index * 200}ms`,
                    animationFillMode: 'both',
                  }}
                ></div>
                <div
                  className="absolute flex items-center gap-1 bg-black/80 backdrop-blur-sm border px-2 py-1 rounded text-xs z-10 whitespace-nowrap shadow-lg transition-opacity duration-300 hover:opacity-100 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{
                    top: `${anomaly.location.y - 5}%`,
                    left: `${anomaly.location.x}%`,
                    borderColor:
                      anomaly.type === 'warning'
                        ? '#ef4444'
                        : anomaly.type === 'priority_high'
                          ? '#facc15'
                          : '#3b82f6',
                    color:
                      anomaly.type === 'warning'
                        ? '#fecaca'
                        : anomaly.type === 'priority_high'
                          ? '#fef08a'
                          : '#bfdbfe',
                    animationDelay: `${index * 200 + 100}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  {anomaly.type === 'warning' ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {anomaly.name} ({anomaly.confidence}%)
                </div>
              </React.Fragment>
            );
          })}

          {/* Static Vessel Segmentation Layer */}
          {toggles.vesselSegmentation && (
            <div className="absolute inset-0 bg-[#13ecec]/10 mix-blend-overlay pointer-events-none animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Floating Scale Bar */}
      <div className="absolute bottom-6 left-6 bg-black/80 dark:bg-black/80 light:bg-white/90 backdrop-blur text-xs text-white dark:text-white light:text-gray-900 px-3 py-1.5 rounded border border-white/20 dark:border-white/20 light:border-gray-300 flex items-center gap-2 pointer-events-none shadow-lg">
        <span>Scale: {zoomLevel.toFixed(1)}x</span>
        <div className="w-20 h-1 bg-white/50 dark:bg-white/50 light:bg-gray-400 relative">
          <div className="absolute left-0 top-0 h-full w-px bg-white dark:bg-white light:bg-gray-600"></div>
          <div className="absolute right-0 top-0 h-full w-px bg-white dark:bg-white light:bg-gray-600"></div>
        </div>
        <span>200µm</span>
      </div>

      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default ImageViewer;
