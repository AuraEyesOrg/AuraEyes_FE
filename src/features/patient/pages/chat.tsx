import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video,
  Search,
  CheckCheck,
  X,
  Eye,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';

interface Conversation {
  id: string;
  ophthalmologist: {
    name: string;
    title: string;
    avatarUrl?: string;
    isOnline: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
}

interface SharedScanData {
  imageUrl?: string;
  eyeLabel?: string;
  riskLevel?: string;
  riskLabel?: string;
  anomalies?: string[];
  summary?: string;
  scanId?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderType: 'patient' | 'ophthalmologist';
  content: string;
  type: 'text' | 'image' | 'scan-share';
  timestamp: string;
  isRead: boolean;
  attachedScan?: SharedScanData;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    ophthalmologist: {
      name: 'Dr. Sarah Smith',
      title: 'Retina Specialist',
      isOnline: true,
    },
    lastMessage: {
      content:
        'Your follow-up scan looks good. Keep monitoring your blood pressure.',
      timestamp: '10:30 AM',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '2',
    ophthalmologist: {
      name: 'Dr. John Williams',
      title: 'Ophthalmologist',
      isOnline: false,
    },
    lastMessage: {
      content: 'Please schedule your OCT scan at your earliest convenience.',
      timestamp: 'Yesterday',
      isRead: false,
    },
    unreadCount: 2,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'doctor',
    senderType: 'ophthalmologist',
    content: 'Hello! I reviewed your recent screening results.',
    type: 'text',
    timestamp: '9:00 AM',
    isRead: true,
  },
  {
    id: '2',
    senderId: 'doctor',
    senderType: 'ophthalmologist',
    content:
      'The AI detected some minor changes in your retinal vessels. Nothing to be alarmed about, but we should monitor it.',
    type: 'text',
    timestamp: '9:01 AM',
    isRead: true,
  },
  {
    id: '3',
    senderId: 'patient',
    senderType: 'patient',
    content: 'Thank you for reviewing, Doctor. Should I be concerned?',
    type: 'text',
    timestamp: '9:15 AM',
    isRead: true,
  },
  {
    id: '4',
    senderId: 'doctor',
    senderType: 'ophthalmologist',
    content:
      'Not at all! These changes are very common and can be managed with lifestyle modifications. I recommend regular blood pressure monitoring and reducing screen time.',
    type: 'text',
    timestamp: '9:20 AM',
    isRead: true,
  },
  {
    id: '5',
    senderId: 'patient',
    senderType: 'patient',
    content: 'I understand. When should I schedule my next screening?',
    type: 'text',
    timestamp: '10:00 AM',
    isRead: true,
  },
  {
    id: '6',
    senderId: 'doctor',
    senderType: 'ophthalmologist',
    content:
      'Your follow-up scan looks good. Keep monitoring your blood pressure.',
    type: 'text',
    timestamp: '10:30 AM',
    isRead: true,
  },
];

export default function ChatPage() {
  const location = useLocation();
  const sharedScan =
    (location.state as { sharedScan?: SharedScanData } | null)?.sharedScan ??
    null;

  const [conversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >('1');
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState(
    sharedScan
      ? `Hi Doctor, I'd like to share my recent screening results for your review.`
      : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingScan, setPendingScan] = useState<SharedScanData | null>(
    sharedScan
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to show the pending scan preview when it arrives
  useEffect(() => {
    if (pendingScan) {
      scrollToBottom();
    }
  }, [pendingScan]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !pendingScan) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'patient',
      senderType: 'patient',
      content: newMessage,
      type: pendingScan ? 'scan-share' : 'text',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      isRead: false,
      attachedScan: pendingScan ?? undefined,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
    setPendingScan(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedDoctor = conversations.find(
    (c) => c.id === selectedConversation
  )?.ophthalmologist;

  return (
    <PatientLayout userName="John Doe">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-1">
          Messages
        </h1>
        <p className="text-(--text-secondary)">
          Chat with your assigned ophthalmologists
        </p>
      </div>

      <div className="medical-card overflow-hidden h-[calc(100vh-180px)]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-96 border-r border-(--border-color) flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-(--border-color)">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-(--bg-secondary) border border-(--border-color) rounded-lg text-(--text-primary) text-sm placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 cursor-pointer transition-colors border-b border-(--border-color) ${
                    selectedConversation === conversation.id
                      ? 'bg-brand-soft'
                      : 'hover:bg-(--bg-tertiary)'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-linear-to-br from-brand to-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {conversation.ophthalmologist.name.charAt(0)}
                        </span>
                      </div>
                      {conversation.ophthalmologist.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-(--text-primary) font-medium truncate">
                          {conversation.ophthalmologist.name}
                        </p>
                        <span className="text-xs text-(--text-muted)">
                          {conversation.lastMessage.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-(--text-secondary) mb-1">
                        {conversation.ophthalmologist.title}
                      </p>
                      <p className="text-sm text-(--text-secondary) truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-brand rounded-full text-xs font-bold text-white flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-(--border-color) flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-linear-to-br from-brand to-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedDoctor?.name.charAt(0)}
                      </span>
                    </div>
                    {selectedDoctor?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-(--text-primary) font-medium">
                      {selectedDoctor?.name}
                    </p>
                    <p className="text-xs text-(--text-secondary)">
                      {selectedDoctor?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-(--bg-secondary)">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === 'patient'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[65%] rounded-2xl ${
                        message.senderType === 'patient'
                          ? 'bg-brand text-white rounded-br-sm'
                          : 'bg-white dark:bg-[#1e3a5f] text-(--text-primary) rounded-bl-sm border border-(--border-color) shadow-sm'
                      }`}
                    >
                      {/* Attached scan card */}
                      {message.type === 'scan-share' &&
                        message.attachedScan && (
                          <div
                            className={`m-2 rounded-xl overflow-hidden border ${
                              message.senderType === 'patient'
                                ? 'border-white/20 bg-white/10'
                                : 'border-(--border-color) bg-(--bg-secondary)'
                            }`}
                          >
                            {message.attachedScan.imageUrl && (
                              <div className="h-40 bg-slate-900">
                                <img
                                  src={message.attachedScan.imageUrl}
                                  alt="Retinal scan"
                                  className="w-full h-full object-cover opacity-90"
                                />
                              </div>
                            )}
                            <div className="p-3 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs font-semibold">
                                  {message.attachedScan.eyeLabel ??
                                    'Retinal Scan'}
                                </span>
                                {message.attachedScan.riskLabel && (
                                  <span
                                    className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      message.senderType === 'patient'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-cyan-50 text-cyan-700'
                                    }`}
                                  >
                                    {message.attachedScan.riskLabel}
                                  </span>
                                )}
                              </div>
                              {message.attachedScan.scanId && (
                                <p className="text-[11px] opacity-70">
                                  Scan {message.attachedScan.scanId}
                                </p>
                              )}
                              {message.attachedScan.anomalies &&
                                message.attachedScan.anomalies.length > 0 && (
                                  <p className="text-[11px] opacity-80">
                                    Findings:{' '}
                                    {message.attachedScan.anomalies.join(', ')}
                                  </p>
                                )}
                            </div>
                          </div>
                        )}

                      <div className="p-3">
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            message.senderType === 'patient'
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <span
                            className={`text-xs ${message.senderType === 'patient' ? 'opacity-70' : 'text-(--text-muted)'}`}
                          >
                            {message.timestamp}
                          </span>
                          {message.senderType === 'patient' && (
                            <CheckCheck
                              className={`w-3 h-3 ${
                                message.isRead ? 'text-blue-300' : 'opacity-70'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-(--border-color) space-y-3">
                {/* Pending scan attachment preview */}
                {pendingScan && (
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl">
                    {pendingScan.imageUrl && (
                      <img
                        src={pendingScan.imageUrl}
                        alt="Scan preview"
                        className="w-14 h-14 rounded-lg object-cover bg-slate-900"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200 truncate">
                        Screening Results — {pendingScan.eyeLabel}
                      </p>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400">
                        {pendingScan.riskLabel}
                        {pendingScan.anomalies &&
                        pendingScan.anomalies.length > 0
                          ? ` · ${pendingScan.anomalies.length} finding(s)`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setPendingScan(null)}
                      className="p-1.5 hover:bg-cyan-100 dark:hover:bg-cyan-900 rounded-lg transition-colors text-cyan-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-(--text-secondary) hover:text-brand hover:bg-(--bg-secondary) rounded-lg transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !pendingScan}
                    className="p-3 bg-brand hover:bg-brand/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-(--bg-secondary) rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-(--text-muted)" />
                </div>
                <h3 className="text-xl font-semibold text-(--text-primary) mb-2">
                  Select a conversation
                </h3>
                <p className="text-(--text-secondary)">
                  Choose a doctor to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}
