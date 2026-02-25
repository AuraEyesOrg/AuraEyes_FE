import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Maximize2,
  Download,
  FileText,
  Eye,
  User,
  Stethoscope,
  Search as SearchIcon,
  Flag,
  Layers,
  Circle,
  Info,
  Settings2,
  Pencil,
  Save,
  X,
  Calendar,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import type { Doctor } from '../types/ophthalmologist.types';

// Types matching backend entities
type RiskLevel = 'None' | 'Low' | 'Moderate' | 'High' | 'Critical';
type EyeSide = 'Left' | 'Right' | 'Both';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  medicalHistorySummary?: string;
  bloodPressure?: string;
  a1c?: string;
}

interface RetinalImage {
  id: string;
  imageUrl: string;
  eyeSide: EyeSide;
  qualityScore: number;
  capturedAt: string;
  deviceName?: string;
}

interface DetectedFinding {
  id: string;
  name: string;
  description: string;
  confidence: number;
  location?: { x: number; y: number; width: number; height: number };
  severity: 'low' | 'moderate' | 'high';
}

interface ScreeningResult {
  id: string;
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  confidenceScore: number;
  findings: DetectedFinding[];
}

interface PreviousScan {
  id: string;
  date: string;
  type: string;
  riskLevel: RiskLevel;
}

interface AnnotationLayer {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
}

// Mock data
const mockDoctor: Doctor = {
  id: 'D001',
  name: 'Dr. Michael Chen',
  specialty: 'Retina Specialist',
  hospital: 'Aura Eye Center',
  department: 'Ophthalmology',
  avatar: null,
};

const mockPatient: Patient = {
  id: '#99281-A',
  name: 'Sarah Johnson',
  age: 58,
  gender: 'Female',
  dob: '12 Apr 1968',
  medicalHistorySummary: 'Type 2 Diabetes (10 years), Hypertension',
  bloodPressure: '135/85',
  a1c: '6.8%',
};

const mockRetinalImages: RetinalImage[] = [
  {
    id: 'img-1',
    imageUrl: '/retinal-left.jpg',
    eyeSide: 'Left',
    qualityScore: 92,
    capturedAt: '2023-10-24T09:30:00Z',
    deviceName: 'Topcon TRC-NW8',
  },
  {
    id: 'img-2',
    imageUrl: '/retinal-right.jpg',
    eyeSide: 'Right',
    qualityScore: 88,
    capturedAt: '2023-10-24T09:32:00Z',
    deviceName: 'Topcon TRC-NW8',
  },
];

const mockScreeningResult: ScreeningResult = {
  id: 'SCR-8920',
  riskLevel: 'High',
  riskScore: 8.4,
  summary:
    'Multiple diabetic retinopathy indicators detected. Referral recommended.',
  confidenceScore: 94,
  findings: [
    {
      id: 'f1',
      name: 'Microaneurysm Cluster',
      description: 'Located in superior temporal quadrant.',
      confidence: 94,
      location: { x: 55, y: 35, width: 15, height: 15 },
      severity: 'high',
    },
    {
      id: 'f2',
      name: 'Hard Exudates',
      description: 'Scattered near the macula.',
      confidence: 88,
      location: { x: 45, y: 50, width: 20, height: 18 },
      severity: 'moderate',
    },
    {
      id: 'f3',
      name: 'AV Nicking',
      description: 'Mild indentation visible.',
      confidence: 85,
      location: { x: 65, y: 45, width: 12, height: 12 },
      severity: 'moderate',
    },
    {
      id: 'f4',
      name: 'Cotton Wool Spots',
      description: 'Small area detected inferior to optic disc.',
      confidence: 72,
      location: { x: 40, y: 60, width: 10, height: 10 },
      severity: 'low',
    },
  ],
};

const mockPreviousScans: PreviousScan[] = [
  {
    id: 'ps1',
    date: 'Mar 12, 2023',
    type: 'Routine Checkup',
    riskLevel: 'Moderate',
  },
  { id: 'ps2', date: 'Sep 05, 2022', type: 'Follow-up', riskLevel: 'Low' },
  {
    id: 'ps3',
    date: 'Feb 18, 2022',
    type: 'Initial Screening',
    riskLevel: 'Low',
  },
];

const defaultAnnotationLayers: AnnotationLayer[] = [
  { id: 'hemorrhages', name: 'Hemorrhages', color: '#ef4444', enabled: true },
  { id: 'exudates', name: 'Exudates', color: '#f97316', enabled: true },
  {
    id: 'vessel-tortuosity',
    name: 'Vessel Tortuosity',
    color: '#3b82f6',
    enabled: false,
  },
  {
    id: 'vessel-segmentation',
    name: 'Vessel Segmentation',
    color: '#22c55e',
    enabled: false,
  },
  { id: 'optic-disc', name: 'Optic Disc', color: '#a855f7', enabled: false },
];

const riskLevelConfig: Record<
  RiskLevel,
  { label: string; color: string; bg: string }
> = {
  None: { label: 'No Risk', color: 'text-gray-600', bg: 'bg-gray-100' },
  Low: { label: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100' },
  Moderate: {
    label: 'Moderate',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
  },
  High: { label: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-100' },
  Critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' },
};

type SidebarTab = 'patient' | 'history' | 'exam' | 'reports';

export default function ScreeningReviewPage() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<SidebarTab>('exam');
  const [selectedImage, setSelectedImage] = useState(mockRetinalImages[0]);
  const [annotationLayers, setAnnotationLayers] = useState(
    defaultAnnotationLayers
  );
  const [overlayOpacity, setOverlayOpacity] = useState(70);
  const [showOverlay, setShowOverlay] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [focusedFinding, setFocusedFinding] = useState<string | null>(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisNote, setDiagnosisNote] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [referralRequired, setReferralRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const toggleLayer = (layerId: string) => {
    setAnnotationLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
      )
    );
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleFocusFinding = (findingId: string) => {
    setFocusedFinding(findingId);
    // Could also animate/scroll to the finding location
  };

  const getSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'moderate':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'from-red-500 to-red-600';
    if (score >= 6) return 'from-orange-500 to-orange-600';
    if (score >= 4) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const sidebarTabs = [
    { id: 'patient' as SidebarTab, icon: User, label: 'Patient Summary' },
    {
      id: 'history' as SidebarTab,
      icon: Stethoscope,
      label: 'Medical History',
    },
    { id: 'exam' as SidebarTab, icon: Eye, label: 'Current Exam' },
    { id: 'reports' as SidebarTab, icon: FileText, label: 'Previous Reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1929]">
      {/* Sidebar */}
      <DoctorSidebar doctor={mockDoctor} pendingCount={12} />

      {/* Main Content */}
      <div className="ml-52">
        {/* Header */}
        <DoctorHeader doctor={mockDoctor} />

        {/* Review Content */}
        <main className="p-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Screening Review
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Exam #{screeningId || mockScreeningResult.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium">
                AI Model: RetinaVasc-v4 (2023-10-01)
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                Oct 24, 2023
              </span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
            {/* Left Sidebar - Patient Info */}
            <div className="col-span-3 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden flex flex-col">
              {/* Patient Header */}
              <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {mockPatient.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-gray-900 dark:text-white font-semibold">
                      {mockPatient.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {mockPatient.id} • {mockPatient.gender[0]} •{' '}
                      {mockPatient.age}y
                    </p>
                  </div>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      BP
                    </p>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {mockPatient.bloodPressure}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg p-2.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      A1C
                    </p>
                    <p className="text-orange-600 dark:text-orange-400 font-semibold">
                      {mockPatient.a1c}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-[#1e3a5f]">
                <nav className="flex">
                  {sidebarTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 text-center text-xs font-medium transition-colors relative ${
                          activeTab === tab.id
                            ? 'text-cyan-600 dark:text-cyan-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mx-auto mb-1" />
                        {tab.label.split(' ')[0]}
                        {activeTab === tab.id && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'exam' && (
                  <div className="space-y-4">
                    {/* Eye Selection */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Select Eye
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {mockRetinalImages.map((img) => (
                          <button
                            key={img.id}
                            onClick={() => setSelectedImage(img)}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              selectedImage.id === img.id
                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                                : 'border-gray-200 dark:border-[#1e3a5f] hover:border-cyan-300'
                            }`}
                          >
                            <Eye
                              className={`w-5 h-5 mx-auto mb-1 ${
                                selectedImage.id === img.id
                                  ? 'text-cyan-600 dark:text-cyan-400'
                                  : 'text-gray-400'
                              }`}
                            />
                            <p
                              className={`text-sm font-medium ${
                                selectedImage.id === img.id
                                  ? 'text-cyan-600 dark:text-cyan-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {img.eyeSide} Eye
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Q: {img.qualityScore}%
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Details */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Image Details
                      </p>
                      <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Device
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {selectedImage.deviceName}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Captured
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {new Date(
                              selectedImage.capturedAt
                            ).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Quality
                          </span>
                          <span
                            className={`font-medium ${
                              selectedImage.qualityScore >= 90
                                ? 'text-green-600 dark:text-green-400'
                                : selectedImage.qualityScore >= 70
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {selectedImage.qualityScore >= 90
                              ? 'Optimal'
                              : selectedImage.qualityScore >= 70
                                ? 'Good'
                                : 'Poor'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'patient' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Demographics
                      </p>
                      <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Full Name
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {mockPatient.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            DOB
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {mockPatient.dob}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Gender
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {mockPatient.gender}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Medical Conditions
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {mockPatient.medicalHistorySummary}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Previous Scans
                    </p>
                    {mockPreviousScans.map((scan) => {
                      const riskConfig = riskLevelConfig[scan.riskLevel];
                      return (
                        <button
                          key={scan.id}
                          className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e3a5f] transition-colors text-left"
                        >
                          <div className="w-10 h-10 bg-linear-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shrink-0">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {scan.date}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {scan.type}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${riskConfig.bg} ${riskConfig.color}`}
                          >
                            {riskConfig.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Center - Image Viewer */}
            <div className="col-span-6 bg-[#0d1117] rounded-xl border border-gray-800 overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-3 border-b border-gray-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-gray-700 mx-1" />
                  <button
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Pan"
                  >
                    <Move className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Reset"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-gray-700 mx-1" />
                  <button
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Annotate"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Measure"
                  >
                    <Settings2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>

              {/* Image Container */}
              <div
                ref={imageContainerRef}
                className="flex-1 relative overflow-hidden flex items-center justify-center bg-black"
              >
                {/* Retinal Image Placeholder */}
                <div
                  className="relative transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                >
                  {/* Simulated Retinal Image */}
                  <div className="w-125 h-125 rounded-full bg-gradient-radial from-orange-900 via-red-950 to-black relative overflow-hidden">
                    {/* Optic Disc */}
                    <div className="absolute left-[45%] top-[40%] w-16 h-16 bg-gradient-radial from-yellow-200 via-orange-200 to-orange-400 rounded-full" />

                    {/* Blood Vessels Simulation */}
                    <div className="absolute inset-0 opacity-60">
                      <svg viewBox="0 0 500 500" className="w-full h-full">
                        <path
                          d="M250,200 Q280,250 320,280 Q360,310 400,350"
                          stroke="#8b0000"
                          strokeWidth="3"
                          fill="none"
                        />
                        <path
                          d="M250,200 Q220,260 180,300 Q140,340 100,380"
                          stroke="#8b0000"
                          strokeWidth="3"
                          fill="none"
                        />
                        <path
                          d="M250,200 Q260,150 280,120 Q300,90 340,60"
                          stroke="#8b0000"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M250,200 Q230,160 200,130 Q170,100 130,70"
                          stroke="#8b0000"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </div>

                    {/* AI Overlay Annotations */}
                    {showOverlay &&
                      mockScreeningResult.findings.map((finding) => {
                        const isHighlighted = focusedFinding === finding.id;
                        if (!finding.location) return null;
                        return (
                          <div
                            key={finding.id}
                            className={`absolute border-2 transition-all duration-300 ${
                              isHighlighted
                                ? 'border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/50'
                                : finding.severity === 'high'
                                  ? 'border-red-400/70 bg-red-400/10'
                                  : finding.severity === 'moderate'
                                    ? 'border-orange-400/70 bg-orange-400/10'
                                    : 'border-yellow-400/70 bg-yellow-400/10'
                            }`}
                            style={{
                              left: `${finding.location.x}%`,
                              top: `${finding.location.y}%`,
                              width: `${finding.location.width}%`,
                              height: `${finding.location.height}%`,
                              opacity: overlayOpacity / 100,
                            }}
                          >
                            {/* Corner markers */}
                            <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-current" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-current" />
                            <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-current" />
                            <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-current" />
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Eye Side Indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-gray-900/80 backdrop-blur rounded-lg text-white text-sm font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    {selectedImage.eyeSide} Eye (O
                    {selectedImage.eyeSide === 'Left' ? 'S' : 'D'})
                  </span>
                </div>

                {/* Risk Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 bg-red-500/90 backdrop-blur rounded-lg text-white text-sm font-semibold">
                    ATTENTION NEEDED
                  </span>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between p-3 border-t border-gray-800">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Magnification: {zoom.toFixed(1)}x</span>
                  <span>Modality: Color Fundus</span>
                  <span>
                    Quality:{' '}
                    <span
                      className={
                        selectedImage.qualityScore >= 90
                          ? 'text-green-400'
                          : selectedImage.qualityScore >= 70
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }
                    >
                      {selectedImage.qualityScore >= 90
                        ? 'Optimal'
                        : selectedImage.qualityScore >= 70
                          ? 'Good'
                          : 'Poor'}
                    </span>
                  </span>
                </div>

                {/* Overlay Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowOverlay(true)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      showOverlay
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    AI Overlay
                  </button>
                  <button
                    onClick={() => setShowOverlay(false)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      !showOverlay
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - AI Analysis */}
            <div className="col-span-3 bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-500" />
                    AI Analysis Layers
                  </h3>
                  <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded text-xs font-medium">
                    BETA
                  </span>
                </div>

                {/* Risk Score */}
                <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      AURA Risk Score
                    </span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {mockScreeningResult.riskScore}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      / 10
                    </span>
                    <span
                      className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold ${
                        riskLevelConfig[mockScreeningResult.riskLevel].bg
                      } ${riskLevelConfig[mockScreeningResult.riskLevel].color}`}
                    >
                      Referral Recommended
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-linear-to-r ${getRiskScoreColor(mockScreeningResult.riskScore)} rounded-full transition-all`}
                      style={{
                        width: `${mockScreeningResult.riskScore * 10}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Layer Visibility */}
              <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Layer Visibility
                  </span>
                  <button className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">
                    Reset
                  </button>
                </div>
                <div className="space-y-2">
                  {annotationLayers.map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        <Circle
                          className="w-3 h-3"
                          fill={layer.color}
                          stroke={layer.color}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {layer.name}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          layer.enabled
                            ? 'bg-cyan-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            layer.enabled ? 'left-5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Opacity Slider */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Overlay Opacity
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {overlayOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>

              {/* Detected Findings */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Detected Findings ({mockScreeningResult.findings.length})
                </p>
                <div className="space-y-3">
                  {mockScreeningResult.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className={`border-l-4 rounded-lg p-3 ${getSeverityColor(finding.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {finding.name}
                        </h4>
                        <span
                          className={`text-xs font-bold ${
                            finding.confidence >= 90
                              ? 'text-red-600 dark:text-red-400'
                              : finding.confidence >= 80
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                          }`}
                        >
                          {finding.confidence}% Conf.
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {finding.description}
                      </p>
                      <button
                        onClick={() => handleFocusFinding(finding.id)}
                        className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        <SearchIcon className="w-3 h-3" />
                        CLICK TO FOCUS
                      </button>
                    </div>
                  ))}
                </div>

                {/* AI Disclaimer */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-semibold">Note:</span> AI generated
                      insights are screening aids only. Final diagnosis requires
                      physician review.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-200 dark:border-[#1e3a5f]">
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#1e3a5f] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d4a6f] rounded-lg font-medium transition-colors">
                    <Flag className="w-4 h-4" />
                    Flag for Review
                  </button>
                  <button
                    onClick={() => setShowDiagnosisModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Diagnosis Modal */}
      {showDiagnosisModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a1f44] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Complete Diagnosis
                </h2>
                <button
                  onClick={() => setShowDiagnosisModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Review AI findings and provide your clinical assessment
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
              {/* AI Summary */}
              <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-2">
                  AI Analysis Summary
                </h3>
                <p className="text-sm text-cyan-700 dark:text-cyan-400">
                  {mockScreeningResult.summary}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-cyan-600 dark:text-cyan-400">
                    Risk Level: <strong>{mockScreeningResult.riskLevel}</strong>
                  </span>
                  <span className="text-sm text-cyan-600 dark:text-cyan-400">
                    Confidence:{' '}
                    <strong>{mockScreeningResult.confidenceScore}%</strong>
                  </span>
                </div>
              </div>

              {/* Diagnosis Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diagnosis Code (ICD-10)
                </label>
                <input
                  type="text"
                  placeholder="e.g., E11.319 - Type 2 diabetes mellitus with unspecified diabetic retinopathy"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Diagnosis Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clinical Notes
                </label>
                <textarea
                  value={diagnosisNote}
                  onChange={(e) => setDiagnosisNote(e.target.value)}
                  placeholder="Enter your clinical assessment and observations..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              {/* Treatment Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Treatment Plan
                </label>
                <textarea
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="Recommended treatment and next steps..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                {/* Referral */}
                <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Referral Required
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recommend specialist consultation
                      </p>
                    </div>
                    <button
                      onClick={() => setReferralRequired(!referralRequired)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        referralRequired
                          ? 'bg-cyan-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          referralRequired ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Follow-up Date */}
                <div className="bg-gray-50 dark:bg-[#1e3a5f]/50 rounded-xl p-4">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">
                    Follow-up Date
                  </p>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#0a1f44] border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-[#1e3a5f] flex items-center justify-between">
              <button
                onClick={() => setShowDiagnosisModal(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button className="px-6 py-2.5 bg-gray-100 dark:bg-[#1e3a5f] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2d4a6f] rounded-xl font-medium transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Confirm & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
