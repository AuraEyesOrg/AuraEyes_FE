/**
 * Organisation Page
 * Page for viewing organisation details
 */

import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  Users,
  FileText,
  Building2,
  Award,
} from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import { ProfessionalCardMini } from '../components/professional/ProfessionalCardMini';
import type { Organisation, ProfessionalPost, Ophthalmologist } from '../types';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';

type TabType = 'posts' | 'members' | 'about';

const orgTypeLabels: Record<Organisation['type'], string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  research_center: 'Research Center',
};

// TODO: Replace with actual API calls

function OrganisationPage() {
  const { id: _id } = useParams();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const toLocalizedPath = (pathname: string) =>
    withLocalePathname(locale, pathname);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [organisation, _setOrganisation] = useState<Organisation | null>(null);
  const [orgPosts, _setOrgPosts] = useState<ProfessionalPost[]>([]);
  const [members, _setMembers] = useState<Ophthalmologist[]>([]);

  // TODO: Fetch from API using useEffect

  if (!organisation) {
    return (
      <>
        <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
          <div className="flex items-center gap-4 px-4 h-[53px]">
            <Link
              to={toLocalizedPath('/network/discover')}
              className="p-2 hover:bg-gray-100 rounded-full hover-animation"
            >
              <ArrowLeft className="w-5 h-5 text-text-main" />
            </Link>
            <h2 className="text-xl font-bold text-text-main">Organisation</h2>
          </div>
        </header>
        <div className="text-center py-12 px-4">
          <Building2 className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Organisation not found</p>
        </div>
      </>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-light-border">
        <div className="flex items-center gap-4 px-4 h-[53px]">
          <Link
            to={toLocalizedPath('/network/discover')}
            className="p-2 hover:bg-gray-100 rounded-full hover-animation"
          >
            <ArrowLeft className="w-5 h-5 text-text-main" />
          </Link>
          <div>
            <h1 className="font-bold text-text-main">{organisation.name}</h1>
            <p className="text-[13px] text-text-muted">
              {orgTypeLabels[organisation.type]}
            </p>
          </div>
        </div>
      </header>

      {/* Cover & Logo */}
      <div className="relative">
        <img
          src={organisation.coverUrl}
          alt={organisation.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute -bottom-12 left-6">
          <img
            src={organisation.logoUrl}
            alt={organisation.name}
            className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
          />
        </div>
      </div>

      {/* Organisation Info */}
      <div className="pt-16 px-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-main">
                {organisation.name}
              </h1>
              {organisation.isVerified && (
                <BadgeCheck className="w-6 h-6 text-brand-primary" />
              )}
            </div>
            <p className="flex items-center gap-1.5 text-text-muted mt-1">
              <Building2 className="w-4 h-4" />
              {orgTypeLabels[organisation.type]}
            </p>
          </div>

          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={
              isFollowing
                ? 'btn-secondary text-sm py-2 px-6'
                : 'btn-primary text-sm py-2 px-6'
            }
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Description */}
        <p className="mt-4 text-text-main">{organisation.description}</p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-muted">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {organisation.address}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 py-4 border-y border-light-border">
          <div className="text-center">
            <p className="text-xl font-bold text-text-main">
              {organisation.followerCount.toLocaleString()}
            </p>
            <p className="text-sm text-text-muted">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-text-main">
              {organisation.memberCount}
            </p>
            <p className="text-sm text-text-muted">Members</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-text-main">
              {orgPosts.length}
            </p>
            <p className="text-sm text-text-muted">Posts</p>
          </div>
        </div>

        {/* Accreditations */}
        {organisation.accreditations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {organisation.accreditations.map((acc) => (
              <span
                key={acc}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full"
              >
                <Award className="w-4 h-4" />
                {acc}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-6">
          {(['posts', 'members', 'about'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'posts' &&
          (orgPosts.length > 0 ? (
            <div className="divide-y divide-light-border">
              {orgPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">No posts yet</p>
            </div>
          ))}

        {activeTab === 'members' && (
          <div className="px-6 space-y-2">
            {members.length > 0 ? (
              members.map((member) => (
                <ProfessionalCardMini key={member.id} professional={member} />
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No public members</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="px-6 py-4 space-y-6">
            <div>
              <h3 className="font-bold text-[15px] text-text-main mb-2">
                About
              </h3>
              <p className="text-[15px] text-text-main leading-relaxed">
                {organisation.description}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-text-main mb-2">
                Location
              </h3>
              <p className="flex items-center gap-2 text-text-main">
                <MapPin className="w-4 h-4" />
                {organisation.address}
              </p>
            </div>
            {organisation.accreditations.length > 0 && (
              <div>
                <h3 className="font-bold text-[15px] text-text-main mb-2">
                  Accreditations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {organisation.accreditations.map((acc) => (
                    <span
                      key={acc}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full"
                    >
                      <Award className="w-4 h-4" />
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganisationPage;
