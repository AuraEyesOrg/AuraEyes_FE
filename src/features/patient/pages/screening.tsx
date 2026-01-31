import PatientLayout from '../components/PatientLayout';
import {
  Eye,
  Upload,
  AlertCircle,
  Home,
  Clipboard,
  Image as ImageIcon,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ScreeningPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Validate and process image file
  const processImageFile = useCallback((file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return false;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    return true;
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processImageFile(file);
      }
    },
    [processImageFile]
  );

  // Handle paste from clipboard
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            processImageFile(file);
          }
          break;
        }
      }
    },
    [processImageFile]
  );

  // Add paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleSubmit = () => {
    // TODO: Implement screening submission
    console.log('Submit screening:', selectedFile);
  };

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex text-xs text-[var(--text-secondary)] mb-4">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                to="/"
                className="hover:text-brand transition-colors flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
            </li>
            <li>
              <span className="text-[var(--border-color)]">/</span>
            </li>
            <li className="font-semibold text-[var(--text-primary)]">
              My Scans
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Retinal Screening
          </h1>
          <p className="text-[var(--text-secondary)]">
            Upload your retinal images for AI-powered analysis
          </p>
        </div>

        {/* Upload Section */}
        <div className="medical-card mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Upload Retinal Image
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Supported formats: JPG, PNG, DICOM (Max 10MB)
            </p>
          </div>

          {!previewUrl ? (
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-brand bg-brand-soft scale-[1.02] shadow-lg'
                  : 'border-[var(--border-color)] hover:border-brand hover:bg-brand-soft'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <div
                  className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-all ${
                    isDragging
                      ? 'bg-brand text-white scale-110'
                      : 'bg-brand-soft'
                  }`}
                >
                  {isDragging ? (
                    <Upload className="h-8 w-8 text-white animate-bounce" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-brand" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {isDragging
                    ? 'Drop your image here'
                    : 'Drag & drop your retinal image'}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  or click to browse files
                </p>

                {/* Paste hint */}
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <Clipboard className="w-4 h-4 text-brand" />
                  <span className="text-sm text-[var(--text-secondary)]">
                    You can also{' '}
                    <span className="text-brand font-medium">Ctrl+V</span> to
                    paste an image
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)]">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-96 object-contain bg-[var(--bg-secondary)]"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-brand" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {selectedFile?.name}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="btn-primary w-full py-4"
              >
                Analyze Image
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="medical-card bg-brand-soft border-brand/20">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-brand/20 rounded-lg flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                How it works
              </h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Upload a clear retinal image</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Our AI analyzes the image for potential issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">3.</span>
                  <span>
                    Receive instant results and recommendations from healthcare
                    professionals
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default ScreeningPage;
