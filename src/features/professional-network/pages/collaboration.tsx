import { useState, useEffect, useRef } from 'react';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  Users,
  MessageSquare,
  Video,
  Plus,
  Search,
  MoreVertical,
  Send,
  Calendar,
  ExternalLink,
  Info,
  X,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  internalChatApi,
  InternalGroupChat,
  InternalGroupMessage,
} from '../api/internal-chat.api';
import useAuthStore from '@/store/auth-store';
import {
  useSignalRInternalChat,
  SIGNALR_INTERNAL_MESSAGE_EVENT,
} from '@/hooks/useSignalRInternalChat';
import UserAvatar from '@/components/ui/UserAvatar';
import Spinner from '@/components/ui/spinner';
import { toast } from 'react-toastify';

export default function CollaborationPage() {
  const { t } = useSafeTranslation();
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<InternalGroupChat[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<InternalGroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'consultation'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchUserTerm, setSearchUserTerm] = useState('');
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const isSystemAdmin = user?.roles?.includes('SystemAdmin');

  // Initialize SignalR
  useSignalRInternalChat();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadMessages(selectedGroupId);
    }
  }, [selectedGroupId]);

  // Listen for realtime messages
  useEffect(() => {
    const handleNewMessage = (event: Event) => {
      const detail = (event as CustomEvent).detail as InternalGroupMessage;
      if (detail.groupId === selectedGroupId) {
        setMessages((prev) => [...prev, detail]);
        scrollToBottom();
      }

      // Update last message in groups list
      setGroups((prev) =>
        prev.map((g) =>
          g.id === detail.groupId
            ? {
                ...g,
                lastMessage: detail.content,
                lastMessageAt: detail.createdAt,
              }
            : g
        )
      );
    };

    window.addEventListener(SIGNALR_INTERNAL_MESSAGE_EVENT, handleNewMessage);
    return () =>
      window.removeEventListener(
        SIGNALR_INTERNAL_MESSAGE_EVENT,
        handleNewMessage
      );
  }, [selectedGroupId]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await internalChatApi.getGroups();
      setGroups(data);
      if (data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load groups', error);
      toast.error(
        t(
          'ProfessionalNetwork.collaboration.errors.loadGroups',
          'Failed to load groups'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (groupId: string) => {
    try {
      setMessagesLoading(true);
      const data = await internalChatApi.getMessages(groupId);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroupId) return;

    try {
      const content = newMessage.trim();
      setNewMessage('');
      await internalChatApi.sendMessage(selectedGroupId, content);
      // Realtime listener will add it to the UI
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error(
        t(
          'ProfessionalNetwork.collaboration.errors.sendMessage',
          'Failed to send message'
        )
      );
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleStartMeeting = async () => {
    if (!selectedGroupId) return;

    try {
      const result = await internalChatApi.createMeeting(selectedGroupId);
      if (result.meetingLink) {
        window.open(result.meetingLink, '_blank');
        toast.success(
          t(
            'ProfessionalNetwork.collaboration.meet.success',
            'Meeting created successfully!'
          )
        );
      }
    } catch (error) {
      console.error('Failed to create meeting', error);
      toast.error(
        t(
          'ProfessionalNetwork.collaboration.meet.error',
          'Failed to create meeting'
        )
      );
    }
  };

  const handleOpenCreateModal = async () => {
    if (!isSystemAdmin) {
      toast.info(
        t(
          'ProfessionalNetwork.collaboration.adminOnly',
          'Only System Administrators can create groups.'
        )
      );
      return;
    }
    setIsCreateModalOpen(true);
    loadSystemUsers();
  };

  const loadSystemUsers = async (term?: string) => {
    try {
      const data = await internalChatApi.getSystemUsers(term);
      // Filter out current user
      setSystemUsers(data.filter((u) => u.id !== user?.id));
    } catch (error) {
      console.error('Failed to load system users', error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllByRole = (role: string) => {
    const usersWithRole = systemUsers.filter((u) => u.roles.includes(role));
    const userIds = usersWithRole.map((u) => u.id);
    setSelectedUserIds((prev) => Array.from(new Set([...prev, ...userIds])));
    toast.success(
      t(
        'ProfessionalNetwork.collaboration.selectedRole',
        `Added all members with role: ${role}`
      )
    );
  };

  const handleSelectAllStaff = () => {
    const allInternalIds = systemUsers.map((u) => u.id);
    setSelectedUserIds(allInternalIds);
    toast.success(
      t(
        'ProfessionalNetwork.collaboration.selectedAll',
        'Added all system staff members.'
      )
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUserIds.length === 0) {
      toast.warning(
        t(
          'ProfessionalNetwork.collaboration.createIncomplete',
          'Please provide a name and select at least one member.'
        )
      );
      return;
    }

    try {
      setIsCreating(true);
      await internalChatApi.createGroup(groupName.trim(), selectedUserIds);
      toast.success(
        t(
          'ProfessionalNetwork.collaboration.createSuccess',
          'Group created successfully!'
        )
      );
      setIsCreateModalOpen(false);
      setGroupName('');
      setSelectedUserIds([]);
      loadGroups();
    } catch (error) {
      console.error('Failed to create group', error);
      toast.error(
        t(
          'ProfessionalNetwork.collaboration.createError',
          'Failed to create group.'
        )
      );
    } finally {
      setIsCreating(false);
    }
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Groups Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-lg dark:text-white">
            {t('ProfessionalNetwork.collaboration.groups', 'Internal Groups')}
          </h2>
          <button
            onClick={handleOpenCreateModal}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-primary transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('Common.search', 'Search...')}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedGroupId === group.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate">{group.name}</p>
                  {group.lastMessageAt && (
                    <span className="text-[10px] opacity-60">
                      {new Date(group.lastMessageAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate opacity-70">
                  {group.lastMessage ||
                    t(
                      'ProfessionalNetwork.collaboration.noMessages',
                      'No messages yet'
                    )}
                </p>
              </div>
            </button>
          ))}

          {groups.length === 0 && (
            <div className="text-center py-8 opacity-50">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">
                {t(
                  'ProfessionalNetwork.collaboration.noGroups',
                  'No groups found'
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {!selectedGroupId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">
              {t(
                'ProfessionalNetwork.collaboration.welcomeTitle',
                'Select a Group to Start'
              )}
            </h3>
            <p className="max-w-md">
              {t(
                'ProfessionalNetwork.collaboration.welcomeDesc',
                'Collaborate with your colleagues, share clinical cases, and hold internal consultations.'
              )}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold dark:text-white leading-tight">
                    {selectedGroup?.name}
                  </h3>
                  <p className="text-xs text-green-500 font-medium">
                    {selectedGroup?.memberCount}{' '}
                    {t('ProfessionalNetwork.collaboration.members', 'members')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'chat'
                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t('ProfessionalNetwork.collaboration.tabs.chat', 'Chat')}
                  </button>
                  <button
                    onClick={() => setActiveTab('consultation')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'consultation'
                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    {t(
                      'ProfessionalNetwork.collaboration.tabs.consultation',
                      'Hội chuẩn'
                    )}
                  </button>
                </div>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Info className="w-5 h-5 text-slate-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {activeTab === 'chat' ? (
              <>
                {/* Chat Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50"
                >
                  {messagesLoading ? (
                    <div className="flex justify-center py-4">
                      <Spinner size={24} />
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id;
                      const showAvatar =
                        idx === 0 ||
                        messages[idx - 1].senderId !== msg.senderId;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                        >
                          {!isMe && (
                            <div className="w-8 shrink-0">
                              {showAvatar && (
                                <UserAvatar
                                  fullName={msg.senderName}
                                  avatarUrl={msg.senderAvatar}
                                  size="sm"
                                />
                              )}
                            </div>
                          )}

                          <div
                            className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}
                          >
                            {showAvatar && !isMe && (
                              <span className="text-[10px] font-bold text-slate-500 ml-1 mb-1">
                                {msg.senderName} • {msg.senderType}
                              </span>
                            )}
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm ${
                                isMe
                                  ? 'bg-primary text-white rounded-br-none'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[9px] opacity-40 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {messages.length === 0 && !messagesLoading && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                      <MessageSquare className="w-16 h-16 mb-4" />
                      <p>
                        {t(
                          'ProfessionalNetwork.collaboration.noMessages',
                          'No messages yet'
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleSendMessage()
                      }
                      placeholder={t(
                        'ProfessionalNetwork.collaboration.typeMessage',
                        'Type a message...'
                      )}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm dark:text-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={`p-2.5 rounded-xl transition-all ${
                        newMessage.trim()
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-slate-400'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Consultation Area (Google Meet) */
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                      <Video className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <Video className="w-8 h-8 text-blue-500" />
                      </div>

                      <h2 className="text-2xl font-bold dark:text-white mb-2">
                        {t(
                          'ProfessionalNetwork.collaboration.meet.title',
                          'Group Consultation'
                        )}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 mb-8">
                        {t(
                          'ProfessionalNetwork.collaboration.meet.desc',
                          'Initiate a high-quality video consultation with your group members using Google Meet.'
                        )}
                      </p>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-green-500" />
                          </div>
                          <span>
                            {t(
                              'ProfessionalNetwork.collaboration.meet.feature1',
                              'Sync with Google Calendar'
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-purple-500" />
                          </div>
                          <span>
                            {t(
                              'ProfessionalNetwork.collaboration.meet.feature2',
                              'Auto-invite all group members'
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleStartMeeting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        <Video className="w-6 h-6" />
                        {t(
                          'ProfessionalNetwork.collaboration.meet.startBtn',
                          'Start New Consultation'
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {t(
                        'ProfessionalNetwork.collaboration.meet.scheduled',
                        'Upcoming Consultations'
                      )}
                    </h4>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">
                            MAY
                          </span>
                          <span className="block text-lg font-bold dark:text-white">
                            12
                          </span>
                        </div>
                        <div>
                          <h5 className="font-bold dark:text-white leading-tight">
                            Case Review: Retinal Detachment
                          </h5>
                          <p className="text-xs text-slate-500">
                            14:00 - 15:00 • 5 attendees
                          </p>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 text-blue-500 font-bold text-sm hover:underline">
                        Join Meet <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-primary/5">
              <div>
                <h3 className="text-xl font-bold dark:text-white">
                  {t(
                    'ProfessionalNetwork.collaboration.createGroup',
                    'Create New Group'
                  )}
                </h3>
                <p className="text-sm text-slate-500">
                  {t(
                    'ProfessionalNetwork.collaboration.createGroupDesc',
                    'Set up a new collaboration space for your team.'
                  )}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Group Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  {t(
                    'ProfessionalNetwork.collaboration.modal.groupName',
                    'Group Name'
                  )}
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={t(
                    'ProfessionalNetwork.collaboration.modal.groupNamePlaceholder',
                    'e.g., Retina Specialists, Reception Team...'
                  )}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary focus:ring-0 bg-slate-50 dark:bg-slate-800/50 transition-all"
                />
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  {t(
                    'ProfessionalNetwork.collaboration.modal.quickSelect',
                    'Quick Selection'
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSelectAllByRole('Ophthalmologist')}
                    className="px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    +{' '}
                    {t('Common.roles.ophthalmologist', 'All Ophthalmologists')}
                  </button>
                  <button
                    onClick={() => handleSelectAllByRole('ClinicStaff')}
                    className="px-4 py-2 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    + {t('Common.roles.clinicStaff', 'All Clinic Staff')}
                  </button>
                  <button
                    onClick={handleSelectAllStaff}
                    className="px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                  >
                    +{' '}
                    {t(
                      'ProfessionalNetwork.collaboration.modal.addAll',
                      'All System Members'
                    )}
                  </button>
                </div>
              </div>

              {/* User Search & Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t(
                      'ProfessionalNetwork.collaboration.modal.members',
                      'Select Members'
                    )}
                  </label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                    {selectedUserIds.length}{' '}
                    {t(
                      'ProfessionalNetwork.collaboration.modal.selected',
                      'selected'
                    )}
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchUserTerm}
                    onChange={(e) => {
                      setSearchUserTerm(e.target.value);
                      loadSystemUsers(e.target.value);
                    }}
                    placeholder={t(
                      'ProfessionalNetwork.collaboration.modal.searchPlaceholder',
                      'Search by email or name...'
                    )}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {systemUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-all border-2 ${
                        selectedUserIds.includes(u.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <UserAvatar
                        fullName={u.fullName}
                        avatarUrl={u.avatarUrl}
                        size="sm"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold dark:text-white leading-tight">
                          {u.fullName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {u.email} • {u.roles[0]}
                        </p>
                      </div>
                      {selectedUserIds.includes(u.id) && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                  {systemUsers.length === 0 && (
                    <div className="py-10 text-center opacity-40">
                      <p className="text-sm">
                        {t('Common.noResults', 'No users found')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                {t('Common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={
                  isCreating ||
                  !groupName.trim() ||
                  selectedUserIds.length === 0
                }
                className="flex-[2] py-3 rounded-2xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <Spinner size={20} />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {t(
                  'ProfessionalNetwork.collaboration.modal.createBtn',
                  'Create Group'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
