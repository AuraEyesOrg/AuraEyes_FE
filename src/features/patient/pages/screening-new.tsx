import { useState, useRef } from 'react';
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image,
  Trash2,
  ZoomIn,
  Download,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    heatmapUrl?: string;
  };
}

export default function ScreeningPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null
  );
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      ['image/jpeg', 'image/png', 'application/dicom'].includes(file.type)
    );

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newImages: UploadedImage[] = files.map((file) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0,
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Simulate upload and analysis for each image
    newImages.forEach((img) => {
      simulateUploadAndAnalysis(img.id);
    });
  };

  const simulateUploadAndAnalysis = (imageId: string) => {
    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);

        // Update to processing status
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, status: 'processing', progress: 100 }
              : img
          )
        );

        // Simulate analysis
        setTimeout(() => {
          const riskLevels: ('low' | 'medium' | 'high' | 'critical')[] = [
            'low',
            'medium',
            'high',
          ];
          setImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? {
                    ...img,
                    status: 'completed',
                    result: {
                      riskLevel:
                        riskLevels[
                          Math.floor(Math.random() * riskLevels.length)
                        ],
                      confidence: 85 + Math.random() * 10,
                      heatmapUrl: img.preview, // In real app, this would be the heatmap URL
                    },
                  }
                : img
            )
          );
        }, 2000);
      } else {
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, progress: Math.min(progress, 99) }
              : img
          )
        );
      }
    }, 200);
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <PatientLayout userName="John Doe">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Retinal Image Screening
        </h1>
        <p className="text-gray-400">
          Upload your retinal images for AI-powered analysis. Supported formats:
          JPG, PNG, DICOM (Max 10MB per file)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Area */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Upload Retinal Images
            </h2>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-[#2d4a6f] hover:border-primary/50 hover:bg-[#1e3a5f]/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/dicom,.dcm"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drag and drop your images here
                </h3>
                <p className="text-gray-400 mb-6">
                  or click to browse from your device
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                  Select Files
                </button>
              </div>
            </div>
          </div>

          {/* Uploaded Images List */}
          {images.length > 0 && (
            <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Uploaded Images ({images.length})
              </h2>

              <div className="space-y-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedImage?.id === img.id
                        ? 'bg-primary/20 border-primary/50'
                        : 'bg-[#1e3a5f]/30 border-[#2d4a6f] hover:bg-[#1e3a5f]/50'
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#0d2137] shrink-0">
                      <img
                        src={img.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {img.file.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {(img.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      {/* Progress Bar or Status */}
                      {img.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-xs text-primary">
                              Uploading...
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#0d2137] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${img.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {img.status === 'processing' && (
                        <div className="flex items-center gap-2 mt-2">
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          <span className="text-xs text-amber-400">
                            AI analyzing...
                          </span>
                        </div>
                      )}

                      {img.status === 'completed' && img.result && (
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${getRiskColor(img.result.riskLevel)}`}
                          >
                            {img.result.riskLevel} risk
                          </span>
                          <span className="text-xs text-gray-400">
                            {img.result.confidence.toFixed(1)}% confidence
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {img.status === 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(img);
                            setShowHeatmap(true);
                          }}
                          className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                          title="View Heatmap"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Preview & Info */}
        <div className="space-y-6">
          {/* Preview Panel */}
          <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>

            {selectedImage ? (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1e3a5f]/30">
                  <img
                    src={
                      showHeatmap && selectedImage.result?.heatmapUrl
                        ? selectedImage.result.heatmapUrl
                        : selectedImage.preview
                    }
                    alt="Selected"
                    className="w-full h-full object-contain"
                  />
                </div>

                {selectedImage.status === 'completed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowHeatmap(false)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        !showHeatmap
                          ? 'bg-primary text-white'
                          : 'bg-[#1e3a5f] text-gray-400 hover:text-white'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setShowHeatmap(true)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                        showHeatmap
                          ? 'bg-primary text-white'
                          : 'bg-[#1e3a5f] text-gray-400 hover:text-white'
                      }`}
                    >
                      Heatmap
                    </button>
                  </div>
                )}

                {selectedImage.status === 'completed' &&
                  selectedImage.result && (
                    <div className="p-4 bg-[#1e3a5f]/30 rounded-xl">
                      <p className="text-sm text-gray-400 mb-2">
                        Analysis Result
                      </p>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getRiskColor(selectedImage.result.riskLevel)}`}
                      >
                        <span className="font-medium capitalize">
                          {selectedImage.result.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-3">
                        Confidence: {selectedImage.result.confidence.toFixed(1)}
                        %
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-[#1e3a5f]/30 flex flex-col items-center justify-center">
                <Image className="w-12 h-12 text-gray-500 mb-3" />
                <p className="text-gray-500 text-sm">
                  Select an image to preview
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">How it works</h3>
                <ol className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Upload clear retinal images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>AI analyzes for potential issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>View results and heatmaps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-primary">4.</span>
                    <span>Request professional verification</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Download Actions */}
          {selectedImage?.status === 'completed' && (
            <div className="bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors">
                  <Download className="w-5 h-5" />
                  Download Report (PDF)
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white rounded-xl font-medium transition-colors">
                  <CheckCircle className="w-5 h-5" />
                  Request Verification
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
