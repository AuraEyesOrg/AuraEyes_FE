import React from 'react';
import { RetinalImage } from '../types/type';
import {
  ChevronUp,
  Images,
  AlertTriangle,
  Check,
  Clock,
  Eye,
} from 'lucide-react';

interface ReadOnlyImageGalleryProps {
  images: RetinalImage[];
  selectedImageId: string | null;
  onSelectImage: (imageId: string) => void;
}

const ReadOnlyImageGallery: React.FC<ReadOnlyImageGalleryProps> = ({
  images,
  selectedImageId,
  onSelectImage,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const analyzedCount = images.filter((img) => img.analyzed).length;
  const withIssuesCount = images.filter(
    (img) => img.analyzed && img.anomalies.length > 0
  ).length;
  const pendingCount = images.filter((img) => !img.analyzed).length;

  return (
    <div className="w-full bg-[var(--bg-secondary)] border-t border-[var(--border-color)] transition-all duration-300">
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-[var(--bg-tertiary)]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <ChevronUp
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`}
            />
          </button>

          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-brand" />
            <span className="text-sm font-bold text-[var(--text-primary)]">
              Uploaded Images ({images.length})
            </span>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4 text-xs font-medium">
            {analyzedCount > 0 && withIssuesCount === 0 && (
              <span className="flex items-center gap-1.5 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                {analyzedCount} analyzed
              </span>
            )}
            {withIssuesCount > 0 && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {withIssuesCount} with findings
              </span>
            )}
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>

        {/* Mini thumbnails when collapsed */}
        {!isExpanded && images.length > 0 && (
          <div className="flex items-center gap-2">
            {images.slice(0, 6).map((image) => (
              <div
                key={image.id}
                className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedImageId === image.id
                    ? 'border-brand'
                    : 'border-[var(--border-color)] hover:border-brand/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectImage(image.id);
                }}
              >
                <img
                  src={image.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {images.length > 6 && (
              <span className="text-xs text-[var(--text-muted)] font-medium">
                +{images.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded Thumbnails Strip */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-[var(--border-color)]/50 overflow-x-auto">
          <div className="flex items-center gap-4">
            {images.length === 0 ? (
              <div className="flex-1 py-8 text-center text-[var(--text-muted)]">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No images available</p>
              </div>
            ) : (
              images.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => onSelectImage(image.id)}
                  className={`relative flex-none group cursor-pointer transition-all duration-200 ${
                    selectedImageId === image.id
                      ? 'scale-105'
                      : 'hover:scale-105'
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className={`w-20 h-20 rounded-xl overflow-hidden transition-all ${
                      selectedImageId === image.id
                        ? 'ring-3 ring-brand ring-offset-2 ring-offset-[var(--bg-secondary)]'
                        : 'ring-1 ring-[var(--border-color)] hover:ring-brand/50'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Index badge */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-[var(--text-primary)]">
                      {index + 1}
                    </span>
                  </div>

                  {/* Status indicator */}
                  <div
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
                      image.analyzed
                        ? image.anomalies.length > 0
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                        : 'bg-gray-500'
                    }`}
                  >
                    {image.analyzed ? (
                      image.anomalies.length > 0 ? (
                        <AlertTriangle className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )
                    ) : (
                      <Clock className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>

                  {/* Eye label */}
                  <div className="mt-2 text-center">
                    <p className="text-[10px] font-medium text-[var(--text-primary)] truncate max-w-[80px]">
                      {image.eye.includes('Left') ? 'OS' : 'OD'}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)] truncate max-w-[80px]">
                      {image.name}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadOnlyImageGallery;
