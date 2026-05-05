/**
 * Profile Page
 * Page for viewing user/professional profiles - fetches data from API
 */

import { useState, useEffect } from 'react';
import {
  useParams,
  Link,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Users,
  FileText,
  MoreHorizontal,
  Edit3,
  Eye,
  X,
  Flag,
  Share2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/post/PostSkeleton';
import { InitialsAvatar } from '../components/professional/InitialsAvatar';
import { useUserProfile, useUserPosts } from '../hooks/useNetworkPosts';
import useAuthStore from '@/store/auth-store';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

type TabType = 'posts' | 'about';
const BRAND_NAME = 'AURA';

// Profile header skeleton shown while loading
function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-40 bg-slate-200 dark:bg-slate-800" />
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useSafeTranslation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const dateLocale = locale === 'en' ? 'en-US' : 'vi-VN';
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);
  const isPreviewMode = searchParams.get('preview') === 'true';
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?.id || '';
  const currentUserRoles = currentUser?.roles ?? [];
  const isSystemAdminUser = currentUserRoles.includes('SystemAdmin');
  const isOrganisationUser = currentUserRoles.includes('OrgAdmin');

  // Phase 3: Fetch profile from API
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useUserProfile(id ?? '');

  const isClinicStaffProfile = profile?.roles?.includes('ClinicStaff');
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Switch to 'about' tab if it's a clinic staff profile and we're on 'posts'
  useEffect(() => {
    if (isClinicStaffProfile && activeTab === 'posts') {
      setActiveTab('about');
    }
  }, [isClinicStaffProfile, activeTab]);

  // Phase 4: Fetch user's posts from API
  const { data: postsData, isLoading: postsLoading } = useUserPosts(id ?? '');
  const userPosts = postsData?.items ?? [];

  const isOwnProfile = id === currentUserId && !isPreviewMode;
  const isSystemAdminProfileView = isOwnProfile && isSystemAdminUser;
  const isOrganisationProfileView = isOwnProfile && isOrganisationUser;
  const degreeCertificates = (profile?.certificates ?? []).filter(
    (item) => item.type === 'Degree'
  );
  const licenseCertificates = (profile?.certificates ?? []).filter(
    (item) => item.type === 'License'
  );

  const availableTabs: TabType[] = isClinicStaffProfile
    ? ['about']
    : ['posts', 'about'];

  // ── Loading state ────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="pb-6">
        <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
          <div className="flex items-center gap-6 px-4 h-[53px]">
            <Link
              to={toLocalizedPath('/network/feed')}
              className="p-2 hover:bg-gray-100 rounded-full hover-animation"
            >
              <ArrowLeft className="w-5 h-5 text-text-main" />
            </Link>
            <h2 className="text-xl font-bold text-text-main">
              {t('ProfessionalNetwork.profile.title', 'Profile')}
            </h2>
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
              to={toLocalizedPath('/network/feed')}
              className="p-2 hover:bg-gray-100 rounded-full hover-animation"
            >
              <ArrowLeft className="w-5 h-5 text-text-main" />
            </Link>
            <h2 className="text-xl font-bold text-text-main">
              {t('ProfessionalNetwork.profile.title', 'Profile')}
            </h2>
          </div>
        </header>
        <div className="text-center py-12 px-4">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">
            {t(
              'ProfessionalNetwork.profile.states.notFound',
              'Profile not found'
            )}
          </p>
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
              {t(
                'ProfessionalNetwork.profile.preview.banner',
                "You're viewing your profile as others see it"
              )}
            </span>
          </div>
          <Link
            to={toLocalizedPath(`/network/profile/${currentUserId}`)}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-800 hover:text-amber-900"
          >
            <X className="w-4 h-4" />
            {t('ProfessionalNetwork.profile.preview.exit', 'Exit Preview')}
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
        <div className="flex items-center gap-6 px-4 h-[53px]">
          <Link
            to={toLocalizedPath('/network/feed')}
            className="p-2 hover:bg-gray-100 rounded-full hover-animation"
          >
            <ArrowLeft className="w-5 h-5 text-text-main" />
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text-main truncate">
              {profile.fullName}
            </h2>
            {!isClinicStaffProfile && (
              <p className="text-[13px] text-text-muted">
                {t(
                  'ProfessionalNetwork.profile.stats.postsCount',
                  '{{count}} posts',
                  {
                    count: profile.postCount,
                  }
                )}
              </p>
            )}
          </div>
          {isOwnProfile && (
            <Link
              to={toLocalizedPath(
                `/network/profile/${currentUserId}?preview=true`
              )}
              className="flex items-center gap-1.5 text-[13px] text-text-muted hover:text-brand-primary hover-animation"
            >
              <Eye className="w-4 h-4" />
              {t('ProfessionalNetwork.profile.preview.label', 'Preview')}
            </Link>
          )}
        </div>
      </header>

      {/* Cover & Avatar */}
      <div className="relative">
        <div className="relative h-40 bg-slate-100 dark:bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/70 via-white/30 to-teal-100/70 dark:from-cyan-950/40 dark:via-slate-900 dark:to-teal-950/40" />
          <img
            src="/logo.png"
            alt={BRAND_NAME}
            className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 object-contain opacity-35 dark:opacity-25"
          />
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-soft text-brand-primary text-xs font-medium rounded-full">
                <BadgeCheck className="w-3 h-3" />
                {t('ProfessionalNetwork.profile.verified', 'Verified')}
              </span>
            </div>

            {/* Specialties — hidden: not available in UserProfileDto */}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <Link
                to={toLocalizedPath(
                  `/network/profile/${currentUserId}?preview=true`
                )}
                className="flex items-center gap-1.5 text-sm font-medium text-text-muted border border-light-border rounded-lg px-3 py-2 hover:bg-main-search-background transition-all"
              >
                <Eye className="w-4 h-4" />
                {t('ProfessionalNetwork.profile.preview.label', 'Preview')}
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
                          {t(
                            'ProfessionalNetwork.profile.actions.shareProfile',
                            'Share profile'
                          )}
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-text-main hover:bg-main-search-background transition-all">
                          <Copy className="w-4 h-4" />
                          {t(
                            'ProfessionalNetwork.postCard.menu.copyLink',
                            'Copy link'
                          )}
                        </button>
                        {!isSystemAdminUser && (
                          <>
                            <div className="my-1 border-t border-light-border" />
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-red-500 hover:bg-red-50 transition-all">
                              <Flag className="w-4 h-4" />
                              {t(
                                'ProfessionalNetwork.profile.actions.report',
                                'Report'
                              )}
                            </button>
                          </>
                        )}
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
        <div className="flex flex-wrap items-center gap-4 mt-3 text-[13px] text-text-muted"></div>

        {/* Stats */}
        {!isClinicStaffProfile && (
          <div className="flex items-center gap-6 mt-4 text-[15px]">
            <div>
              <span className="font-bold text-text-main">
                {profile.postCount}
              </span>
              <span className="text-text-muted ml-1">
                {t('ProfessionalNetwork.organisation.tabs.posts', 'Posts')}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        {availableTabs.length > 1 && (
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
                {tab === 'posts'
                  ? t('ProfessionalNetwork.organisation.tabs.posts', 'Posts')
                  : t('ProfessionalNetwork.organisation.tabs.about', 'About')}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-brand-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
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
                <p className="text-text-muted">
                  {t(
                    'ProfessionalNetwork.profile.states.noPosts',
                    'No posts yet'
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="px-6 py-4 space-y-6">
            {isSystemAdminProfileView ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-(--bg-secondary)">
                <h3 className="font-bold text-[15px] text-(--text-primary) mb-2">
                  {t(
                    'ProfessionalNetwork.profile.systemAdmin.title',
                    'System Administration Profile'
                  )}
                </h3>
                <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(
                    'ProfessionalNetwork.profile.systemAdmin.description',
                    'System Admin account focuses on AURA platform governance, network moderation, and system operations coordination.'
                  )}
                </p>
                <ul className="mt-4 space-y-2 text-[14px] text-slate-600 dark:text-slate-300 list-disc pl-5">
                  <li>
                    {t(
                      'ProfessionalNetwork.profile.systemAdmin.items.moderatePosts',
                      'Moderate and hide violating posts'
                    )}
                  </li>
                  <li>
                    {t(
                      'ProfessionalNetwork.profile.systemAdmin.items.reviewReports',
                      'Review reported content and escalation cases'
                    )}
                  </li>
                  <li>
                    {t(
                      'ProfessionalNetwork.profile.systemAdmin.items.maintainStandards',
                      'Maintain policy and safety standards across network'
                    )}
                  </li>
                </ul>
              </div>
            ) : isOrganisationProfileView ? (
              <>
                <div>
                  <h3 className="font-bold text-[15px] text-text-main mb-2">
                    {t(
                      'ProfessionalNetwork.profile.organisation.introductionTitle',
                      'Clinic introduction'
                    )}
                  </h3>
                  <p className="text-[15px] text-text-main leading-relaxed">
                    {profile.bio?.trim() ||
                      t(
                        'ProfessionalNetwork.profile.organisation.defaultBio',
                        'The clinic partners with AURA to deploy AI retinal screening, combining specialist expertise and clinical decision support diagnostics.'
                      )}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-(--bg-secondary)">
                    <h3 className="font-bold text-[15px] text-(--text-primary) mb-3">
                      {t(
                        'ProfessionalNetwork.profile.organisation.featuredServicesTitle',
                        'Featured services'
                      )}
                    </h3>
                    <ul className="space-y-2 text-[14px] text-slate-600 dark:text-slate-300 list-disc pl-5">
                      <li>
                        {t(
                          'ProfessionalNetwork.profile.organisation.featuredServices.items.aiScreening',
                          'AI retinal screening at facility level'
                        )}
                      </li>
                      <li>
                        {t(
                          'ProfessionalNetwork.profile.organisation.featuredServices.items.consultationAndReferral',
                          'Result consultation and appropriate referral'
                        )}
                      </li>
                      <li>
                        {t(
                          'ProfessionalNetwork.profile.organisation.featuredServices.items.recordsAndFollowUp',
                          'Medical record management and periodic follow-up'
                        )}
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-(--bg-secondary)">
                    <h3 className="font-bold text-[15px] text-(--text-primary) mb-3">
                      {t(
                        'ProfessionalNetwork.profile.organisation.qualityCommitmentTitle',
                        'Quality commitments'
                      )}
                    </h3>
                    <ul className="space-y-2 text-[14px] text-slate-600 dark:text-slate-300 list-disc pl-5">
                      <li>
                        {t(
                          'ProfessionalNetwork.profile.organisation.qualityCommitment.items.dataPrivacy',
                          'Comply with patient data privacy procedures'
                        )}
                      </li>
                      <li>
                        {t(
                          'ProfessionalNetwork.profile.organisation.qualityCommitment.items.aiAndClinical',
                          'Combine AI assessment with clinical expertise'
                        )}
                      </li>
                      <li>
                        {t(
                          'ProfessionalNetwork.profile.organisation.qualityCommitment.items.fastAccurateCare',
                          'Optimize fast and accurate care experience'
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-bold text-[15px] text-text-main mb-2">
                    {t('ProfessionalNetwork.profile.about.bioTitle', 'Bio')}
                  </h3>
                  {profile.bio ? (
                    <p className="text-[15px] text-text-main leading-relaxed">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-[15px] text-text-muted">
                      {t(
                        'ProfessionalNetwork.profile.about.noBio',
                        'No bio added yet.'
                      )}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-(--bg-secondary)">
                    <h3 className="font-bold text-[15px] text-(--text-primary) mb-3">
                      {t(
                        'ProfessionalNetwork.profile.about.degreesTitle',
                        'Degrees'
                      )}
                    </h3>
                    {degreeCertificates.length === 0 ? (
                      <p className="text-[14px] text-slate-500 dark:text-slate-400">
                        {t(
                          'ProfessionalNetwork.profile.about.noDegreeRecords',
                          'No degree records.'
                        )}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {degreeCertificates.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                          >
                            <p className="font-semibold text-sm text-(--text-primary)">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.issuingAuthority ||
                                t(
                                  'ProfessionalNetwork.profile.about.unknownAuthority',
                                  'Unknown authority'
                                )}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {t(
                                'ProfessionalNetwork.profile.about.issued',
                                'Issued'
                              )}
                              :{' '}
                              {new Date(item.issuedDate).toLocaleDateString(
                                dateLocale
                              )}
                            </p>
                            {item.certificateUrl && (
                              <a
                                href={item.certificateUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                              >
                                {t(
                                  'ProfessionalNetwork.profile.about.viewFile',
                                  'View file'
                                )}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-(--bg-secondary)">
                    <h3 className="font-bold text-[15px] text-(--text-primary) mb-3">
                      {t(
                        'ProfessionalNetwork.profile.about.licensesTitle',
                        'Licenses and Certifications'
                      )}
                    </h3>
                    {licenseCertificates.length === 0 ? (
                      <p className="text-[14px] text-slate-500 dark:text-slate-400">
                        {t(
                          'ProfessionalNetwork.profile.about.noLicenseRecords',
                          'No license records.'
                        )}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {licenseCertificates.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                          >
                            <p className="font-semibold text-sm text-(--text-primary)">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.issuingAuthority ||
                                t(
                                  'ProfessionalNetwork.profile.about.unknownAuthority',
                                  'Unknown authority'
                                )}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {t(
                                'ProfessionalNetwork.profile.about.issued',
                                'Issued'
                              )}
                              :{' '}
                              {new Date(item.issuedDate).toLocaleDateString(
                                dateLocale
                              )}
                            </p>
                            {item.expiryDate && (
                              <p className="text-xs text-slate-400 mt-1">
                                {t(
                                  'ProfessionalNetwork.profile.about.expires',
                                  'Expires'
                                )}
                                :{' '}
                                {new Date(item.expiryDate).toLocaleDateString(
                                  dateLocale
                                )}
                              </p>
                            )}
                            {item.certificateUrl && (
                              <a
                                href={item.certificateUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                              >
                                {t(
                                  'ProfessionalNetwork.profile.about.viewFile',
                                  'View file'
                                )}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Analytics Tab — removed */}
      </div>
    </div>
  );
}

export default ProfilePage;
