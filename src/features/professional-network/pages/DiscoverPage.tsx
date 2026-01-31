/**
 * Discover Page
 * Page for discovering professionals, organisations, and groups
 */

import { useState } from 'react';
import { Search, Users, Building2, UsersRound } from 'lucide-react';
import { ProfessionalCard } from '../components/professional/ProfessionalCard';
import { OrganisationCard } from '../components/organisation/OrganisationCard';
import { GroupCard } from '../components/group/GroupCard';
import { mockOphthalmologists, mockOrganisations, mockGroups } from '../data';

type TabType = 'professionals' | 'organisations' | 'groups';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'professionals', label: 'Professionals', icon: Users },
  { id: 'organisations', label: 'Organisations', icon: Building2 },
  { id: 'groups', label: 'Groups', icon: UsersRound },
];

const specialties = [
  'All',
  'Retina',
  'Glaucoma',
  'Cornea',
  'Pediatric',
  'AI in Ophthalmology',
];

function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<TabType>('professionals');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Sticky Header */}
      <header className="hover-animation sticky top-0 z-10 bg-main-background/60 backdrop-blur-md">
        <div className="px-4 py-3">
          <h2 className="text-xl font-bold text-text-main">Discover</h2>
          <p className="text-[13px] text-text-muted mt-0.5">
            Find professionals, organisations, and groups in ophthalmology
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
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap hover-animation ${
                selectedSpecialty === specialty
                  ? 'bg-brand-primary text-white'
                  : 'bg-main-search-background text-text-main hover:bg-gray-200'
              }`}
            >
              {specialty}
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
                {mockOphthalmologists.length} professionals found
              </p>
            </div>
            {mockOphthalmologists.length > 0 ? (
              mockOphthalmologists.map((professional) => (
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
                {mockOrganisations.length} organisations found
              </p>
            </div>
            {mockOrganisations.length > 0 ? (
              mockOrganisations.map((org) => (
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

        {activeTab === 'groups' && (
          <>
            <div className="px-4 py-3">
              <p className="text-[13px] text-text-muted">
                {mockGroups.length} groups found
              </p>
            </div>
            {mockGroups.length > 0 ? (
              mockGroups.map((group) => (
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
          </>
        )}
      </div>
    </>
  );
}

export default DiscoverPage;
