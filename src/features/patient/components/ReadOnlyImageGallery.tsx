import React from 'react';
import { RetinalImage } from '../types/type';
import { Check, Clock } from 'lucide-react';

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
  return (
    <div className="flex-shrink-0 py-3">
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => onSelectImage(image.id)}
            className={`relative flex-none group transition-all duration-150 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
              selectedImageId === image.id ? 'scale-105' : 'hover:scale-105'
            }`}
          >
            {/* Thumbnail */}
            <div
              className={`w-16 h-16 rounded-xl overflow-hidden transition-all ${
                selectedImageId === image.id
                  ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-50'
                  : 'ring-1 ring-slate-200 hover:ring-slate-300'
              }`}
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Status badge */}
            <div
              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white ${
                image.analyzed ? 'bg-emerald-400' : 'bg-slate-300'
              }`}
            >
              {image.analyzed ? (
                <Check className="w-2.5 h-2.5 text-white" />
              ) : (
                <Clock className="w-2.5 h-2.5 text-white" />
              )}
            </div>

            {/* Eye label */}
            <p className="mt-1.5 text-[10px] font-medium text-slate-500 text-center">
              {image.eye.includes('Left') ? 'Left' : 'Right'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReadOnlyImageGallery;
