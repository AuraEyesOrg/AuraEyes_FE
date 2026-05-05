import React, { useState } from 'react';
import {
  ChevronUp,
  Images,
  Upload,
  CloudUpload,
  Plus,
  AlertTriangle,
  Check,
  Clock,
  X,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import type { RetinalImage } from '@/features/organisation/types/retinal.types';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface ImageGalleryProps {
  images: RetinalImage[];
  selectedImageId: string | null;
  onSelectImage: (imageId: string) => void;
  onUploadImages: (files: FileList) => void;
  onRemoveImage: (imageId: string) => void;
  isUploading: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  selectedImageId,
  onSelectImage,
  onUploadImages,
  onRemoveImage,
  isUploading,
}) => {
  const { t } = useSafeTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadImages(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadImages(e.target.files);
    }
  };

  return (
    <div
      className={`w-full bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-white border-t border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200 transition-all duration-300`}
    >
      {/* Compact Header Bar - Always visible */}
      <div
        className="flex items-center justify-between px-4 py-1.5 cursor-pointer hover:bg-[#1e3a5f]/20 dark:hover:bg-[#1e3a5f]/20 light:hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors">
            <ChevronUp
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 text-[#13ecec]" />
            <span className="text-xs font-medium text-white dark:text-white light:text-gray-900">
              {images.length === 1
                ? t('Organisation.imageGallery.count.one', '{{count}} Image', {
                    count: images.length,
                  })
                : t(
                    'Organisation.imageGallery.count.other',
                    '{{count}} Images',
                    {
                      count: images.length,
                    }
                  )}
            </span>
          </div>

          {/* Mini status indicators */}
          <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-400 light:text-gray-600">
            {images.filter((img) => img.analyzed && img.anomalies.length === 0)
              .length > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                {
                  images.filter(
                    (img) => img.analyzed && img.anomalies.length === 0
                  ).length
                }
              </span>
            )}
            {images.filter((img) => img.analyzed && img.anomalies.length > 0)
              .length > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                {
                  images.filter(
                    (img) => img.analyzed && img.anomalies.length > 0
                  ).length
                }
              </span>
            )}
            {images.filter((img) => !img.analyzed).length > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                {images.filter((img) => !img.analyzed).length}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mini thumbnails preview when collapsed */}
          {!isExpanded && images.length > 0 && (
            <div className="flex items-center gap-1 mr-2">
              {images.slice(0, 5).map((image) => (
                <div
                  key={image.id}
                  className={`w-6 h-6 rounded overflow-hidden border ${
                    selectedImageId === image.id
                      ? 'border-[#13ecec]'
                      : 'border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300'
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
              {images.length > 5 && (
                <span className="text-[10px] text-gray-400 dark:text-gray-400 light:text-gray-600">
                  +{images.length - 5}
                </span>
              )}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className="flex items-center gap-1 px-2 py-1 bg-[#13ecec]/20 hover:bg-[#13ecec]/30 text-[#13ecec] text-[10px] font-medium rounded border border-[#13ecec]/30 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            {t('Organisation.imageGallery.actions.upload', 'Upload')}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Expandable Thumbnails Strip */}
      {isExpanded && (
        <div
          className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#2d4a6f] dark:scrollbar-thumb-[#2d4a6f] light:scrollbar-thumb-gray-300 scrollbar-track-transparent border-t border-[#2d4a6f]/50 dark:border-[#2d4a6f]/50 light:border-gray-200 animate-in slide-in-from-top-2 duration-200"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {images.length === 0 ? (
            <div
              className="flex-1 min-h-[60px] border border-dashed border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 rounded flex items-center justify-center gap-2 text-gray-400 dark:text-gray-400 light:text-gray-600 hover:border-[#13ecec]/50 hover:text-[#13ecec] transition-colors cursor-pointer text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload className="w-5 h-5" />
              <span>
                {t(
                  'Organisation.imageGallery.dropzone.hint',
                  'Drop images or click to upload'
                )}
              </span>
            </div>
          ) : (
            <>
              {images.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => onSelectImage(image.id)}
                  className={`relative flex-none w-14 h-14 rounded overflow-hidden cursor-pointer group transition-all duration-200 ${
                    selectedImageId === image.id
                      ? 'ring-2 ring-[#13ecec] ring-offset-1 ring-offset-[#0a1f44] dark:ring-offset-[#0a1f44] light:ring-offset-white'
                      : 'ring-1 ring-[#2d4a6f] dark:ring-[#2d4a6f] light:ring-gray-300 hover:ring-[#13ecec]/50'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Index */}
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white font-medium">
                      {index + 1}
                    </span>
                  </div>

                  {/* Status */}
                  <div
                    className={`absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      image.analyzed
                        ? image.anomalies.length > 0
                          ? 'bg-yellow-500/80'
                          : 'bg-green-500/80'
                        : 'bg-gray-500/80'
                    }`}
                  >
                    {image.analyzed ? (
                      image.anomalies.length > 0 ? (
                        <AlertTriangle className="w-2 h-2 text-white" />
                      ) : (
                        <Check className="w-2 h-2 text-white" />
                      )
                    ) : (
                      <Clock className="w-2 h-2 text-white" />
                    )}
                  </div>

                  {/* Remove button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(image.id);
                    }}
                    className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-red-500/80 rounded-full items-center justify-center hidden group-hover:flex hover:bg-red-500"
                  >
                    <X className="w-2 h-2 text-white" />
                  </button>
                </div>
              ))}

              {/* Add More */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-none w-14 h-14 border border-dashed border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 dark:text-gray-400 light:text-gray-600 hover:border-[#13ecec]/50 hover:text-[#13ecec] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </div>
            </>
          )}

          {isUploading && (
            <div className="flex-none w-14 h-14 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 rounded flex items-center justify-center bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-gray-50">
              <Spinner size={16} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
