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

interface Clinic {
  id: string;
  name: string;
  type: 'clinic' | 'hospital';
  address: string;
  city: string;
  distance: number;
  rating: number;
  reviewCount: number;
  phone: string;
  services: string[];
  imageUrl: string;
  operatingHours: string;
  isPartner: boolean;
}

const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'AURA Vision Clinic',
    type: 'clinic',
    address: '123 Nguyen Hue Street, District 1',
    city: 'Ho Chi Minh City',
    distance: 1.2,
    rating: 4.9,
    reviewCount: 256,
    phone: '+84 28 1234 5678',
    services: ['Retinal Screening', 'OCT Scan', 'Consultation'],
    imageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
    operatingHours: '8:00 AM - 6:00 PM',
    isPartner: true,
  },
  {
    id: '2',
    name: 'FV Hospital - Eye Center',
    type: 'hospital',
    address: '6 Nguyen Luong Bang, District 7',
    city: 'Ho Chi Minh City',
    distance: 3.5,
    rating: 4.8,
    reviewCount: 512,
    phone: '+84 28 5411 3333',
    services: ['Full Eye Exam', 'Surgery', 'Diabetic Screening', 'Glaucoma'],
    imageUrl:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400',
    operatingHours: '7:00 AM - 9:00 PM',
    isPartner: true,
  },
  {
    id: '3',
    name: 'Eye Care Center',
    type: 'clinic',
    address: '45 Le Loi Boulevard, District 1',
    city: 'Ho Chi Minh City',
    distance: 2.1,
    rating: 4.7,
    reviewCount: 189,
    phone: '+84 28 3822 1234',
    services: ['Retinal Imaging', 'Contact Lens', 'Vision Test'],
    imageUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
    operatingHours: '8:30 AM - 5:30 PM',
    isPartner: false,
  },
  {
    id: '4',
    name: 'Vinmec Central Park Hospital',
    type: 'hospital',
    address: '208 Nguyen Huu Canh, Binh Thanh',
    city: 'Ho Chi Minh City',
    distance: 4.8,
    rating: 4.9,
    reviewCount: 823,
    phone: '+84 28 3622 1166',
    services: ['Comprehensive Eye Care', 'Pediatric', 'Surgery', 'Emergency'],
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    operatingHours: '24/7',
    isPartner: true,
  },
];

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
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const filteredClinics = mockClinics.filter((clinic) => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity =
      selectedCity === 'All Cities' || clinic.city === selectedCity;
    const matchesType = selectedType === 'all' || clinic.type === selectedType;
    return matchesSearch && matchesCity && matchesType;
  });

  return (
    <PatientLayout userName="John Doe">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Find Partner Clinics & Hospitals
        </h1>
        <p className="text-[var(--text-secondary)]">
          Search and book appointments at our verified partner locations
        </p>
      </div>

      {/* Search & Filters */}
      <div className="medical-card p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by clinic name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>

          {/* City Filter */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="appearance-none w-full lg:w-48 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand/50 cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
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
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClinics.map((clinic) => (
          <div
            key={clinic.id}
            className={`medical-card overflow-hidden transition-all cursor-pointer ${
              selectedClinic?.id === clinic.id
                ? 'border-brand ring-2 ring-brand/30'
                : 'hover:border-brand/50'
            }`}
            onClick={() => setSelectedClinic(clinic)}
          >
            {/* Image */}
            <div className="relative h-48">
              <img
                src={clinic.imageUrl}
                alt={clinic.name}
                className="w-full h-full object-cover"
              />
              {clinic.isPartner && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                  Partner
                </span>
              )}
              <span
                className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full capitalize ${
                  clinic.type === 'hospital'
                    ? 'bg-purple-500/80 text-white'
                    : 'bg-blue-500/80 text-white'
                }`}
              >
                {clinic.type}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                    {clinic.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MapPin className="w-4 h-4" />
                    <span>{clinic.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{clinic.rating}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {clinic.reviewCount} reviews
                  </p>
                </div>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-2 mb-4">
                {clinic.services.slice(0, 3).map((service) => (
                  <span
                    key={service}
                    className="px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-lg"
                  >
                    {service}
                  </span>
                ))}
                {clinic.services.length > 3 && (
                  <span className="px-2 py-1 text-brand text-xs">
                    +{clinic.services.length - 3} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    {clinic.distance} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {clinic.operatingHours}
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

      {filteredClinics.length === 0 && (
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
