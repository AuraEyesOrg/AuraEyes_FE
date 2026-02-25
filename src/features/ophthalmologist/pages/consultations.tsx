import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Paperclip,
  Image,
  MoreVertical,
  Phone,
  Video,
  Search,
  CheckCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  FileText,
  Calendar,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';
import type { Doctor } from '../types/ophthalmologist.types';

// Consultation status enum matching backend
type ConsultationStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

interface Patient {
  id: string;
  name: string;
  age: number;
  avatarUrl?: string;
  email: string;
}

interface ConsultationRequest {
  id: string;
  patient: Patient;
  status: ConsultationStatus;
  requestAt: string;
  requestMessage?: string;
  meetingLink?: string;
  diagnosisNote?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  senderType: 'patient' | 'ophthalmologist';
  content: string;
  type: 'text' | 'image';
  timestamp: string;
  isRead: boolean;
}

// Mock data
const mockDoctor: Doctor = {
  id: 'doc-1',
  name: 'Dr. Michael Chen',
  specialty: 'Retina Specialist',
  hospital: 'Aura Eye Center',
  department: 'Ophthalmology',
  avatar: null,
};

const mockConsultations: ConsultationRequest[] = [
  {
    id: '1',
    patient: {
      id: 'p1',
      name: 'John Doe',
      age: 45,
      email: 'john.doe@email.com',
    },
    status: 'Pending',
    requestAt: '2026-02-24T08:30:00Z',
    requestMessage:
      'I have been experiencing blurry vision for the past week. Would like to discuss my recent screening results.',
    unreadCount: 0,
  },
  {
    id: '2',
    patient: {
      id: 'p2',
      name: 'Sarah Williams',
      age: 38,
      email: 'sarah.w@email.com',
    },
    status: 'Pending',
    requestAt: '2026-02-24T07:15:00Z',
    requestMessage:
      'Need follow-up consultation regarding my OCT scan results.',
    unreadCount: 0,
  },
  {
    id: '3',
    patient: {
      id: 'p3',
      name: 'Robert Johnson',
      age: 52,
      email: 'robert.j@email.com',
    },
    status: 'InProgress',
    requestAt: '2026-02-23T14:00:00Z',
    requestMessage: 'Diabetic retinopathy follow-up consultation.',
    lastMessage: {
      content: 'Thank you for reviewing my results, Doctor.',
      timestamp: '10:45 AM',
      isRead: true,
    },
    unreadCount: 2,
  },
  {
    id: '4',
    patient: {
      id: 'p4',
      name: 'Emily Davis',
      age: 29,
      email: 'emily.d@email.com',
    },
    status: 'Approved',
    requestAt: '2026-02-23T11:30:00Z',
    requestMessage: 'First-time screening consultation.',
    meetingLink: 'https://meet.auraeyes.com/consult-004',
    lastMessage: {
      content: 'Your consultation has been approved. Please join when ready.',
      timestamp: 'Yesterday',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '5',
    patient: {
      id: 'p5',
      name: 'Michael Brown',
      age: 61,
      email: 'michael.b@email.com',
    },
    status: 'Completed',
    requestAt: '2026-02-22T09:00:00Z',
    requestMessage: 'Annual eye checkup consultation.',
    diagnosisNote: 'Normal findings. Recommended annual follow-up.',
    lastMessage: {
      content: 'Thank you for the consultation, Doctor!',
      timestamp: 'Feb 22',
      isRead: true,
    },
    unreadCount: 0,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'p3',
    senderType: 'patient',
    content:
      'Hello Doctor, I wanted to discuss my recent screening results. The AI flagged some changes in my retinal vessels.',
    type: 'text',
    timestamp: '10:00 AM',
    isRead: true,
  },
  {
    id: '2',
    senderId: 'doc-1',
    senderType: 'ophthalmologist',
    content:
      "Good morning! I've reviewed your screening results. The AI detected some mild microaneurysms, which is common in early-stage diabetic retinopathy.",
    type: 'text',
    timestamp: '10:15 AM',
    isRead: true,
  },
  {
    id: '3',
    senderId: 'p3',
    senderType: 'patient',
    content: 'Is this something I should be worried about?',
    type: 'text',
    timestamp: '10:20 AM',
    isRead: true,
  },
  {
    id: '4',
    senderId: 'doc-1',
    senderType: 'ophthalmologist',
    content:
      "At this stage, it's very manageable. I recommend maintaining good blood sugar control and scheduling regular screenings every 3 months. Would you like me to prescribe any eye drops?",
    type: 'text',
    timestamp: '10:30 AM',
    isRead: true,
  },
  {
    id: '5',
    senderId: 'p3',
    senderType: 'patient',
    content: 'Thank you for reviewing my results, Doctor.',
    type: 'text',
    timestamp: '10:45 AM',
    isRead: true,
  },
];

const statusConfig: Record<
  ConsultationStatus,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  Pending: {
    label: 'Pending',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Clock,
  },
  Approved: {
    label: 'Approved',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: CheckCircle2,
  },
  Rejected: {
    label: 'Rejected',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: XCircle,
  },
  InProgress: {
    label: 'In Progress',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: MessageCircle,
  },
  Completed: {
    label: 'Completed',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: CheckCircle2,
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'text-gray-500 dark:text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: XCircle,
  },
};

type FilterTab = 'all' | 'pending' | 'active' | 'completed';

export default function ConsultationsPage() {
  const [consultations, setConsultations] =
    useState<ConsultationRequest[]>(mockConsultations);
  const [selectedConsultation, setSelectedConsultation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: mockDoctor.id,
      senderType: 'ophthalmologist',
      content: newMessage,
      type: 'text',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      isRead: false,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApprove = (consultationId: string) => {
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? {
              ...c,
              status: 'Approved' as ConsultationStatus,
              meetingLink: `https://meet.auraeyes.com/consult-${consultationId}`,
            }
          : c
      )
    );
  };

  const handleReject = (consultationId: string) => {
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? { ...c, status: 'Rejected' as ConsultationStatus }
          : c
      )
    );
  };

  const handleStartConsultation = (consultationId: string) => {
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? { ...c, status: 'InProgress' as ConsultationStatus }
          : c
      )
    );
    setSelectedConsultation(consultationId);
  };

  const handleCompleteConsultation = (consultationId: string) => {
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? { ...c, status: 'Completed' as ConsultationStatus }
          : c
      )
    );
  };

  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      c.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.requestMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab === 'pending') {
      matchesTab = c.status === 'Pending';
    } else if (activeTab === 'active') {
      matchesTab = c.status === 'Approved' || c.status === 'InProgress';
    } else if (activeTab === 'completed') {
      matchesTab =
        c.status === 'Completed' ||
        c.status === 'Cancelled' ||
        c.status === 'Rejected';
    }

    return matchesSearch && matchesTab;
  });

  const selectedRequest = consultations.find(
    (c) => c.id === selectedConsultation
  );

  const pendingCount = consultations.filter(
    (c) => c.status === 'Pending'
  ).length;

  const formatRequestDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffHours < 48) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1929]">
      {/* Sidebar */}
      <DoctorSidebar doctor={mockDoctor} pendingCount={pendingCount} />

      {/* Main Content */}
      <div className="ml-52">
        {/* Header */}
        <DoctorHeader doctor={mockDoctor} />

        {/* Page Content */}
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Consultations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage consultation requests and chat with patients
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] overflow-hidden h-[calc(100vh-220px)]">
            <div className="flex h-full">
              {/* Consultations List */}
              <div className="w-96 border-r border-gray-200 dark:border-[#1e3a5f] flex flex-col">
                {/* Filter Tabs */}
                <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <div className="flex gap-1 bg-gray-100 dark:bg-[#1e3a5f]/50 rounded-lg p-1">
                    {(
                      [
                        { key: 'all', label: 'All' },
                        {
                          key: 'pending',
                          label: 'Pending',
                          count: pendingCount,
                        },
                        { key: 'active', label: 'Active' },
                        { key: 'completed', label: 'Completed' },
                      ] as { key: FilterTab; label: string; count?: number }[]
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                          activeTab === tab.key
                            ? 'bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-4.5">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search consultations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                {/* Consultation List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConsultations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-[#1e3a5f] rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        No consultations found
                      </p>
                    </div>
                  ) : (
                    filteredConsultations.map((consultation) => {
                      const statusInfo = statusConfig[consultation.status];
                      const StatusIcon = statusInfo.icon;

                      return (
                        <div
                          key={consultation.id}
                          onClick={() =>
                            setSelectedConsultation(consultation.id)
                          }
                          className={`p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-[#1e3a5f]/50 ${
                            selectedConsultation === consultation.id
                              ? 'bg-cyan-50 dark:bg-cyan-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-[#1e3a5f]/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <div className="w-12 h-12 bg-linear-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {consultation.patient.name.charAt(0)}
                                </span>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-gray-900 dark:text-white font-medium truncate">
                                  {consultation.patient.name}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">
                                  {formatRequestDate(consultation.requestAt)}
                                </span>
                              </div>

                              {/* Status Badge */}
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {statusInfo.label}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {consultation.patient.age} yrs
                                </span>
                              </div>

                              {/* Preview */}
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {consultation.lastMessage?.content ||
                                  consultation.requestMessage}
                              </p>
                            </div>

                            {/* Unread Badge */}
                            {consultation.unreadCount > 0 && (
                              <span className="w-5 h-5 bg-cyan-500 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0">
                                {consultation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat/Details Area */}
              {selectedRequest ? (
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-[#1e3a5f] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-linear-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {selectedRequest.patient.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {selectedRequest.patient.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedRequest.patient.email} •{' '}
                          {selectedRequest.patient.age} years old
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Action Buttons based on status */}
                      {selectedRequest.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(selectedRequest.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(selectedRequest.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {selectedRequest.status === 'Approved' && (
                        <button
                          onClick={() =>
                            handleStartConsultation(selectedRequest.id)
                          }
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Start Chat
                        </button>
                      )}
                      {selectedRequest.status === 'InProgress' && (
                        <button
                          onClick={() =>
                            handleCompleteConsultation(selectedRequest.id)
                          }
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Complete
                        </button>
                      )}
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content based on status */}
                  {selectedRequest.status === 'Pending' ? (
                    // Request Details View
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#0a1929]/50">
                      <div className="max-w-2xl mx-auto space-y-6">
                        {/* Request Info Card */}
                        <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-200 dark:border-[#1e3a5f] p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                New Consultation Request
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Received{' '}
                                {formatRequestDate(selectedRequest.requestAt)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <User className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Patient
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                  {selectedRequest.patient.name},{' '}
                                  {selectedRequest.patient.age} years old
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Requested At
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                  {new Date(
                                    selectedRequest.requestAt
                                  ).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Request Message
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                  {selectedRequest.requestMessage ||
                                    'No message provided'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Prompt */}
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-6 text-center">
                          <p className="text-cyan-800 dark:text-cyan-200 mb-4">
                            Review the request and decide whether to approve or
                            reject this consultation.
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleApprove(selectedRequest.id)}
                              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Approve Request
                            </button>
                            <button
                              onClick={() => handleReject(selectedRequest.id)}
                              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject Request
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : selectedRequest.status === 'Approved' ? (
                    // Approved - Waiting to start
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#0a1929]/50">
                      <div className="text-center p-6">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Consultation Approved
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                          Click "Start Chat" to begin the consultation with the
                          patient.
                        </p>
                        <button
                          onClick={() =>
                            handleStartConsultation(selectedRequest.id)
                          }
                          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Start Chat
                        </button>
                      </div>
                    </div>
                  ) : selectedRequest.status === 'InProgress' ||
                    selectedRequest.status === 'Completed' ? (
                    // Chat View
                    <>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0a1929]/50">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderType === 'ophthalmologist'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-2xl ${
                                message.senderType === 'ophthalmologist'
                                  ? 'bg-cyan-600 text-white rounded-br-sm'
                                  : 'bg-white dark:bg-[#1e3a5f] text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-[#2d4a6f] shadow-sm'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div
                                className={`flex items-center gap-1 mt-1 ${
                                  message.senderType === 'ophthalmologist'
                                    ? 'justify-end'
                                    : 'justify-start'
                                }`}
                              >
                                <span
                                  className={`text-xs ${
                                    message.senderType === 'ophthalmologist'
                                      ? 'opacity-70'
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}
                                >
                                  {message.timestamp}
                                </span>
                                {message.senderType === 'ophthalmologist' && (
                                  <CheckCheck
                                    className={`w-3 h-3 ${
                                      message.isRead
                                        ? 'text-blue-300'
                                        : 'opacity-70'
                                    }`}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      {selectedRequest.status === 'InProgress' && (
                        <div className="p-4 border-t border-gray-200 dark:border-[#1e3a5f]">
                          <div className="flex items-end gap-3">
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                              <Paperclip className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors">
                              <Image className="w-5 h-5" />
                            </button>
                            <div className="flex-1">
                              <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e3a5f]/50 border border-gray-200 dark:border-[#1e3a5f] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                                rows={1}
                              />
                            </div>
                            <button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim()}
                              className="p-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Completed Banner */}
                      {selectedRequest.status === 'Completed' && (
                        <div className="p-4 border-t border-gray-200 dark:border-[#1e3a5f] bg-gray-100 dark:bg-[#1e3a5f]/30">
                          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              This consultation has been completed
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Rejected/Cancelled View
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#0a1929]/50">
                      <div className="text-center p-6">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Consultation {selectedRequest.status}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                          This consultation request has been{' '}
                          {selectedRequest.status.toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Select a consultation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a consultation request to view details or start
                      chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
