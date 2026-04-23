import { api } from '@/lib/api';

export interface InternalGroupChat {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
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
    name: string;
    description?: string;
    memberIds: string[];
  }): Promise<string> {
    const response = await api.post('/internal-chat/groups', data);
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
   * Create a Google Meet meeting for the group
   */
  async createMeeting(
    groupId: string,
    title?: string
  ): Promise<{ meetingLink: string }> {
    const response = await api.post(
      `/internal-chat/groups/${groupId}/meetings`,
      { title }
    );
    return response.data.data;
  },
};
