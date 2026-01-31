/**
 * Professional Network Types
 * Type definitions for the ophthalmologist professional network feature
 */

// ============ USER TYPES ============

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: 'ophthalmologist' | 'organisation' | 'patient';
  isVerified: boolean;
  createdAt: string;
}

export interface Ophthalmologist extends User {
  role: 'ophthalmologist';
  specialty: string[];
  bio: string;
  yearsOfExperience: number;
  organisationId?: string;
  organisationName?: string;
  certificates: Certificate[];
  connectionCount: number;
  followerCount: number;
  postCount: number;
  rating: number;
  totalReviews: number;
}

export interface Organisation {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'research_center';
  address: string;
  licenseNumber: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  followerCount: number;
  memberCount: number;
  isVerified: boolean;
  accreditations: string[];
}

export interface Certificate {
  id: string;
  name: string;
  title: string;
  issuingAuthority: string;
  issuingOrganisation: string;
  issuedDate: string;
  year: number;
  expiryDate?: string;
  certificateUrl?: string;
}

// ============ POST TYPES ============

export type PostType =
  | 'article'
  | 'case_study'
  | 'question'
  | 'achievement'
  | 'news'
  | 'research';

export type PostVisibility =
  | 'public'
  | 'connections_only'
  | 'organisation_only';

export interface ProfessionalPost {
  id: string;
  authorId: string;
  author: Ophthalmologist;
  organisationId?: string;
  organisation?: Organisation;
  content: string;
  type: PostType;
  visibility: PostVisibility;
  mediaUrls: string[];
  attachments: PostAttachment[];
  totalReactions: number;
  totalComments: number;
  totalShares: number;
  userReaction?: ReactionType;
  isEdited: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PostAttachment {
  type: 'research_paper' | 'case_file' | 'document';
  title: string;
  url: string;
  doi?: string;
}

export type ReactionType =
  | 'insightful'
  | 'agree'
  | 'helpful'
  | 'question'
  | 'celebrate';

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  author: Ophthalmologist;
  parentCommentId?: string;
  content: string;
  mediaUrl?: string;
  totalReactions: number;
  replyCount: number;
  userReaction?: ReactionType;
  isEdited: boolean;
  createdAt: string;
  replies?: PostComment[];
}

// ============ CONNECTION TYPES ============

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface ProfessionalConnection {
  id: string;
  requesterId: string;
  requester: Ophthalmologist;
  addresseeId: string;
  addressee: Ophthalmologist;
  status: ConnectionStatus;
  message?: string;
  createdAt: string;
  acceptedAt?: string;
}

// ============ GROUP TYPES ============

export type GroupType =
  | 'specialty'
  | 'research'
  | 'regional'
  | 'case_discussion';

export type GroupPrivacy = 'public' | 'private' | 'invite';
export type GroupRole = 'member' | 'moderator' | 'admin' | 'owner';

export interface ProfessionalGroup {
  id: string;
  ownerId: string;
  owner: Ophthalmologist;
  name: string;
  description: string;
  coverImageUrl: string;
  avatarUrl: string;
  type: GroupType;
  privacy: GroupPrivacy;
  rules: string[];
  topics: string[];
  memberCount: number;
  postCount: number;
  isActive: boolean;
  isMember: boolean;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user: Ophthalmologist;
  role: GroupRole;
  joinedAt: string;
  isApproved: boolean;
}

// ============ SAVED TYPES ============

export interface SavedCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  postCount: number;
  createdAt: string;
}

export interface SavedPost {
  id: string;
  userId: string;
  postId: string;
  post: ProfessionalPost;
  collectionId?: string;
  createdAt: string;
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
