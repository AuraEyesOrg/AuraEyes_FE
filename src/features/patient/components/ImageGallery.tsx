import React, { useState, useEffect, useCallback } from 'react';
import { RetinalImage } from '../types/type';
import {
  ChevronUp,
  Images,
  CloudUpload,
  AlertTriangle,
  Check,
  Clock,
} from 'lucide-react';

interface ImageGalleryProps {
  images: RetinalImage[];
  selectedImageId: string | null;
  onSelectImage: (imageId: string) => void;
  onRemoveImage: (imageId: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  selectedImageId,
  onSelectImage,
  onRemoveImage,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);

  // Convert File to FileList-like for the callback
  const createFileList = useCallback((files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  }, []);

  // Handle paste from clipboard
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!isExpanded) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
      }
    },
    [isExpanded, createFileList]
  );

  // Add paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle global drag events for better UX
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        setIsExpanded(true);
      }
    };

    document.addEventListener('dragenter', handleGlobalDragEnter);
    return () =>
      document.removeEventListener('dragenter', handleGlobalDragEnter);
  }, []);

  return (
    <div
      className={`w-full bg-[#182626] border-t border-[#283939] transition-all duration-300`}
    >
      {/* Compact Header Bar - Always visible */}
      <div
        className="flex items-center justify-between px-4 py-1.5 cursor-pointer hover:bg-[#283939]/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-[#9db9b9] hover:text-white transition-colors">
            <ChevronUp
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 text-[#13ecec]" />
            <span className="text-xs font-medium text-white">
              {images.length} {images.length === 1 ? 'Image' : 'Images'}
            </span>
          </div>

          {/* Mini status indicators */}
          <div className="flex items-center gap-3 text-[10px] text-[#9db9b9]">
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
                      : 'border-[#283939]'
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
                <span className="text-[10px] text-[#9db9b9]">
                  +{images.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      {/* Expandable Thumbnails Strip */}
      {isExpanded && (
        <div
          ref={dropZoneRef}
          className={`flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#283939] scrollbar-track-transparent border-t border-[#283939]/50 animate-in slide-in-from-top-2 duration-200 transition-all ${
            isDragging ? 'bg-[#13ecec]/10 border-[#13ecec]/30' : ''
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag overlay indicator */}
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#182626]/90 border-2 border-dashed border-[#13ecec] rounded-lg z-10 pointer-events-none">
              <div className="flex flex-col items-center gap-2 text-[#13ecec]">
                <CloudUpload className="w-8 h-8 animate-bounce" />
                <span className="text-sm font-medium">Drop images here</span>
              </div>
            </div>
          )}

          {images.length === 0 ? (
            <div
              className={`flex-1 min-h-[60px] border border-dashed rounded flex items-center justify-center gap-2 hover:border-[#13ecec]/50 hover:text-[#13ecec] transition-colors cursor-pointer text-xs ${
                isDragging
                  ? 'border-[#13ecec] text-[#13ecec] bg-[#13ecec]/10'
                  : 'border-[#283939] text-[#9db9b9]'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload className="w-5 h-5" />
              <span>Drop images, paste from clipboard, or click to upload</span>
            </div>
          ) : (
            <>
              {images.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => onSelectImage(image.id)}
                  className={`relative flex-none w-14 h-14 rounded overflow-hidden cursor-pointer group transition-all duration-200 ${
                    selectedImageId === image.id
                      ? 'ring-2 ring-[#13ecec] ring-offset-1 ring-offset-[#182626]'
                      : 'ring-1 ring-[#283939] hover:ring-[#13ecec]/50'
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
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
