/**
 * Discover Page
 * Discover posts from professionals and organisations.
 * Tabs switch between AuthorType (Ophthalmologist / Organisation).
 * Category pills and search term narrow results further.
 */

import { useState, useDeferredValue } from 'react';
import { Search, Users, Building2, BookOpen } from 'lucide-react';
import { CompactPostCard } from '../components/post/CompactPostCard';
import { DiscoverSkeleton } from '../components/post/PostSkeleton';
import { useDiscoverPosts } from '../hooks/useNetworkPosts';

type TabType = 'professionals' | 'organisations';

const tabs: {
  id: TabType;
  label: string;
  icon: React.ElementType;
  authorType: string;
}[] = [
  {
    id: 'professionals',
    label: 'Professionals',
    icon: Users,
    authorType: 'Ophthalmologist',
  },
  {
    id: 'organisations',
    label: 'Organisations',
    icon: Building2,
    authorType: 'Organisation',
  },
];

const categories = [
  { value: null as string | null, label: 'All' },
  { value: 'CasePresentation', label: 'Case Presentation' },
  { value: 'PeerDiscussion', label: 'Peer Discussion' },
  { value: 'KnowledgeShare', label: 'Knowledge Share' },
  { value: 'Announcement', label: 'Announcement' },
];

function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<TabType>('professionals');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  const currentAuthorType = tabs.find((t) => t.id === activeTab)!.authorType;

  const { data, isLoading, isFetching } = useDiscoverPosts(
    currentAuthorType,
    selectedCategory ?? undefined,
    deferredQuery.length > 0 ? deferredQuery : undefined
  );

  const posts = data?.items ?? [];

  return (
    <>
      {/* Sticky Header */}
      <header className="hover-animation sticky top-0 z-10 bg-main-background/60 backdrop-blur-md">
        <div className="px-4 py-3">
          <h2 className="text-xl font-bold text-text-main">Discover</h2>
          <p className="text-[13px] text-text-muted mt-0.5">
            Explore posts from professionals and organisations
          </p>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-main-search-background rounded-full 
                         text-[15px] text-text-main placeholder:text-text-muted hover-animation
                         focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-light-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setSelectedCategory(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-medium hover-animation
                         hover:bg-black/[0.03] relative ${
                           activeTab === id
                             ? 'text-text-main font-bold'
                             : 'text-text-muted'
                         }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-brand-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto border-b border-light-border">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap hover-animation ${
                selectedCategory === cat.value
                  ? 'bg-brand-primary text-white'
                  : 'bg-main-search-background text-text-main hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Results */}
      <div className="divide-y divide-light-border">
        {/* Count row */}
        {!isLoading && !isFetching && (
          <div className="px-4 py-2.5">
            <p className="text-[13px] text-text-muted">
              {posts.length} post{posts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {isLoading || isFetching ? (
          <DiscoverSkeleton count={6} />
        ) : posts.length > 0 ? (
          posts.map((post) => <CompactPostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-16 px-4">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted text-[15px]">No posts found</p>
            <p className="text-text-muted text-[13px] mt-1">
              Try a different category or search term
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default DiscoverPage;
