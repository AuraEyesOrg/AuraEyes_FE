/**
 * Discover Page
 * Page for discovering professionals, organisations, and groups
 */

import { useState, useDeferredValue } from 'react';
import { Search, Users, Building2 } from 'lucide-react';
import { ProfessionalCard } from '../components/professional/ProfessionalCard';
import { OrganisationCard } from '../components/organisation/OrganisationCard';
import {
  useProfessionals,
  useProfessionalSearch,
  useOrganisations,
} from '../hooks/useNetworkPosts';

type TabType = 'professionals' | 'organisations';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'professionals', label: 'Professionals', icon: Users },
  { id: 'organisations', label: 'Organisations', icon: Building2 },
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

  // Real API data
  const { data: professionalsData, isLoading: proLoading } = useProfessionals();
  const { data: searchResults, isFetching: searchFetching } =
    useProfessionalSearch(deferredQuery, selectedCategory ?? undefined);
  const { data: orgsData, isLoading: orgsLoading } = useOrganisations();

  const professionals =
    deferredQuery.length > 1
      ? (searchResults ?? [])
      : (professionalsData?.items ?? []);
  const organisations = orgsData?.items ?? [];

  return (
    <>
      {/* Sticky Header */}
      <header className="hover-animation sticky top-0 z-10 bg-main-background/60 backdrop-blur-md">
        <div className="px-4 py-3">
          <h2 className="text-xl font-bold text-text-main">Discover</h2>
          <p className="text-[13px] text-text-muted mt-0.5">
            Find professionals and organisations in ophthalmology
          </p>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, specialty, or keyword..."
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
              onClick={() => setActiveTab(id)}
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
      </header>

      {/* Specialty Filter */}
      {activeTab === 'professionals' && (
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
      )}

      {/* Results */}
      <div className="divide-y divide-light-border">
        {activeTab === 'professionals' && (
          <>
            <div className="px-4 py-3">
              <p className="text-[13px] text-text-muted">
                {proLoading || searchFetching
                  ? 'Loading...'
                  : `${professionals.length} professionals found`}
              </p>
            </div>
            {proLoading || searchFetching ? (
              <div className="divide-y divide-light-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 animate-pulse flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-main-search-background shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 w-32 rounded bg-main-search-background" />
                      <div className="h-3 w-48 rounded bg-main-search-background" />
                    </div>
                  </div>
                ))}
              </div>
            ) : professionals.length > 0 ? (
              professionals.map((professional) => (
                <div
                  key={professional.id}
                  className="hover-card hover-animation"
                >
                  <ProfessionalCard professional={professional} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No professionals found</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'organisations' && (
          <>
            <div className="px-4 py-3">
              <p className="text-[13px] text-text-muted">
                {orgsLoading
                  ? 'Loading...'
                  : `${organisations.length} organisations found`}
              </p>
            </div>
            {orgsLoading ? (
              <div className="divide-y divide-light-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 animate-pulse flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-main-search-background shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 w-32 rounded bg-main-search-background" />
                      <div className="h-3 w-48 rounded bg-main-search-background" />
                    </div>
                  </div>
                ))}
              </div>
            ) : organisations.length > 0 ? (
              organisations.map((org) => (
                <div key={org.id} className="hover-card hover-animation">
                  <OrganisationCard organisation={org} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <Building2 className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No organisations found</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default DiscoverPage;
