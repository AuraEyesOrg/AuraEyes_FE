/**
 * Network Right Panel Component
 * Right aside panel with search, trends, and suggestions
 *
 * Width: w-96 (384px)
 * Hidden on screens < lg (1024px)
 */

import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ProfessionalCardMini } from '../professional/ProfessionalCardMini';
import { mockOphthalmologists, mockGroups, trendingTopics } from '../../data';

export function NetworkRightPanel() {
  // Get suggested connections (skip first 2, take next 3)
  const suggestedConnections = mockOphthalmologists.slice(2, 5);
  // Get user's groups (members only)
  const myGroups = mockGroups.filter((g) => g.isMember);

  return (
    <aside className="hidden lg:flex w-96 flex-col gap-4 px-4 py-3 pt-1">
      {/* Search - Twitter style: sticky, rounded-full */}
      <div className="sticky top-0 z-10 bg-main-background py-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
          <input
            type="text"
            placeholder="Search professionals, posts..."
            className="w-full pl-12 pr-4 py-3 bg-main-search-background rounded-full 
                       text-[15px] placeholder:text-text-muted hover-animation
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
          />
        </div>
      </div>

      {/* Trending Topics */}
      <section className="hover-animation rounded-2xl bg-main-sidebar-background overflow-hidden">
        <h2 className="font-extrabold text-xl text-text-main px-4 py-3">
          Trending Topics
        </h2>
        <div>
          {trendingTopics.map((topic, index) => (
            <Link
              key={topic.tag}
              to={`/network/discover?tag=${encodeURIComponent(topic.tag)}`}
              className="hover-animation accent-tab hover-card relative 
                         flex flex-col gap-0.5 px-4 py-3"
            >
              <p className="text-[13px] text-text-muted">
                #{index + 1} · Trending
              </p>
              <p className="font-bold text-[15px] text-text-main">
                {topic.tag}
              </p>
              <p className="text-[13px] text-text-muted">{topic.posts} posts</p>
            </Link>
          ))}
        </div>
        <Link
          to="/network/discover"
          className="custom-button accent-tab hover-card block w-full rounded-2xl
                     rounded-t-none text-center text-brand-primary px-4 py-3"
        >
          Show more
        </Link>
      </section>

      {/* Suggested Connections - Who to follow */}
      <section className="hover-animation rounded-2xl bg-main-sidebar-background overflow-hidden">
        <h2 className="font-bold text-xl text-text-main px-4 py-3">
          Who to follow
        </h2>
        <div>
          {suggestedConnections.map((professional) => (
            <div
              key={professional.id}
              className="hover-card hover-animation px-4 py-3"
            >
              <ProfessionalCardMini professional={professional} />
            </div>
          ))}
        </div>
        <Link
          to="/network/discover"
          className="custom-button accent-tab hover-card block w-full rounded-2xl
                     rounded-t-none text-center text-brand-primary px-4 py-3"
        >
          Show more
        </Link>
      </section>

      {/* Active Groups - Your Groups */}
      <section className="hover-animation rounded-2xl bg-main-sidebar-background overflow-hidden">
        <h2 className="font-bold text-xl text-text-main px-4 py-3">
          Your Groups
        </h2>
        <div>
          {myGroups.slice(0, 3).map((group) => (
            <Link
              key={group.id}
              to={`/network/groups`}
              className="flex items-center gap-3 px-4 py-3 hover-card hover-animation"
            >
              <img
                src={group.avatarUrl}
                alt={group.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px] text-text-main truncate">
                  {group.name}
                </p>
                <p className="text-[13px] text-text-muted">
                  {group.memberCount.toLocaleString()} members
                </p>
              </div>
            </Link>
          ))}
        </div>
        <Link
          to="/network/groups"
          className="custom-button accent-tab hover-card block w-full rounded-2xl
                     rounded-t-none text-center text-brand-primary px-4 py-3"
        >
          Show more
        </Link>
      </section>

      {/* Footer */}
      <nav className="px-4 text-[13px] text-text-muted flex flex-wrap gap-x-3 gap-y-1">
        <Link to="/ethics" className="custom-underline">
          Terms
        </Link>
        <Link to="/ethics" className="custom-underline">
          Privacy
        </Link>
        <Link to="/contact" className="custom-underline">
          Help
        </Link>
        <span>© 2026 Aura</span>
      </nav>
    </aside>
  );
}
