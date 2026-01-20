import { GuestLayout } from '@/components/layouts';
import { Eye, Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const ScreeningPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    // TODO: Implement screening submission
    console.log('Submit screening:', selectedFile);
  };

  return (
    <GuestLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Retinal Screening
          </h1>
          <p className="text-gray-600">
            Upload your retinal images for AI-powered analysis
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Upload Retinal Image
            </h2>
            <p className="text-sm text-gray-600">
              Supported formats: JPG, PNG, DICOM (Max 10MB)
            </p>
          </div>

          {!previewUrl ? (
            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Click to upload or drag and drop
                </h3>
                <p className="text-sm text-gray-500">
                  PNG, JPG or DICOM (max. 10MB)
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-96 object-contain bg-gray-50"
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

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedFile?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Analyze Image
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="space-y-2 text-sm text-blue-700">
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
    </GuestLayout>
  );
};

export default ScreeningPage;
