/**
 * Profile Page
 * Page for viewing user/professional profiles
 */

import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  Calendar,
  Star,
  Users,
  FileText,
  Award,
  Mail,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  MessageCircle,
  Edit3,
  Eye,
  X,
  Settings,
  BarChart3,
  TrendingUp,
  UserMinus,
  Flag,
  Share2,
  Copy,
} from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import type { Ophthalmologist, ProfessionalPost } from '../types';

type TabType = 'posts' | 'about' | 'credentials' | 'analytics';

// TODO: Replace with actual API calls and auth context
const currentUserId = 'current-user';

function ProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionPending, setConnectionPending] = useState(false);
  const [professional, _setProfessional] = useState<Ophthalmologist | null>(
    null
  );
  const [userPosts, _setUserPosts] = useState<ProfessionalPost[]>([]);

  // TODO: Fetch from API using useEffect

  const isOwnProfile = id === currentUserId && !isPreviewMode;

  // Mock analytics data
  const analyticsData = {
    profileViews: 1250,
    profileViewsTrend: 12,
    postImpressions: 8500,
    postImpressionsTrend: 8,
    searchAppearances: 340,
    searchAppearancesTrend: -3,
  };

  const handleConnect = () => {
    if (isConnected) {
      setIsConnected(false);
    } else {
      setConnectionPending(true);
      setTimeout(() => {
        setConnectionPending(false);
        setIsConnected(true);
      }, 1000);
    }
  };

  const availableTabs: TabType[] = isOwnProfile
    ? ['posts', 'about', 'credentials', 'analytics']
    : ['posts', 'about', 'credentials'];

  if (!professional) {
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
              {professional.fullName}
            </h2>
            <p className="text-[13px] text-text-muted">
              {professional.postCount} posts
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
            <img
              src={professional.avatarUrl}
              alt={professional.fullName}
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
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
                {professional.fullName}
              </h1>
              {professional.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-soft text-brand-primary text-xs font-medium rounded-full">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {professional.specialty.map((spec) => (
                <span key={spec} className="badge-specialty">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <>
                <button className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
                <Link
                  to="/settings/profile"
                  className="p-2 border border-light-border rounded-lg hover:bg-main-search-background transition-all"
                  title="Account Settings"
                >
                  <Settings className="w-5 h-5 text-text-muted" />
                </Link>
              </>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConnect}
                  disabled={connectionPending}
                  className={`text-sm py-2 px-4 flex items-center gap-1.5 ${
                    isConnected
                      ? 'btn-secondary'
                      : connectionPending
                        ? 'btn-secondary opacity-75 cursor-wait'
                        : 'btn-primary'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Connected
                    </>
                  ) : connectionPending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Connect
                    </>
                  )}
                </motion.button>
                <button className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>

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
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-text-muted hover:bg-main-search-background transition-all">
                          <UserMinus className="w-4 h-4" />
                          Unfollow
                        </button>
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
        <p className="mt-4 text-[15px] text-text-main leading-relaxed">
          {professional.bio}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-[13px] text-text-muted">
          {professional.organisationName && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {professional.organisationName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {professional.yearsOfExperience} years experience
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {professional.rating.toFixed(1)} rating
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-[15px]">
          <div>
            <span className="font-bold text-text-main">
              {professional.connectionCount}
            </span>
            <span className="text-text-muted ml-1">Connections</span>
          </div>
          <div>
            <span className="font-bold text-text-main">
              {professional.followerCount}
            </span>
            <span className="text-text-muted ml-1">Followers</span>
          </div>
          <div>
            <span className="font-bold text-text-main">
              {professional.postCount}
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
        {activeTab === 'posts' && (
          <div className="divide-y divide-light-border">
            {userPosts.length > 0 ? (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-center py-12 px-4">
                <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No posts yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="px-6 py-4 space-y-6">
            <div>
              <h3 className="font-bold text-[15px] text-text-main mb-2">Bio</h3>
              <p className="text-[15px] text-text-main leading-relaxed">
                {professional.bio}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-text-main mb-2">
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {professional.specialty.map((spec) => (
                  <span key={spec} className="badge-specialty">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            {professional.email && (
              <div>
                <h3 className="font-bold text-[15px] text-text-main mb-2">
                  Contact
                </h3>
                <a
                  href={`mailto:${professional.email}`}
                  className="flex items-center gap-2 text-brand-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {professional.email}
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="px-6 py-4 space-y-4">
            {professional.certificates.length > 0 ? (
              professional.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-start gap-3 p-4 border border-light-border rounded-xl"
                >
                  <Award className="w-6 h-6 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[15px] text-text-main">
                      {cert.title}
                    </h4>
                    <p className="text-[13px] text-text-muted">
                      {cert.issuingOrganisation} · {cert.year}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No credentials added</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && isOwnProfile && (
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border border-light-border rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-primary" />
                    <span className="font-medium text-text-main">
                      Profile views
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${analyticsData.profileViewsTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {analyticsData.profileViewsTrend}%
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-text-main">
                  {analyticsData.profileViews.toLocaleString()}
                </p>
              </div>
              <div className="p-4 border border-light-border rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-primary" />
                    <span className="font-medium text-text-main">
                      Post impressions
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${analyticsData.postImpressionsTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {analyticsData.postImpressionsTrend}%
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-text-main">
                  {analyticsData.postImpressions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
