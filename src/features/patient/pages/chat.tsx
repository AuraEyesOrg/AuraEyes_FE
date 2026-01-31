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

interface Message {
  id: string;
  senderId: string;
  senderType: 'patient' | 'ophthalmologist';
  content: string;
  type: 'text' | 'image';
  timestamp: string;
  isRead: boolean;
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
  const [conversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >('1');
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
      senderId: 'patient',
      senderType: 'patient',
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

  const selectedDoctor = conversations.find(
    (c) => c.id === selectedConversation
  )?.ophthalmologist;

  return (
    <PatientLayout userName="John Doe">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Messages</h1>
        <p className="text-[var(--text-secondary)]">
          Chat with your assigned ophthalmologists
        </p>
      </div>

      <div className="medical-card overflow-hidden h-[calc(100vh-220px)]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-80 border-r border-[var(--border-color)] flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-[var(--border-color)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 cursor-pointer transition-colors border-b border-[var(--border-color)] ${
                    selectedConversation === conversation.id
                      ? 'bg-brand-soft'
                      : 'hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand to-accent rounded-full flex items-center justify-center">
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
                        <p className="text-[var(--text-primary)] font-medium truncate">
                          {conversation.ophthalmologist.name}
                        </p>
                        <span className="text-xs text-[var(--text-muted)]">
                          {conversation.lastMessage.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">
                        {conversation.ophthalmologist.title}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] truncate">
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
              <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand to-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedDoctor?.name.charAt(0)}
                      </span>
                    </div>
                    {selectedDoctor?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      {selectedDoctor?.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {selectedDoctor?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-[var(--text-secondary)] hover:text-brand hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-[var(--text-secondary)] hover:text-brand hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-[var(--text-secondary)] hover:text-brand hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-secondary)]">
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
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        message.senderType === 'patient'
                          ? 'bg-brand text-white rounded-br-sm'
                          : 'bg-white text-[var(--text-primary)] rounded-bl-sm border border-[var(--border-color)] shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          message.senderType === 'patient'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <span className={`text-xs ${message.senderType === 'patient' ? 'opacity-70' : 'text-[var(--text-muted)]'}`}>
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
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-[var(--border-color)]">
                <div className="flex items-end gap-3">
                  <button className="p-2 text-[var(--text-secondary)] hover:text-brand hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-[var(--text-secondary)] hover:text-brand hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
                    <Image className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                      rows={1}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
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
                <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  Select a conversation
                </h3>
                <p className="text-[var(--text-secondary)]">
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
