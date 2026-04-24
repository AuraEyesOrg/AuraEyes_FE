import { useState, useEffect, useRef, useMemo, type ChangeEvent } from 'react';
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
  X,
  Check,
  Image as ImageIcon,
  Trash2,
  Pencil,
} from 'lucide-react';
import {
  internalChatApi,
  type InternalChatCandidateUser,
  type InternalGroupChat,
  type InternalGroupMessage,
} from '../api/internal-chat.api';
import useAuthStore from '@/store/auth-store';
import {
  joinInternalChatGroup,
  leaveInternalChatGroup,
  useSignalRInternalChat,
  SIGNALR_INTERNAL_GROUP_UPDATE_EVENT,
  SIGNALR_INTERNAL_MESSAGE_EVENT,
} from '@/hooks/useSignalRInternalChat';
import UserAvatar from '@/components/ui/UserAvatar';
import Spinner from '@/components/ui/spinner';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/confirm-modal';

type GroupUiSettings = {
  displayName?: string;
};

type GroupUiSettingsMap = Record<string, GroupUiSettings>;
type GroupMembersMap = Record<string, string[]>;

const GROUP_SETTINGS_KEY = 'internal-chat-group-settings-v1';
const GROUP_MEMBERS_KEY = 'internal-chat-group-members-v1';

type ConfirmTone = 'default' | 'danger';
type ConfirmConfig = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: ConfirmTone;
  onConfirm?: () => Promise<void> | void;
};

const parseImageUrls = (content: string): string[] => {
  const matches = content.match(
    /https?:\/\/[^\s)]+?\.(?:png|jpe?g|gif|webp|bmp|svg)(?:\?[^\s)]*)?/gi
  );
  return matches ?? [];
};

const normalizeRole = (role: string) =>
  role.toLowerCase().replace(/[\s_-]/g, '');

const loadJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const saveJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore localStorage quota/privacy errors
  }
};

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
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isMediaPanelOpen, setIsMediaPanelOpen] = useState(false);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'General' | 'ClinicalCase'>(
    'General'
  );
  const [renameGroupName, setRenameGroupName] = useState('');
  const [selectedMemberIdsForCreate, setSelectedMemberIdsForCreate] = useState<
    string[]
  >([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmConfig>({
    open: false,
    title: '',
    message: '',
  });
  const [isConfirming, setIsConfirming] = useState(false);
  const [candidateUsers, setCandidateUsers] = useState<
    InternalChatCandidateUser[]
  >([]);
  const [candidateLoading, setCandidateLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const previousJoinedGroupRef = useRef<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isSystemAdmin = (user?.roles ?? []).includes('SystemAdmin');

  // Initialize SignalR
  useSignalRInternalChat();

  useEffect(() => {
    void loadGroups();
  }, []);

  useEffect(() => {
    saveJson(GROUP_SETTINGS_KEY, groupSettings);
  }, [groupSettings]);

  useEffect(() => {
    saveJson(GROUP_MEMBERS_KEY, groupMembersMap);
  }, [groupMembersMap]);

  useEffect(() => {
    if (selectedGroupId) {
      void loadMessages(selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    const selectedGroup = groups.find((group) => group.id === selectedGroupId);
    if (selectedGroup?.type === 'General' && activeTab === 'consultation') {
      setActiveTab('chat');
    }
  }, [activeTab, groups, selectedGroupId]);

  useEffect(() => {
    const joinSelectedGroup = async () => {
      if (!selectedGroupId) return;

      if (
        previousJoinedGroupRef.current &&
        previousJoinedGroupRef.current !== selectedGroupId
      ) {
        await leaveInternalChatGroup(previousJoinedGroupRef.current);
      }

      await joinInternalChatGroup(selectedGroupId);
      previousJoinedGroupRef.current = selectedGroupId;
    };

    void joinSelectedGroup();
  }, [selectedGroupId]);

  useEffect(() => {
    return () => {
      if (previousJoinedGroupRef.current) {
        void leaveInternalChatGroup(previousJoinedGroupRef.current);
      }
    };
  }, []);

  // Listen for realtime messages
  useEffect(() => {
    const handleNewMessage = (event: Event) => {
      const detail = (event as CustomEvent).detail as InternalGroupMessage;
      if (detail.groupId === selectedGroupId) {
        setMessages((prev) => [...prev, detail]);
        scrollToBottom();
      }

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

  useEffect(() => {
    const handleGroupUpdate = () => {
      void loadGroups();
    };

    window.addEventListener(
      SIGNALR_INTERNAL_GROUP_UPDATE_EVENT,
      handleGroupUpdate
    );
    return () =>
      window.removeEventListener(
        SIGNALR_INTERNAL_GROUP_UPDATE_EVENT,
        handleGroupUpdate
      );
  }, []);

  const loadCandidateUsers = async () => {
    if (!isSystemAdmin) return;

    try {
      setCandidateLoading(true);
      const data = await internalChatApi.getCandidateUsers();
      setCandidateUsers(data);
    } catch (error) {
      console.error('Failed to load candidate users', error);
      toast.error('Failed to load users for group member selection.');
    } finally {
      setCandidateLoading(false);
    }
  };

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

  const openConfirm = (config: Omit<ConfirmConfig, 'open'>) => {
    setConfirmState({ ...config, open: true });
  };

  const closeConfirm = () => {
    setConfirmState({ open: false, title: '', message: '' });
  };

  const runConfirmedAction = async () => {
    if (!confirmState.onConfirm) return;
    try {
      setIsConfirming(true);
      await confirmState.onConfirm();
      closeConfirm();
    } catch {
      // action-level toast already handles errors
    } finally {
      setIsConfirming(false);
    }
  };

  const sendComposedMessage = async (content: string) => {
    if (!selectedGroupId || !content.trim()) return;
    await internalChatApi.sendMessage(selectedGroupId, content.trim());
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroupId) return;

    try {
      const content = newMessage.trim();
      setNewMessage('');
      await sendComposedMessage(content);
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

  const handleUploadImages = async (files: File[]) => {
    if (!selectedGroupId || files.length === 0) return;

    const fileCount = files.length;
    openConfirm({
      title: 'Confirm image upload',
      message: `Upload ${fileCount} image${fileCount > 1 ? 's' : ''} to this group chat?`,
      confirmLabel: 'Upload',
      tone: 'default',
      onConfirm: async () => {
        try {
          setIsUploadingImages(true);
          const urls = await internalChatApi.uploadImages(
            selectedGroupId,
            files
          );
          if (!urls.length) {
            toast.error('Image upload failed.');
            return;
          }

          const composedContent = [newMessage.trim(), ...urls]
            .filter(Boolean)
            .join('\n');
          setNewMessage('');
          await sendComposedMessage(composedContent);
          toast.success('Image sent successfully.');
        } catch (error) {
          console.error('Failed to upload images', error);
          toast.error('Failed to upload image.');
          throw error;
        } finally {
          setIsUploadingImages(false);
          if (imageInputRef.current) {
            imageInputRef.current.value = '';
          }
        }
      },
    });
  };

  const handleImageFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    await handleUploadImages(selectedFiles);
  };

  const handleToggleMemberSelection = (userId: string) => {
    setSelectedMemberIdsForCreate((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const requestSelectAllByRoleForCreate = (
    role: 'Ophthalmologist' | 'ClinicStaff'
  ) => {
    openConfirm({
      title: 'Confirm role selection',
      message: `Select all users with role ${role} for this new group?`,
      confirmLabel: 'Confirm',
      tone: 'default',
      onConfirm: () => {
        const matchedIds = candidateUsers
          .filter((candidate) =>
            candidate.roles.some(
              (r) => normalizeRole(r) === normalizeRole(role)
            )
          )
          .map((candidate) => candidate.id);

        setSelectedMemberIdsForCreate((prev) =>
          Array.from(new Set([...prev, ...matchedIds]))
        );
        toast.success(`Selected ${matchedIds.length} ${role} user(s).`);
      },
    });
  };

  const requestSelectAllByRoleForExistingGroup = (
    role: 'Ophthalmologist' | 'ClinicStaff'
  ) => {
    if (!selectedGroupId) return;

    openConfirm({
      title: 'Confirm member update',
      message: `Select all ${role} accounts into this group?`,
      confirmLabel: 'Confirm',
      tone: 'default',
      onConfirm: async () => {
        try {
          const matchedIds = candidateUsers
            .filter((candidate) =>
              candidate.roles.some(
                (r) => normalizeRole(r) === normalizeRole(role)
              )
            )
            .map((candidate) => candidate.id);

          const newMemberIds = Array.from(
            new Set([...selectedGroupMembers, ...matchedIds])
          );

          await internalChatApi.updateMembers(selectedGroupId, newMemberIds);

          toast.success(`Member list updated by role ${role}.`);
          void loadGroups();
        } catch (error) {
          console.error('Failed to update members', error);
          toast.error('Failed to update members.');
        }
      },
    });
  };

  const requestToggleMemberInSelectedGroup = (
    memberId: string,
    memberName: string
  ) => {
    if (!selectedGroupId) return;

    const inGroup = selectedGroupMembers.includes(memberId);
    openConfirm({
      title: inGroup ? 'Confirm member removal' : 'Confirm member selection',
      message: inGroup
        ? `Unselect ${memberName} from this group?`
        : `Select ${memberName} for this group?`,
      confirmLabel: 'Confirm',
      tone: inGroup ? 'danger' : 'default',
      onConfirm: async () => {
        try {
          const newMemberIds = inGroup
            ? selectedGroupMembers.filter((id) => id !== memberId)
            : Array.from(new Set([...selectedGroupMembers, memberId]));

          await internalChatApi.updateMembers(selectedGroupId, newMemberIds);

          setGroups((prev) =>
            prev.map((g) =>
              g.id === selectedGroupId
                ? { ...g, memberCount: newMemberIds.length }
                : g
            )
          );
          toast.success('Member selection updated successfully.');
          void loadGroups(); // reload to get updated member list if needed
        } catch (error) {
          console.error('Failed to update members', error);
          toast.error('Failed to update members.');
        }
      },
    });
  };

  const handleCreateGroup = async () => {
    if (!isSystemAdmin) {
      toast.error('Only System Admin can create internal groups.');
      return;
    }

    const trimmedName = newGroupName.trim();
    if (!trimmedName) {
      toast.error('Group name is required.');
      return;
    }

    openConfirm({
      title: 'Confirm group creation',
      message: `Create group "${trimmedName}" with ${selectedMemberIdsForCreate.length} selected member(s)?`,
      confirmLabel: 'Create',
      tone: 'default',
      onConfirm: async () => {
        try {
          setIsCreatingGroup(true);
          const createdGroupId = await internalChatApi.createGroup({
            name: trimmedName,
            type: newGroupType,
            memberIds: selectedMemberIdsForCreate,
          });

          setGroupMembersMap((prev) => ({
            ...prev,
            [createdGroupId]: Array.from(
              new Set([
                ...selectedMemberIdsForCreate,
                ...(user?.id ? [user.id] : []),
              ])
            ),
          }));

          await loadGroups();
          setSelectedGroupId(createdGroupId);
          setIsCreateGroupOpen(false);
          setNewGroupName('');
          setNewGroupType('General');
          setSelectedMemberIdsForCreate([]);
          setMemberSearchTerm('');
          toast.success('Internal group created successfully.');
        } catch (error) {
          console.error('Failed to create group', error);
          toast.error('Failed to create group.');
          throw error;
        } finally {
          setIsCreatingGroup(false);
        }
      },
    });
  };

  const handleStartMeeting = async () => {
    if (!selectedGroupId) return;

    openConfirm({
      title: 'Confirm meeting creation',
      message: 'Create a new Google Meet session for this group?',
      confirmLabel: 'Create Meeting',
      tone: 'default',
      onConfirm: async () => {
        try {
          setIsCreatingMeeting(true);
          const result = await internalChatApi.createMeeting(
            selectedGroupId,
            selectedGroup?.name
              ? `AURA Internal Group - ${selectedGroup.name}`
              : undefined
          );
          if (result.meetingLink) {
            setGroups((prev) =>
              prev.map((group) =>
                group.id === selectedGroupId
                  ? {
                      ...group,
                      meetingLink: result.meetingLink,
                      calendarEventId: result.calendarEventId ?? null,
                    }
                  : group
              )
            );
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
          throw error;
        } finally {
          setIsCreatingMeeting(false);
        }
      },
    });
  };

  const openRenameModal = () => {
    if (!selectedGroup) return;
    setRenameGroupName(selectedGroupName || selectedGroup.name || '');
    setIsRenameModalOpen(true);
    setIsGroupMenuOpen(false);
  };

  const submitRenameGroup = () => {
    if (!selectedGroupId || !selectedGroup) return;
    const trimmedName = renameGroupName.trim();
    if (!trimmedName) {
      toast.error('Group name is required.');
      return;
    }

    openConfirm({
      title: 'Confirm rename',
      message: `Rename this group to "${trimmedName}"?`,
      confirmLabel: 'Rename',
      tone: 'default',
      onConfirm: async () => {
        try {
          await internalChatApi.renameGroup(selectedGroupId, trimmedName);
          setGroups((prev) =>
            prev.map((g) =>
              g.id === selectedGroupId ? { ...g, name: trimmedName } : g
            )
          );
          setIsRenameModalOpen(false);
          toast.success('Group renamed successfully.');
        } catch (error) {
          console.error('Failed to rename group', error);
          toast.error('Failed to rename group.');
        }
      },
    });
  };

  const handleDissolveGroup = () => {
    if (!selectedGroupId) return;

    openConfirm({
      title: 'Confirm group deletion',
      message:
        'Are you sure you want to delete this group? This action cannot be undone.',
      confirmLabel: 'Delete Group',
      tone: 'danger',
      onConfirm: async () => {
        try {
          const groupIdToDelete = selectedGroupId;
          await internalChatApi.deleteGroup(groupIdToDelete);
          setGroups((prev) =>
            prev.filter((group) => group.id !== groupIdToDelete)
          );
          setSelectedGroupId((prev) => {
            if (prev !== groupIdToDelete) return prev;
            const remaining = groups.filter(
              (group) => group.id !== groupIdToDelete
            );
            return remaining[0]?.id ?? null;
          });
          setIsGroupMenuOpen(false);
          toast.success('Group deleted successfully.');
        } catch (error) {
          console.error('Failed to delete group', error);
          toast.error('Failed to delete group.');
        }
      },
    });
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const selectedGroupName = selectedGroup?.name || '';
  const selectedGroupMembers = selectedGroup?.memberIds || [];

  const isConsultationAllowed = selectedGroup?.type === 'ClinicalCase';

  const filteredGroups = useMemo(() => {
    const keyword = groupSearchTerm.trim().toLowerCase();
    if (!keyword) return groups;

    return groups.filter((group) => {
      const display = groupSettings[group.id]?.displayName || group.name;
      return [display, group.lastMessage, group.type]
        .map((value) => String(value ?? '').toLowerCase())
        .some((value) => value.includes(keyword));
    });
  }, [groupSearchTerm, groups, groupSettings]);

  const memberSearchKeyword = memberSearchTerm.trim().toLowerCase();
  const filteredCandidateUsers = useMemo(() => {
    if (!memberSearchKeyword) return candidateUsers;
    return candidateUsers.filter((candidate) =>
      [candidate.fullName, candidate.email, candidate.roles.join(', ')]
        .join(' ')
        .toLowerCase()
        .includes(memberSearchKeyword)
    );
  }, [candidateUsers, memberSearchKeyword]);

  const groupImageUrls = useMemo(() => {
    const urls = messages.flatMap((message) => parseImageUrls(message.content));
    return Array.from(new Set(urls));
  }, [messages]);

  useEffect(() => {
    if (!selectedGroupId) {
      setIsMediaPanelOpen(false);
      setIsGroupMenuOpen(false);
    }
  }, [selectedGroupId]);

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
            onClick={() => {
              if (!isSystemAdmin) {
                toast.info('Only System Admin can create internal groups.');
                return;
              }
              setIsCreateGroupOpen(true);
              void loadCandidateUsers();
            }}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-primary transition-colors"
            title="Create internal group"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={groupSearchTerm}
              onChange={(e) => setGroupSearchTerm(e.target.value)}
              placeholder={t('Common.search', 'Search...')}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {filteredGroups.map((group) => {
            const label = group.name;
            const count = group.memberCount ?? 0;

            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedGroupId === group.id
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">{label}</p>
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
                  <p className="text-[10px] opacity-50 mt-0.5">
                    {count} members •{' '}
                    {group.type === 'ClinicalCase'
                      ? 'Clinical Case'
                      : 'General'}
                  </p>
                </div>
              </button>
            );
          })}

          {filteredGroups.length === 0 && (
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
      <div
        className={`flex-1 flex flex-col min-w-0 relative transition-all duration-300 ${
          isMediaPanelOpen ? 'mr-[320px]' : ''
        }`}
      >
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
                    {selectedGroupName}
                  </h3>
                  <p className="text-xs text-green-500 font-medium">
                    {selectedGroupMembers.length ||
                      selectedGroup?.memberCount ||
                      0}{' '}
                    {t('ProfessionalNetwork.collaboration.members', 'members')}
                    <span className="mx-1.5">•</span>
                    {selectedGroup?.type === 'ClinicalCase'
                      ? 'Clinical Case'
                      : 'General'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative">
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

                  {isConsultationAllowed && (
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
                  )}
                </div>

                <button
                  onClick={() => setIsGroupMenuOpen((prev) => !prev)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Group settings"
                >
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>

                {isGroupMenuOpen && (
                  <div className="absolute right-0 top-11 w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setIsManageMembersOpen(true);
                        setIsGroupMenuOpen(false);
                        void loadCandidateUsers();
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                    >
                      <Users className="w-4 h-4 text-primary" />
                      {t(
                        'ProfessionalNetwork.collaboration.menu.members',
                        'Members'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMediaPanelOpen(true);
                        setIsGroupMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-primary" />
                      {t(
                        'ProfessionalNetwork.collaboration.menu.media',
                        'Group Media'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={openRenameModal}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors border-t border-slate-100 dark:border-slate-700"
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                      {t(
                        'ProfessionalNetwork.collaboration.menu.rename',
                        'Rename group'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDissolveGroup}
                      className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 transition-colors border-t border-slate-100 dark:border-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t(
                        'ProfessionalNetwork.collaboration.menu.delete',
                        'Delete group'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {activeTab === 'chat' ? (
              <>
                {/* Chat Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 transition-colors bg-slate-50/50 dark:bg-slate-900/50"
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
                      const imageUrls = parseImageUrls(msg.content);

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isMe ? 'justify-end' : 'justify-start'
                          } items-end gap-2`}
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
                            className={`max-w-[72%] ${
                              isMe ? 'items-end' : 'items-start'
                            } flex flex-col`}
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

                            {imageUrls.length > 0 && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {imageUrls.map((url) => (
                                  <a
                                    key={`${msg.id}-${url}`}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                  >
                                    <img
                                      src={url}
                                      alt="Shared media"
                                      className="h-24 w-full object-cover"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}

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
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-2">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => void handleImageFileChange(e)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={!selectedGroupId || isUploadingImages}
                      className="p-2 text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
                      title="Upload images"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && void handleSendMessage()
                      }
                      placeholder={t(
                        'ProfessionalNetwork.collaboration.typeMessage',
                        'Type a message...'
                      )}
                      className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm dark:text-white placeholder:text-slate-500"
                    />
                    <button
                      onClick={() => void handleSendMessage()}
                      disabled={!newMessage.trim()}
                      className={`p-2.5 rounded-xl transition-colors ${
                        newMessage.trim()
                          ? 'bg-primary text-white'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
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
                          <span>Sync with Google Calendar</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-purple-500" />
                          </div>
                          <span>Auto-invite all group members</span>
                        </div>
                      </div>

                      <button
                        onClick={() => void handleStartMeeting()}
                        disabled={isCreatingMeeting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60"
                      >
                        <Video className="w-6 h-6" />
                        {isCreatingMeeting
                          ? 'Creating Google Meet...'
                          : 'Start New Consultation'}
                      </button>
                    </div>
                  </div>

                  {selectedGroup?.meetingLink ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">
                            LIVE
                          </span>
                          <span className="block text-lg font-bold dark:text-white">
                            MEET
                          </span>
                        </div>
                        <div>
                          <h5 className="font-bold dark:text-white leading-tight">
                            {selectedGroupName || 'Internal Group Meeting'}
                          </h5>
                          <p className="text-xs text-slate-500">
                            Google Meet ready for this group
                          </p>
                        </div>
                      </div>
                      <a
                        href={selectedGroup.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-500 font-bold text-sm hover:underline"
                      >
                        Join Meet <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No active Google Meet for this group yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Group Media Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-[320px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl transition-transform duration-300 z-40 ${
          isMediaPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-semibold dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Group media
          </h4>
          <button
            onClick={() => setIsMediaPanelOpen(false)}
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 overflow-y-auto h-[calc(100%-57px)]">
          {groupImageUrls.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No shared images yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {groupImageUrls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={url}
                    alt="Group media"
                    className="h-28 w-full object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Create Group Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white">
                Create Internal Group
              </h3>
              <button
                onClick={() => setIsCreateGroupOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="VD: DoctorHCMTeam"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Group Type
                </label>
                <select
                  value={newGroupType}
                  onChange={(e) =>
                    setNewGroupType(
                      e.target.value as 'General' | 'ClinicalCase'
                    )
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="General">General</option>
                  <option value="ClinicalCase">ClinicalCase</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      requestSelectAllByRoleForCreate('Ophthalmologist')
                    }
                    className="inline-flex items-center gap-1.5 rounded-md bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 px-2.5 py-1.5 text-xs font-medium"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Select Ophthalmologist
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      requestSelectAllByRoleForCreate('ClinicStaff')
                    }
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1.5 text-xs font-medium"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Select Clinic Staff
                  </button>
                  <span className="text-xs text-slate-500 ml-auto">
                    Selected: {selectedMemberIdsForCreate.length}
                  </span>
                </div>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {candidateLoading ? (
                    <div className="py-4 flex justify-center">
                      <Spinner size={22} />
                    </div>
                  ) : filteredCandidateUsers.length === 0 ? (
                    <p className="text-xs text-slate-500 px-1 py-2">
                      No user found.
                    </p>
                  ) : (
                    filteredCandidateUsers.map((candidate) => {
                      const selected = selectedMemberIdsForCreate.includes(
                        candidate.id
                      );
                      return (
                        <div
                          key={candidate.id}
                          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg border transition-colors ${
                            selected
                              ? 'border-primary bg-primary/10'
                              : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleMemberSelection(candidate.id)
                            }
                            className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selected
                                ? 'border-primary bg-primary text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {selected ? <Check className="w-3 h-3" /> : null}
                          </button>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {candidate.fullName}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {candidate.email} • {candidate.roles.join(', ')}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateGroupOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreateGroup()}
                disabled={isCreatingGroup}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
              >
                {isCreatingGroup ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {isManageMembersOpen && selectedGroupId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white">
                Manage Members
              </h3>
              <button
                onClick={() => setIsManageMembersOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    requestSelectAllByRoleForExistingGroup('Ophthalmologist')
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 px-2.5 py-1.5 text-xs font-medium"
                >
                  <Users className="w-3.5 h-3.5" />
                  Select Ophthalmologist
                </button>
                <button
                  type="button"
                  onClick={() =>
                    requestSelectAllByRoleForExistingGroup('ClinicStaff')
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1.5 text-xs font-medium"
                >
                  <Users className="w-3.5 h-3.5" />
                  Select Clinic Staff
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm"
                />
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {filteredCandidateUsers.map((candidate) => {
                    const inGroup = selectedGroupMembers.includes(candidate.id);
                    return (
                      <div
                        key={candidate.id}
                        onClick={() =>
                          requestToggleMemberInSelectedGroup(
                            candidate.id,
                            candidate.fullName
                          )
                        }
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                          inGroup
                            ? 'border-primary/30 bg-primary/5 shadow-sm'
                            : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-bold truncate ${inGroup ? 'text-primary' : 'text-slate-900 dark:text-white'}`}
                          >
                            {candidate.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {candidate.email} • {candidate.roles.join(', ')}
                          </p>
                        </div>
                        <div
                          className={`h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                            inGroup
                              ? 'border-primary bg-primary text-white scale-110 shadow-md shadow-primary/20'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {inGroup ? (
                            <Check className="w-4 h-4 stroke-[3px]" />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Group Modal */}
      {isRenameModalOpen && selectedGroupId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white">
                Rename Group
              </h3>
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Group Name
                </label>
                <input
                  type="text"
                  value={renameGroupName}
                  onChange={(e) => setRenameGroupName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRenameGroup}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel ?? 'Confirm'}
        cancelLabel="Cancel"
        tone={confirmState.tone ?? 'default'}
        isLoading={isConfirming}
        onCancel={closeConfirm}
        onConfirm={() => void runConfirmedAction()}
      />
    </div>
  );
}
