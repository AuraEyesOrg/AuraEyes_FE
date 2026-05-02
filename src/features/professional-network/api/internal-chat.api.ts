import { api } from '@/lib/api';

export interface InternalGroupChat {
  id: string;
  name: string;
  type?: 'General' | 'ClinicalCase';
  consiliumStatus?: 'Ongoing' | 'Concluded';
  consultationSessionId?: string | null;
  meetingLink?: string | null;
  calendarEventId?: string | null;
  memberCount?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  memberIds?: string[];
  creatorId: string;
}

export interface InternalGroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderType: 'Ophthalmologist' | 'ClinicStaff' | 'SystemAdmin';
  content: string;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string;
}

export interface InternalChatCandidateUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  phoneNumber?: string | null;
  status?: string;
  isActive?: boolean;
  emailConfirmed?: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export const internalChatApi = {
  /**
   * Get all internal group chats current user belongs to
   */
  async getGroups(): Promise<InternalGroupChat[]> {
    const response = await api.get('/internal-chat/groups');
    return response.data.data;
  },

  /**
   * Create a new internal group chat
   */
  async createGroup(data: {
    name?: string;
    type?: 'General' | 'ClinicalCase';
    consultationSessionId?: string;
    memberIds: string[];
  }): Promise<string> {
    const response = await api.post('/internal-chat/groups', {
      name: data.name?.trim() || undefined,
      type: data.type ?? 'General',
      consultationSessionId: data.consultationSessionId ?? undefined,
      memberIds: data.memberIds,
    });
    return response.data.data;
  },

  /**
   * Get messages for a specific group chat
   */
  async getMessages(groupId: string): Promise<InternalGroupMessage[]> {
    const response = await api.get(`/internal-chat/groups/${groupId}/messages`);
    return response.data.data;
  },

  /**
   * Send a message to a group chat
   */
  async sendMessage(groupId: string, content: string): Promise<string> {
    const response = await api.post(
      `/internal-chat/groups/${groupId}/messages`,
      { content }
    );
    return response.data.data;
  },

  /**
   * Upload images for internal group chat and return public URLs.
   */
  async uploadImages(groupId: string, images: File[]): Promise<string[]> {
    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));

    const response = await api.post(
      `/internal-chat/groups/${groupId}/upload-images`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data?.data?.uploadedUrls ?? [];
  },

  /**
   * Create a Google Meet meeting for the group
   */
  async createMeeting(
    groupId: string,
    title?: string
  ): Promise<{ meetingLink: string; calendarEventId?: string | null }> {
    const response = await api.post(
      `/internal-chat/groups/${groupId}/meetings`,
      { title }
    );
    return response.data.data;
  },

  /**
   * Rename an internal group
   */
  async renameGroup(groupId: string, name: string): Promise<void> {
    await api.put(`/internal-chat/groups/${groupId}`, { name });
  },

  /**
   * Delete/Dissolve an internal group
   */
  async deleteGroup(groupId: string): Promise<void> {
    await api.delete(`/internal-chat/groups/${groupId}`);
  },

  /**
   * Update members of an internal group
   */
  async updateMembers(groupId: string, memberIds: string[]): Promise<void> {
    await api.put(`/internal-chat/groups/${groupId}/members`, { memberIds });
  },

  /**
   * Candidate users for group member selection.
   * Uses system-admin users endpoint to support "add all by role" UX.
   */
  async getCandidateUsers(): Promise<InternalChatCandidateUser[]> {
    const response = await api.get('/system-admin/users', {
      params: { pageNumber: 1, pageSize: 500 },
    });
    const items = response?.data?.data?.items ?? [];
    return items.map((item: any) => ({
      id: String(item.id),
      fullName: item.fullName || item.name || item.email || 'Unknown',
      email: item.email || '',
      roles: Array.isArray(item.roles) ? item.roles : [],
      phoneNumber: item.phoneNumber ?? null,
      status: item.status,
      isActive: item.isActive,
      emailConfirmed: item.emailConfirmed,
      createdAt: item.createdAt,
      lastLoginAt: item.lastLoginAt ?? null,
    }));
  },
  /**
   * Conclude a clinical consilium session
   */
  async concludeConsilium(groupId: string): Promise<boolean> {
    const response = await api.post(
      `/internal-chat/groups/${groupId}/conclude-consilium`
    );
    return response.data.data;
  },
};
