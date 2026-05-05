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
  createdAt: string;
}

export interface Ophthalmologist extends User {
  role: 'ophthalmologist';
  specialty: string[];
  bio: string;
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

// Maps to BE PostCategory enum
export type PostCategory = 'PeerDiscussion' | 'KnowledgeShare' | 'Announcement';

// Maps to BE AuthorType enum
export type AuthorType = 'Ophthalmologist' | 'Organisation';

// Maps to BE AttachmentType enum
export type AttachmentType = 'Image' | 'Document' | 'Research';

// Maps to BE AuthorDto
export interface PostAuthor {
  id: string;
  authorType: AuthorType;
  fullName: string;
  avatarUrl?: string;
  organisationName?: string;
}

// Maps to BE PostFeedDto
export interface ProfessionalPost {
  id: string;
  author: PostAuthor;
  content: string;
  category: PostCategory;
  isRepost: boolean;
  repostComment?: string;
  originalPostId?: string;
  /** Nested original post data. Populated by BE when isRepost = true. */
  originalPost?: OriginalPost;
  reactionCount: number;
  commentCount: number;
  repostCount: number;
  viewCount: number;
  allowComments: boolean;
  isInternalCase?: boolean;
  consultationSessionId?: string;
  aiScreeningId?: string;
  patientAge?: number;
  patientGender?: string;
  attachments: PostAttachment[];
  currentUserReaction?: ReactionType;
  isBookmarked: boolean;
  reportCount?: number;
  latestReportReason?: string;
  isHidden: boolean;
  hideReason?: string;
  createdAt: string;
}

/** Compact original post shown inside a repost card. Maps to BE OriginalPostDto. */
export interface OriginalPost {
  id: string;
  author: PostAuthor;
  content: string;
  category: PostCategory;
  attachments: PostAttachment[];
  isHidden: boolean;
  hideReason?: string;
  createdAt: string;
}

// Maps to BE AttachmentDto
export interface PostAttachment {
  id: string;
  type: AttachmentType;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
  displayOrder: number;
}

// Maps to BE ReactionType enum
export type ReactionType =
  | 'Insightful'
  | 'Agree'
  | 'Helpful'
  | 'Question'
  | 'Celebrate';

// Maps to BE UserProfileDto (GET /api/network/profile/{id})
export interface UserProfileDto {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  postCount: number;
  roles: string[];
  certificates: UserProfileCertificate[];
}

export interface UserProfileCertificate {
  id: string;
  type: 'Degree' | 'License' | string;
  name: string;
  issuingAuthority?: string;
  issuedDate: string;
  expiryDate?: string;
  certificateUrl?: string;
}

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

// ============ API REQUEST/RESPONSE TYPES ============

// Maps to BE ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

// Maps to BE PagedResult<T>
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Maps to BE TrendingTopicDto
export interface TrendingTopic {
  category: PostCategory;
  topicName: string;
  postCount: number;
  timeFrame: string;
}

// Maps to BE CreatePostCommand body
export interface CreatePostRequest {
  authorType: AuthorType;
  content: string;
  category: PostCategory;
  organisationId?: string;
  allowComments: boolean;
  isInternalCase?: boolean;
  consultationSessionId?: string;
  aiScreeningId?: string;
  patientAge?: number;
  patientGender?: string;
}

// Maps to BE ToggleReactionCommand body
export interface ToggleReactionRequest {
  type: ReactionType;
}
