/**
 * Profile Page
 * Page for viewing user/professional profiles - fetches data from API
 */

import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Users,
  FileText,
  Award,
  MoreHorizontal,
  Edit3,
  Eye,
  X,
  Flag,
  Share2,
  Copy,
} from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/post/PostSkeleton';
import { InitialsAvatar } from '../components/professional/InitialsAvatar';
import { useUserProfile, useUserPosts } from '../hooks/useNetworkPosts';
import useAuthStore from '@/store/auth-store';

type TabType = 'posts' | 'about';

// Profile header skeleton shown while loading
function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-40 bg-gradient-to-r from-brand-primary/30 to-cyan-200/50" />
      <div className="relative px-6 pt-4">
        <div className="absolute -top-16 left-6 w-32 h-32 rounded-full bg-gray-200 border-4 border-white" />
        <div className="pt-20 space-y-3">
          <div className="h-7 w-48 rounded bg-main-search-background" />
          <div className="h-4 w-64 rounded bg-main-search-background" />
          <div className="h-4 w-40 rounded bg-main-search-background" />
          <div className="flex gap-6 pt-2">
            <div className="h-5 w-16 rounded bg-main-search-background" />
            <div className="h-5 w-16 rounded bg-main-search-background" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?.id || '';

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Phase 3: Fetch profile from API
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useUserProfile(id ?? '');

  // Phase 4: Fetch user's posts from API
  const { data: postsData, isLoading: postsLoading } = useUserPosts(id ?? '');
  const userPosts = postsData?.items ?? [];

  const isOwnProfile = id === currentUserId && !isPreviewMode;

  const availableTabs: TabType[] = ['posts', 'about'];

  // ── Loading state ────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="pb-6">
        <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
          <div className="flex items-center gap-6 px-4 h-[53px]">
            <Link
              to="/network/feed"
              className="p-2 hover:bg-gray-100 rounded-full hover-animation"
            >
              <ArrowLeft className="w-5 h-5 text-text-main" />
            </Link>
            <h2 className="text-xl font-bold text-text-main">Profile</h2>
          </div>
        </header>
        <ProfileSkeleton />
        <div className="mt-6 divide-y divide-light-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error / not found state ──────────────────────────────────────────────
  if (profileError || !profile) {
    return (
      <>
        <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
          <div className="flex items-center gap-6 px-4 h-[53px]">
            <Link
              to="/network/feed"
              className="p-2 hover:bg-gray-100 rounded-full hover-animation"
            >
              <ArrowLeft className="w-5 h-5 text-text-main" />
            </Link>
            <h2 className="text-xl font-bold text-text-main">Profile</h2>
          </div>
        </header>
        <div className="text-center py-12 px-4">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Profile not found</p>
        </div>
      </>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="pb-6">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="sticky top-0 z-20 bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800">
            <Eye className="w-5 h-5" />
            <span className="font-medium">
              You're viewing your profile as others see it
            </span>
          </div>
          <Link
            to={`/network/profile/${currentUserId}`}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-800 hover:text-amber-900"
          >
            <X className="w-4 h-4" />
            Exit Preview
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
        <div className="flex items-center gap-6 px-4 h-[53px]">
          <Link
            to="/network/feed"
            className="p-2 hover:bg-gray-100 rounded-full hover-animation"
          >
            <ArrowLeft className="w-5 h-5 text-text-main" />
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text-main truncate">
              {profile.fullName}
            </h2>
            <p className="text-[13px] text-text-muted">
              {profile.postCount} posts
            </p>
          </div>
          {isOwnProfile && (
            <Link
              to={`/network/profile/${currentUserId}?preview=true`}
              className="flex items-center gap-1.5 text-[13px] text-text-muted hover:text-brand-primary hover-animation"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
          )}
        </div>
      </header>

      {/* Cover & Avatar */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-brand-primary via-cyan-400 to-teal-400">
          {isOwnProfile && (
            <button className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-lg transition-all">
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="absolute -bottom-16 left-6">
          <div className="relative">
            <InitialsAvatar
              fullName={profile.fullName}
              avatarUrl={profile.avatarUrl}
              size="xl"
              className="border-4 border-white shadow-lg"
            />
            {isOwnProfile && (
              <button className="absolute bottom-2 right-2 p-1.5 bg-brand-primary hover:brightness-110 text-white rounded-full shadow-lg transition-all">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 px-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-main">
                {profile.fullName}
              </h1>
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-soft text-brand-primary text-xs font-medium rounded-full">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Specialties — hidden: not available in UserProfileDto */}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <Link
                to={`/network/profile/${currentUserId}?preview=true`}
                className="flex items-center gap-1.5 text-sm font-medium text-text-muted border border-light-border rounded-lg px-3 py-2 hover:bg-main-search-background transition-all"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
            ) : (
              <>
                {/* More Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2 border border-light-border rounded-lg hover:bg-main-search-background transition-all"
                  >
                    <MoreHorizontal className="w-5 h-5 text-text-muted" />
                  </button>

                  <AnimatePresence>
                    {showMoreMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-light-border py-2 z-20"
                      >
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-text-main hover:bg-main-search-background transition-all">
                          <Share2 className="w-4 h-4" />
                          Share profile
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-text-main hover:bg-main-search-background transition-all">
                          <Copy className="w-4 h-4" />
                          Copy link
                        </button>
                        <div className="my-1 border-t border-light-border" />
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-red-500 hover:bg-red-50 transition-all">
                          <Flag className="w-4 h-4" />
                          Report
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-[15px] text-text-main leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-[13px] text-text-muted">
          {profile.yearsOfExperience > 0 && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {profile.yearsOfExperience} years experience
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-[15px]">
          <div>
            <span className="font-bold text-text-main">
              {profile.postCount}
            </span>
            <span className="text-text-muted ml-1">Posts</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-light-border mt-6 -mx-2">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-[15px] font-medium hover-animation hover:bg-black/[0.03] relative ${
                activeTab === tab
                  ? 'text-text-main font-bold'
                  : 'text-text-muted'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-brand-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-1">
        {/* Posts Tab — Phase 4: real posts from API */}
        {activeTab === 'posts' && (
          <div className="divide-y divide-light-border">
            {postsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                />
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No posts yet</p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="px-6 py-4 space-y-6">
            <div>
              <h3 className="font-bold text-[15px] text-text-main mb-2">Bio</h3>
              {profile.bio ? (
                <p className="text-[15px] text-text-main leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-[15px] text-text-muted">No bio added yet.</p>
              )}
            </div>
            {profile.yearsOfExperience > 0 && (
              <div>
                <h3 className="font-bold text-[15px] text-text-main mb-2">
                  Experience
                </h3>
                <div className="flex items-center gap-2 text-[15px] text-text-main">
                  <Award className="w-4 h-4 text-brand-primary" />
                  {profile.yearsOfExperience} years of experience
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab — removed */}
      </div>
    </div>
  );
}

export default ProfilePage;
