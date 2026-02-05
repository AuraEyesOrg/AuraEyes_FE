import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import ToolsSidebar from '../components/ToolsSidebar';
import ImageViewer from '../components/ImageViewer';
import AnalysisSidebar from '../components/AnalysisSidebar';
import ImageGallery from '../components/ImageGallery';
import { ToggleState, Anomaly, RetinalImage } from '../types/retinal.types';
import { OrganisationData } from '../types/organisation.types';
import { useEffect } from 'react';

// Default sample image for demo
const DEFAULT_IMAGE: RetinalImage = {
  id: 'default-1',
  url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnZvlMnDS-CcafTkkjgVLz-0UddpNaBx3OsGxIO9zGXC9fp7Xcw_1SoKlkYiy7zNvYBqtRA86b0wkhPKl9mX-MPsS7JyyMvW5eklHCPWjWy_hdxnGKOfLpWcKa1TvNvRs2wBtJzkygxKDBLqzveve9FQ-CH5A0ZR2TUS5U1KIWHEXQIs-lMeoR4Vx0jsbZlr095MuZggI7VU6BetlAaUJ6cCo_VHXoG5BRAPPmnS-xb7dR8aU3buiURokmF5U3L7W6KKyRilnvR6x4',
  name: 'Fundus_OS_001.jpg',
  eye: 'Left Eye (OS)',
  uploadedAt: new Date().toISOString(),
  analyzed: false,
  anomalies: [],
};

// Fallback data
const MOCK_ANOMALIES: Anomaly[] = [
  {
    id: '1',
    name: 'Microaneurysms',
    confidence: 98,
    description: 'Cluster detected in the superior temporal quadrant.',
    color: 'bg-red-500',
    type: 'warning',
    location: { x: 58, y: 32, width: 12, height: 10 },
  },
  {
    id: '2',
    name: 'Hard Exudates',
    confidence: 94,
    description: 'Lipid residues near the macula.',
    color: 'bg-yellow-400',
    type: 'priority_high',
    location: { x: 30, y: 68, width: 15, height: 12 },
  },
];

export default function AnalyticsPage() {
  const [orgData, setOrgData] = useState<OrganisationData | null>(null);
  const [toggles, setToggles] = useState<ToggleState>({
    vesselSegmentation: false,
    hemorrhages: true,
    exudates: true,
    opticDisc: false,
  });

  const [zoomLevel, setZoomLevel] = useState(1.2);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bulk Image Management State
  const [images, setImages] = useState<RetinalImage[]>([DEFAULT_IMAGE]);
  const [selectedImageId, setSelectedImageId] = useState<string>(
    DEFAULT_IMAGE.id
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    import('@/data/organisation-mock.json').then((module) => {
      setOrgData(module.default as OrganisationData);
    });
  }, []);

  // Get current selected image
  const currentImage =
    images.find((img) => img.id === selectedImageId) || images[0] || null;

  const handleToggleChange = (key: keyof ToggleState) => {
    setToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 5.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  const handleReset = () => setZoomLevel(1.2);

  // Handle bulk image upload
  const handleUploadImages = async (files: FileList) => {
    setIsUploading(true);

    const newImages: RetinalImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const url = URL.createObjectURL(file);
      const isRightEye =
        file.name.toLowerCase().includes('od') ||
        file.name.toLowerCase().includes('right');

      const newImage: RetinalImage = {
        id: `img-${Date.now()}-${i}`,
        url,
        name: file.name,
        eye: isRightEye ? 'Right Eye (OD)' : 'Left Eye (OS)',
        uploadedAt: new Date().toISOString(),
        analyzed: false,
        anomalies: [],
      };

      newImages.push(newImage);
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      setSelectedImageId(newImages[0].id);
      setAnalyzed(false);
      setAnomalies([]);
    }

    setIsUploading(false);
  };

  const handleSelectImage = (imageId: string) => {
    setSelectedImageId(imageId);
    const selectedImg = images.find((img) => img.id === imageId);
    if (selectedImg) {
      setAnomalies(selectedImg.anomalies);
      setAnalyzed(selectedImg.analyzed);
      setIsFallback(false);
      setErrorMessage(null);
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== imageId);
      if (imageId === selectedImageId && filtered.length > 0) {
        setSelectedImageId(filtered[0].id);
        setAnomalies(filtered[0].anomalies);
        setAnalyzed(filtered[0].analyzed);
      }
      return filtered;
    });
  };

  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalyzed(false);
    setAnomalies([]);
    setIsFallback(false);
    setErrorMessage(null);

    try {
      const imageUrl = currentImage?.url || DEFAULT_IMAGE.url;

      let base64Image = '';
      try {
        const imgResponse = await fetch(imageUrl);
        const blob = await imgResponse.blob();
        base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
      } catch (fetchError) {
        console.warn('Could not fetch image, using simulation.', fetchError);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setAnomalies(MOCK_ANOMALIES);
        setAnalyzed(true);
        setIsFallback(true);
        setErrorMessage('Using demo mode (image fetch failed)');
        setIsAnalyzing(false);
        return;
      }

      if (!process.env.API_KEY) {
        console.warn('No API key found, using demo mode.');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setAnomalies(MOCK_ANOMALIES);
        setAnalyzed(true);
        setIsFallback(true);
        setErrorMessage('Demo mode: No API key configured');
        setIsAnalyzing(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            {
              text: `Analyze this retinal fundus image. Identify anomalies like Microaneurysms, Hemorrhages, Hard Exudates, Cotton Wool Spots. 
                Return a JSON object with a key "anomalies" containing an array. 
                Each item must have: id (string), name (string), confidence (number 0-100), description (short string), type ('warning'|'priority_high'|'info'), color (tailwind class e.g. 'bg-red-500'), and location object {x, y, width, height} (percentages 0-100).`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const json = JSON.parse(response?.text || '{}');
      if (json.anomalies) {
        setAnomalies(json.anomalies);
        if (currentImage) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === currentImage.id
                ? { ...img, analyzed: true, anomalies: json.anomalies }
                : img
            )
          );
        }
      }
      setAnalyzed(true);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      const err = error as { status?: number; message?: string };
      const isQuotaError =
        err.status === 429 ||
        err.message?.includes('429') ||
        err.message?.includes('quota') ||
        err.message?.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError) {
        setErrorMessage(
          'API quota exceeded. Showing demo results. Please check your Gemini API plan at ai.google.dev'
        );
      } else {
        setErrorMessage('AI analysis unavailable. Showing demo results.');
      }

      setIsFallback(true);
      setAnomalies(MOCK_ANOMALIES);
      setAnalyzed(true);
      if (currentImage) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === currentImage.id
              ? { ...img, analyzed: true, anomalies: MOCK_ANOMALIES }
              : img
          )
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!orgData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0a1929]">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1929]">
      <Sidebar pendingCount={orgData.dashboardStats.pendingReviews.value} />

      <div className="ml-48">
        <OrganisationHeader />

        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Retinal Image Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered retinal screening and anomaly detection
            </p>
          </div>

          {/* Analytics Interface Container */}
          <div
            className="bg-white dark:bg-[#1e3a5f] rounded-xl border border-gray-200 dark:border-[#2d4a6f] overflow-hidden"
            style={{ height: 'calc(100vh - 220px)' }}
          >
            <div className="flex h-full">
              <ToolsSidebar
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
              />
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-hidden">
                  <ImageViewer
                    toggles={toggles}
                    zoomLevel={zoomLevel}
                    anomalies={anomalies}
                    isAnalyzing={isAnalyzing}
                    currentImage={currentImage}
                  />
                </div>
                <ImageGallery
                  images={images}
                  selectedImageId={selectedImageId}
                  onSelectImage={handleSelectImage}
                  onUploadImages={handleUploadImages}
                  onRemoveImage={handleRemoveImage}
                  isUploading={isUploading}
                />
              </div>
              <AnalysisSidebar
                toggles={toggles}
                onToggleChange={handleToggleChange}
                anomalies={anomalies}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyze}
                analyzed={analyzed}
                isFallback={isFallback}
                errorMessage={errorMessage}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
