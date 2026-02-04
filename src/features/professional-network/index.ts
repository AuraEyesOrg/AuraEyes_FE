/**
 * Professional Network Feature Module
 * Central barrel export for the Professional Network feature
 *
 * This module contains all functionality for professional networking
 * including feed, discover, connections, groups, and saved posts.
 */

// Pages
export {
  FeedPage,
  DiscoverPage,
  ConnectionsPage,
  GroupsPage,
  SavedPage,
  PostDetailPage,
  ProfilePage,
  OrganisationPage,
} from './pages';

// Components
export {
  NetworkLayout,
  NetworkSidebar,
  NetworkRightPanel,
  ProfessionalAvatar,
  ProfessionalCard,
  ProfessionalCardMini,
  PostCard,
  PostComposer,
  CommentCard,
  GroupCard,
  OrganisationCard,
  ConnectionRequestCard,
} from './components';

// API
export {
  NETWORK_ENDPOINTS,
  postsApi,
  professionalsApi,
  organisationsApi,
  connectionsApi,
  groupsApi,
  savedApi,
} from './api';

// Types - re-export all types
export type * from './types';
