/**
 * Groups Page
 * Page for managing and discovering groups
 */

import { useState } from 'react';
import { Plus, Search, Globe, Lock, UsersRound } from 'lucide-react';
import { GroupCard } from '../components/group/GroupCard';
import type { ProfessionalGroup } from '../types';

type FilterType = 'all' | 'joined' | 'discover';

// TODO: Replace with actual API call
const mockGroups: ProfessionalGroup[] = [];

function GroupsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = mockGroups.filter((group) => {
    if (filter === 'joined') return group.isMember;
    if (filter === 'discover') return !group.isMember;
    return true;
  });

  const publicGroupsCount = mockGroups.filter(
    (g) => g.privacy === 'public'
  ).length;
  const privateGroupsCount = mockGroups.filter(
    (g) => g.privacy === 'private'
  ).length;

  return (
    <>
      {/* Sticky Header */}
      <header className="hover-animation sticky top-0 z-10 bg-white/60 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-[53px]">
          <h2 className="text-xl font-bold text-text-main">Groups</h2>
          <button className="btn-primary text-[13px] py-1.5 px-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-main-search-background rounded-full 
                         text-[15px] text-text-main placeholder:text-text-muted hover-animation
                         focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex border-b border-light-border">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-4 text-[15px] font-medium hover-animation hover:bg-black/[0.03] relative ${
              filter === 'all' ? 'text-text-main font-bold' : 'text-text-muted'
            }`}
          >
            All
            {filter === 'all' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setFilter('joined')}
            className={`flex-1 py-4 text-[15px] font-medium hover-animation hover:bg-black/[0.03] relative ${
              filter === 'joined'
                ? 'text-text-main font-bold'
                : 'text-text-muted'
            }`}
          >
            Joined
            {filter === 'joined' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setFilter('discover')}
            className={`flex-1 py-4 text-[15px] font-medium hover-animation hover:bg-black/[0.03] relative ${
              filter === 'discover'
                ? 'text-text-main font-bold'
                : 'text-text-muted'
            }`}
          >
            Discover
            {filter === 'discover' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-primary rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Group Stats */}
      <div className="grid grid-cols-2 gap-px bg-light-border border-b border-light-border">
        <div className="bg-white p-4 flex items-center gap-3 hover-card hover-animation">
          <div className="w-10 h-10 bg-brand-soft rounded-full flex items-center justify-center">
            <Globe className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-text-main">
              {publicGroupsCount}
            </p>
            <p className="text-[13px] text-text-muted">Public</p>
          </div>
        </div>
        <div className="bg-white p-4 flex items-center gap-3 hover-card hover-animation">
          <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-text-main">
              {privateGroupsCount}
            </p>
            <p className="text-[13px] text-text-muted">Private</p>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="divide-y divide-light-border">
        <div className="px-4 py-3">
          <p className="text-[13px] text-text-muted">
            {filteredGroups.length} groups
          </p>
        </div>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div key={group.id} className="hover-card hover-animation">
              <GroupCard group={group} />
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <UsersRound className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No groups found</p>
          </div>
        )}
      </div>
    </>
  );
}

export default GroupsPage;
