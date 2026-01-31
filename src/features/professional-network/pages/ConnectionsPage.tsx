/**
 * Connections Page
 * Page for managing connections
 */

import { useState } from 'react';
import { Users, UserPlus, Clock } from 'lucide-react';
import { ProfessionalCard } from '../components/professional/ProfessionalCard';
import { ConnectionRequestCard } from '../components/connection/ConnectionRequestCard';
import { mockOphthalmologists, mockConnections, currentUser } from '../data';

type TabType = 'all' | 'pending' | 'requests';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'requests', label: 'Requests', icon: UserPlus },
];

// Filter connections by status
const allConnections = mockOphthalmologists.filter(
  (p) => p.id !== currentUser.id
);
const mockPendingRequests = mockConnections.filter(
  (c) => c.status === 'pending'
);
const mockReceivedRequests = mockConnections.filter(
  (c) => c.status === 'pending'
);

function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  return (
    <>
      {/* Sticky Header */}
      <header className="hover-animation sticky top-0 z-10 bg-main-background/60 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-xl font-bold text-text-main">Connections</h2>
            <p className="text-[13px] text-text-muted">
              {allConnections.length} connections
            </p>
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
              {id === 'requests' && mockReceivedRequests.length > 0 && (
                <span className="bg-brand-primary text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px]">
                  {mockReceivedRequests.length}
                </span>
              )}
              {activeTab === id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-brand-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="divide-y divide-light-border">
        {activeTab === 'all' && (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-[13px] text-text-muted">
                {allConnections.length} connections
              </p>
              <select className="bg-main-search-background border-0 rounded-full px-3 py-1.5 text-[13px] text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option>Sort by: Recent</option>
                <option>Sort by: Name</option>
                <option>Sort by: Specialty</option>
              </select>
            </div>
            {allConnections.length > 0 ? (
              allConnections.map((professional) => (
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
                <p className="text-text-muted">No connections yet</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'pending' && (
          <>
            <div className="px-4 py-3">
              <p className="text-[13px] text-text-muted">
                {mockPendingRequests.length} pending requests sent
              </p>
            </div>
            {mockPendingRequests.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Clock className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">
                  No pending connection requests
                </p>
              </div>
            ) : (
              mockPendingRequests.map((connection) => (
                <div key={connection.id} className="hover-card hover-animation">
                  <ConnectionRequestCard
                    connection={connection}
                    type="pending"
                  />
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            <div className="px-4 py-3">
              <p className="text-[13px] text-text-muted">
                {mockReceivedRequests.length} connection requests received
              </p>
            </div>
            {mockReceivedRequests.length === 0 ? (
              <div className="text-center py-12 px-4">
                <UserPlus className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No connection requests</p>
              </div>
            ) : (
              mockReceivedRequests.map((connection) => (
                <div key={connection.id} className="hover-card hover-animation">
                  <ConnectionRequestCard
                    connection={connection}
                    type="received"
                  />
                </div>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ConnectionsPage;
