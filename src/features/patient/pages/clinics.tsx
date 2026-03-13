import { useState } from 'react';
import {
  Search,
  MapPin,
  Star,
  Clock,
  ChevronDown,
  Navigation,
  Calendar,
  Building2,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { useQuery } from '@tanstack/react-query';
import {
  searchOrganisationsForPatient,
  type OrganisationSearchItem,
} from '../api/patient.api';

const cities = [
  'All Cities',
  'Ho Chi Minh City',
  'Hanoi',
  'Da Nang',
  'Can Tho',
];

export default function ClinicsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState<
    'all' | 'clinic' | 'hospital'
  >('all');
  const [selectedOrg, setSelectedOrg] = useState<OrganisationSearchItem | null>(
    null
  );

  const {
    data: organisations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['patient-organisations', searchQuery, selectedType],
    queryFn: () =>
      searchOrganisationsForPatient({
        searchTerm: searchQuery || undefined,
        orgType:
          selectedType === 'all'
            ? undefined
            : selectedType === 'clinic'
              ? 'Clinic'
              : 'Hospital',
        pageNumber: 1,
        pageSize: 20,
      }),
  });

  const organisationsList = organisations?.items ?? [];

  return (
    <PatientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          Find Partner Clinics & Hospitals
        </h1>
        <p className="text-(--text-secondary)">
          Search and book appointments at our verified partner locations
        </p>
      </div>

      {/* Search & Filters */}
      <div className="medical-card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
            <input
              type="text"
              placeholder="Search by clinic name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="appearance-none w-full lg:w-48 px-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-brand/50 cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted) pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="flex rounded-xl overflow-hidden border border-[var(--border-color)]">
            {(['all', 'clinic', 'hospital'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-3 text-sm font-medium transition-colors capitalize ${
                  selectedType === type
                    ? 'bg-brand text-white'
                    : 'bg-(--bg-secondary) text-(--text-secondary) hover:text-(--text-primary)'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="medical-card p-8 mb-6 text-center">
          <p className="text-(--text-secondary)">Loading clinics...</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {organisationsList.map((org) => (
          <div
            key={org.id}
            className={`medical-card overflow-hidden transition-all cursor-pointer ${
              selectedOrg?.id === org.id
                ? 'border-brand ring-2 ring-brand/30'
                : 'hover:border-brand/50'
            }`}
            onClick={() => setSelectedOrg(org)}
          >
            {/* Image */}
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400"
                alt={org.name}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full capitalize ${
                  org.orgType === 'Hospital'
                    ? 'bg-purple-500/80 text-white'
                    : 'bg-blue-500/80 text-white'
                }`}
              >
                {org.orgType}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                    {org.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MapPin className="w-4 h-4" />
                    <span>{org.address ?? 'No address provided'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">4.8</span>
                  </div>
                  <p className="text-xs text-(--text-muted)">0 reviews</p>
                </div>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-(--bg-secondary) text-(--text-secondary) text-xs rounded-lg">
                  Retinal screening
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    ~1.5 km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    08:00 - 17:00
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to booking
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && organisationsList.length === 0 && (
        <div className="medical-card p-12 text-center">
          <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No clinics found
          </h3>
          <p className="text-[var(--text-secondary)]">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </PatientLayout>
  );
}
