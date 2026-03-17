import { useMemo, useState } from 'react';
import {
  Search,
  Star,
  Clock,
  MapPin,
  Calendar,
  X,
  ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';
import {
  searchOphthalmologistsForPatient,
  searchAvailableSlotsForPatient,
  type OphthalmologistSearchItem,
  type AvailableSlotItem,
} from '../api/patient.api';
import Spinner from '@/components/ui/spinner';

const FALLBACK_AVATAR = import.meta.env.VITE_AVATAR_FALLBACK_URL;

function getAvatarUrl(doctor: OphthalmologistSearchItem): string {
  if (doctor.userAvatarUrl) return doctor.userAvatarUrl;
  const name = doctor.userFullName ?? 'Dr';
  return `${FALLBACK_AVATAR}${encodeURIComponent(name)}`;
}

function formatSlotTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '--:--';

  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatSlotDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown date';

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] =
    useState<OphthalmologistSearchItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patient-ophthalmologists', searchTerm],
    queryFn: () =>
      searchOphthalmologistsForPatient({
        searchTerm: searchTerm || undefined,
        pageNumber: 1,
        pageSize: 20,
      }),
  });

  const doctors: OphthalmologistSearchItem[] = data?.items ?? [];

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['patient-available-slots', selectedDoctor?.id],
    queryFn: () =>
      searchAvailableSlotsForPatient({
        ophthalmologistId: selectedDoctor?.id,
        pageNumber: 1,
        pageSize: 30,
      }),
    enabled: !!selectedDoctor,
  });

  const slots: AvailableSlotItem[] = slotsData?.items ?? [];

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, AvailableSlotItem[]>();

    for (const slot of slots) {
      const dateKey = slot.date || slot.startDateTime.split('T')[0] || '';
      const daySlots = grouped.get(dateKey) ?? [];
      daySlots.push(slot);
      grouped.set(dateKey, daySlots);
    }

    return Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateKey, daySlots]) => ({
        dateKey,
        dayLabel: formatSlotDate(`${dateKey}T00:00:00`),
        slots: daySlots.sort((a, b) =>
          a.startDateTime.localeCompare(b.startDateTime)
        ),
      }));
  }, [slots]);

  return (
    <PatientLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary) mb-2">
          Find Ophthalmologists
        </h1>
        <p className="text-(--text-secondary)">
          Search and select a verified eye specialist for your consultation
        </p>
      </div>

      {/* Search bar */}
      <div className="medical-card p-6 mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
          <input
            type="text"
            placeholder="Search by doctor name, email or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-(--bg-secondary) border border-(--border-color) rounded-xl text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
        </div>
      </div>

      {isLoading && (
        <div className="medical-card p-8 mb-6 text-center">
          <Spinner size={32} className="mx-auto mb-3" />
          <p className="text-(--text-secondary)">Loading ophthalmologists...</p>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="medical-card p-6 flex flex-col gap-4 hover:border-brand/40 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <img
                src={getAvatarUrl(doctor)}
                alt={doctor.userFullName ?? 'Doctor'}
                className="w-14 h-14 rounded-full object-cover border-2 border-(--border-color) bg-(--bg-secondary)"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-(--text-primary) truncate">
                      {doctor.userFullName ?? 'Unnamed Ophthalmologist'}
                    </h3>
                    <p className="text-xs text-(--text-muted) truncate">
                      {doctor.userEmail}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <Star className="w-3 h-3" />
                      Verified
                    </span>
                    <span className="text-xs text-(--text-muted)">
                      {doctor.yearsOfExperience} yrs exp
                    </span>
                  </div>
                </div>
                {doctor.bio && (
                  <p className="mt-2 text-sm text-(--text-secondary) line-clamp-2">
                    {doctor.bio}
                  </p>
                )}
                {doctor.certificateCount > 0 && (
                  <p className="mt-1 text-xs text-(--text-muted)">
                    {doctor.certificateCount} certificate(s)
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-(--border-color) pt-4">
              <div className="flex items-center gap-4 text-xs text-(--text-secondary)">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Flexible hours
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Online / In-clinic
                </span>
              </div>
              <button
                onClick={() =>
                  navigate('/patient/book', {
                    state: {
                      doctorId: doctor.id,
                      doctorSnapshot: {
                        id: doctor.id,
                        userFullName: doctor.userFullName,
                        userEmail: doctor.userEmail,
                        userAvatarUrl: doctor.userAvatarUrl,
                        yearsOfExperience: doctor.yearsOfExperience,
                        isVerified: doctor.isVerified,
                        bio: doctor.bio,
                      },
                    },
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                View Slots
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && doctors.length === 0 && (
        <div className="medical-card p-12 text-center mt-6">
          <h3 className="text-xl font-semibold text-(--text-primary) mb-2">
            No ophthalmologists found
          </h3>
          <p className="text-(--text-secondary)">
            Try adjusting your search term.
          </p>
        </div>
      )}

      {/* ======= Slots Drawer (slide-in panel) ======= */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedDoctor(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md bg-(--bg-primary) shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 border-b border-(--border-color)">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-(--text-primary)">
                  Available Slots
                </h2>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="p-2 hover:bg-(--bg-secondary) rounded-lg transition-colors text-(--text-secondary)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Doctor info */}
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarUrl(selectedDoctor)}
                  alt={selectedDoctor.userFullName ?? 'Doctor'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-(--border-color)"
                />
                <div>
                  <p className="font-semibold text-(--text-primary)">
                    {selectedDoctor.userFullName ?? 'Unnamed'}
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    {selectedDoctor.yearsOfExperience} years experience
                  </p>
                </div>
              </div>
            </div>

            {/* Slots list */}
            <div className="flex-1 overflow-y-auto p-6">
              {slotsLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner size={32} className="mb-3" />
                  <p className="text-sm text-(--text-secondary)">
                    Loading available slots...
                  </p>
                </div>
              )}

              {!slotsLoading && slots.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-(--text-muted) mx-auto mb-3" />
                  <p className="text-(--text-primary) font-medium mb-1">
                    No slots available
                  </p>
                  <p className="text-sm text-(--text-secondary)">
                    This doctor has no open booking slots right now.
                  </p>
                </div>
              )}

              <div className="space-y-5">
                {slotsByDate.map((dayGroup) => (
                  <section key={dayGroup.dateKey}>
                    <h3 className="text-sm font-bold text-(--text-primary) mb-2">
                      {dayGroup.dayLabel}
                    </h3>
                    <div className="space-y-3">
                      {dayGroup.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="medical-card p-4 hover:border-brand/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-(--text-primary)">
                                {formatSlotTime(slot.startDateTime)} —{' '}
                                {formatSlotTime(slot.endDateTime)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  slot.availableCapacity > 0
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}
                              >
                                {slot.availableCapacity > 0
                                  ? `${slot.availableCapacity} left`
                                  : 'Full'}
                              </span>
                              {slot.availableCapacity > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate('/patient/book', {
                                      state: {
                                        doctorId: selectedDoctor?.id ?? '',
                                        preselectedSlotId: slot.id,
                                        preselectedDate: slot.date,
                                        doctorSnapshot: {
                                          id: selectedDoctor?.id ?? '',
                                          userFullName:
                                            selectedDoctor?.userFullName,
                                          userEmail: selectedDoctor?.userEmail,
                                          userAvatarUrl:
                                            selectedDoctor?.userAvatarUrl,
                                          yearsOfExperience:
                                            selectedDoctor?.yearsOfExperience,
                                          isVerified:
                                            selectedDoctor?.isVerified,
                                          bio: selectedDoctor?.bio,
                                        },
                                      },
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand hover:bg-brand/90 text-white text-xs font-medium rounded-lg transition-colors"
                                >
                                  Book
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}
