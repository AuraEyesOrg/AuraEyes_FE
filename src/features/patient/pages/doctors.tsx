import { useState } from 'react';
import {
  Search,
  Star,
  Clock,
  MapPin,
  Calendar,
  X,
  ArrowLeft,
  FileText,
  CheckCircle,
  MessageSquare,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  searchOphthalmologistsForPatient,
  type OphthalmologistSearchItem,
  type AvailableSlotItem,
} from '../api/patient.api';
import { listOphthalmologistFeedback } from '../api/feedback.api';
import Spinner from '@/components/ui/spinner';
import { formatShortTime, formatShortDate } from '@/lib/date-utils';
import BookAppointmentPage from './book-appointment';
import BookingConfirmationPage from './booking-confirmation';

const FALLBACK_AVATAR = import.meta.env.VITE_AVATAR_FALLBACK_URL;

function getAvatarUrl(doctor: OphthalmologistSearchItem): string {
  if (doctor.userAvatarUrl) return doctor.userAvatarUrl;
  const name = doctor.userFullName ?? 'Dr';
  return `${FALLBACK_AVATAR}${encodeURIComponent(name)}`;
}

function formatSlotTime(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '--:--' : formatShortTime(value);
}

function formatSlotDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? 'Unknown date'
    : formatShortDate(value, 'short');
}

function isExpiredSlot(slot: AvailableSlotItem) {
  const now = Date.now();

  const startFromDateTime = new Date(slot.startDateTime).getTime();
  if (!Number.isNaN(startFromDateTime)) {
    return startFromDateTime < now;
  }

  const startFromDateAndTime = new Date(
    `${slot.date}T${slot.startTime}Z`
  ).getTime();
  if (!Number.isNaN(startFromDateAndTime)) {
    return startFromDateAndTime < now;
  }

  return false;
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] =
    useState<OphthalmologistSearchItem | null>(null);

  const [bookingMode, setBookingMode] = useState<'none' | 'select' | 'confirm'>(
    'none'
  );
  const [bookingSlotId, setBookingSlotId] = useState<string>('');

  const handleSelectDoctor = (doctor: OphthalmologistSearchItem | null) => {
    setSelectedDoctor(doctor);
  };

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

  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ['patient-ophthalmologist-feedback', selectedDoctor?.id],
    queryFn: () => listOphthalmologistFeedback(selectedDoctor!.id, 1, 20),
    enabled: !!selectedDoctor,
  });
  const feedbacks = feedbackData?.items ?? [];

  return (
    <div className="min-h-screen bg-(--bg-primary) flex flex-col w-full relative">
      <header className="sticky top-0 z-40 border-b border-(--border-color) bg-(--bg-primary)/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-(--text-primary) leading-none">
            Find Ophthalmologists
          </h1>
          <p className="text-sm text-(--text-secondary)">
            Search and select a verified eye specialist for your consultation
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-secondary) hover:bg-[var(--border-color)] rounded-xl transition-all border border-(--border-color) shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </button>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-6 md:p-8">
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
            <p className="text-(--text-secondary)">
              Loading ophthalmologists...
            </p>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => handleSelectDoctor(doctor)}
              className="medical-card p-6 flex flex-col gap-4 hover:border-brand/40 hover:shadow-lg transition-all cursor-pointer group bg-white dark:bg-[#1e3a5f]"
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
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDoctor(doctor);
                    setBookingMode('select');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-brand border border-brand/20 hover:bg-brand hover:text-white text-sm font-medium rounded-lg transition-colors z-10 relative"
                >
                  <Calendar className="w-4 h-4" />
                  View Slot
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
              onClick={() => handleSelectDoctor(null)}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-(--bg-primary) shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-(--border-color)">
              {/* Clean flat header */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-(--border-color) shrink-0">
                <img
                  src={getAvatarUrl(selectedDoctor)}
                  alt={selectedDoctor.userFullName ?? 'Doctor'}
                  className="w-12 h-12 rounded-full object-cover border border-(--border-color) shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-(--text-primary) truncate">
                    {selectedDoctor.userFullName ?? 'Unnamed'}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Verified · {selectedDoctor.yearsOfExperience} yrs exp
                  </span>
                </div>
                <button
                  onClick={() => handleSelectDoctor(null)}
                  className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Content Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Stats Box */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-(--bg-secondary) p-3 rounded-xl border border-(--border-color) flex flex-col items-center justify-center text-center">
                      <span className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                        <Star className="w-4 h-4 fill-amber-500" />
                        {selectedDoctor.ratingAverage
                          ? selectedDoctor.ratingAverage.toFixed(1)
                          : 'No rating'}
                      </span>
                      <span className="text-xs text-(--text-muted) font-medium mt-1">
                        {selectedDoctor.ratingCount || 0} Reviews
                      </span>
                    </div>
                    <div className="bg-(--bg-secondary) p-3 rounded-xl border border-(--border-color) flex flex-col items-center justify-center text-center">
                      <span className="flex items-center gap-1 text-brand font-bold text-lg">
                        <Award className="w-4 h-4 text-brand" />
                        {selectedDoctor.certificateCount || 0}
                      </span>
                      <span className="text-xs text-(--text-muted) font-medium mt-1">
                        Certificates
                      </span>
                    </div>
                  </div>

                  {/* Links Box */}
                  {(selectedDoctor.licenseUrl || selectedDoctor.degreeUrl) && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-bold text-(--text-primary)">
                        Credentials
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoctor.licenseUrl && (
                          <a
                            href={selectedDoctor.licenseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> License
                            Document
                          </a>
                        )}
                        {selectedDoctor.degreeUrl && (
                          <a
                            href={selectedDoctor.degreeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Degree
                            Document
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio block */}
                  {selectedDoctor.bio && (
                    <div className="bg-(--bg-secondary) p-4 rounded-xl border border-(--border-color)">
                      <h3 className="text-sm font-bold text-(--text-primary) mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand" /> About Doctor
                      </h3>
                      <p className="text-sm text-(--text-secondary) leading-relaxed">
                        {selectedDoctor.bio}
                      </p>
                    </div>
                  )}

                  {/* Feedback block */}
                  <div>
                    <h3 className="text-sm font-bold text-(--text-primary) mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-brand" /> Patient
                      Feedback
                    </h3>
                    {feedbackLoading ? (
                      <div className="py-6 flex justify-center">
                        <Spinner size={24} />
                      </div>
                    ) : feedbacks.length > 0 ? (
                      <div className="space-y-3">
                        {feedbacks.map((fb) => (
                          <div
                            key={fb.id}
                            className="p-3 bg-(--bg-secondary) rounded-xl border border-(--border-color)"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-(--text-primary)">
                                {fb.patientFullName ?? 'Anonymous Patient'}
                              </span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < fb.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-(--text-secondary) break-words whitespace-pre-wrap">
                              {fb.comment || 'No comment provided.'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-(--border-color) border-dashed rounded-xl">
                        <p className="text-xs text-(--text-muted)">
                          There are no reviews yet.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Floating call to action */}
                  <button
                    onClick={() => setBookingMode('select')}
                    className="w-full mt-4 py-3 bg-brand hover:bg-brand/90 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:-translate-y-1"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Overlays */}
        {bookingMode === 'select' && selectedDoctor && (
          <BookAppointmentPage
            embeddedDoctorId={selectedDoctor.id}
            embeddedDoctorSnapshot={{
              id: selectedDoctor.id,
              userFullName: selectedDoctor.userFullName,
              userEmail: selectedDoctor.userEmail,
              userAvatarUrl: selectedDoctor.userAvatarUrl,
              yearsOfExperience: selectedDoctor.yearsOfExperience,
              isVerified: selectedDoctor.isVerified,
              bio: selectedDoctor.bio,
            }}
            onClose={() => setBookingMode('none')}
            onProceedToConfirm={(slotId) => {
              setBookingSlotId(slotId);
              setBookingMode('confirm');
            }}
          />
        )}

        {bookingMode === 'confirm' && bookingSlotId && (
          <BookingConfirmationPage
            embeddedSlotId={bookingSlotId}
            onClose={() => setBookingMode('select')}
            onSuccess={() => setBookingMode('none')}
          />
        )}
      </main>
    </div>
  );
}
