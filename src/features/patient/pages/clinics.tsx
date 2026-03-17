import { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Star,
  Stethoscope,
} from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import {
  useCreateClinicAppointment,
  useOrganisationAvailableSlots,
  useOrganisations,
} from '../hooks/use-clinic-booking';
import useAuthStore from '@/store/auth-store';
import { mapClinicPatientErrorMessage } from '@/lib/api-error';
import { formatSlotTime, formatDate, toLocalDateKey } from '@/lib/date-utils';

export default function ClinicsPage() {
  const { user } = useAuthStore();
  const patientId = user?.id ?? '';

  const [searchText, setSearchText] = useState('');
  const [selectedOrganisationId, setSelectedOrganisationId] = useState('');
  const [selectedDate, setSelectedDate] = useState(toLocalDateKey(new Date()));
  const [visitReason, setVisitReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    data: organisations = [],
    isLoading: loadingOrganisations,
    error: organisationsError,
  } = useOrganisations();

  const {
    data: availableSlots = [],
    isLoading: loadingSlots,
    error: availableSlotsError,
  } = useOrganisationAvailableSlots(
    selectedOrganisationId,
    selectedDate,
    !!selectedOrganisationId
  );

  const createAppointmentMutation = useCreateClinicAppointment();

  const filteredOrganisations = useMemo(() => {
    if (!searchText.trim()) return organisations;

    const query = searchText.toLowerCase();
    return organisations.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.address ?? '').toLowerCase().includes(query) ||
        (item.city ?? '').toLowerCase().includes(query)
    );
  }, [organisations, searchText]);

  const selectedOrganisation = organisations.find(
    (item) => item.id === selectedOrganisationId
  );

  const handleBookSlot = async (slotId: string) => {
    if (!selectedOrganisationId || !patientId) return;

    setErrorMessage('');
    setSuccessMessage('');

    try {
      await createAppointmentMutation.mutateAsync({
        organisationId: selectedOrganisationId,
        slotId,
        visitReason: visitReason.trim() || undefined,
      });
      setSuccessMessage(
        'Đặt lịch thành công. Vui lòng theo dõi trạng thái ở Appointments.'
      );
    } catch (error) {
      setErrorMessage(mapClinicPatientErrorMessage(error));
    }
  };

  return (
    <PatientLayout>
      <div>
        <section>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-(--text-primary)">
              Book At Organisation Clinic
            </h1>
            <p className="mt-2 text-(--text-secondary)">
              Pick a clinic, choose a date, and reserve an in-person visit slot.
            </p>
          </div>

          {(errorMessage || successMessage) && (
            <div className="mb-4 space-y-2">
              {errorMessage && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                  {successMessage}
                </div>
              )}
            </div>
          )}

          {(organisationsError || availableSlotsError) && (
            <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {mapClinicPatientErrorMessage(
                organisationsError ?? availableSlotsError
              )}
            </div>
          )}

          <div className="medical-card p-5">
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
              <input
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-secondary) py-2.5 pl-10 pr-3 text-(--text-primary) outline-none ring-brand/40 placeholder:text-(--text-muted) focus:ring-2"
                placeholder="Search organisation by name, city, or address"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            {loadingOrganisations ? (
              <div className="flex items-center gap-3 py-8 text-(--text-secondary)">
                <Spinner />
                <span>Loading organisations...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredOrganisations.map((organisation) => {
                  const isSelected = selectedOrganisationId === organisation.id;

                  return (
                    <button
                      key={organisation.id}
                      type="button"
                      onClick={() => setSelectedOrganisationId(organisation.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-(--border-color) bg-(--bg-secondary) hover:border-cyan-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={organisation.avatarUrl ?? ''}
                          alt={organisation.name}
                          className="h-10 w-10 rounded-lg border border-(--border-color) bg-(--bg-tertiary) object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-(--text-primary)">
                            {organisation.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-(--text-secondary)">
                            <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-0.5 font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                              {organisation.orgType ?? 'Organisation'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 text-amber-500" />
                              {organisation.ratingAverage?.toFixed(1) ?? '0.0'}
                              <span className="text-(--text-muted)">
                                ({organisation.ratingCount ?? 0})
                              </span>
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-xs text-(--text-secondary)">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {[organisation.address, organisation.city]
                                .filter(Boolean)
                                .join(', ') || 'No address'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredOrganisations.length === 0 && (
                  <div className="rounded-xl border border-dashed border-(--border-color) p-6 text-center text-(--text-secondary) md:col-span-2">
                    No organisation found.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="medical-card mt-6 p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-(--text-primary)">
                  Available Slots
                </h2>
                <p className="text-sm text-(--text-secondary)">
                  {selectedOrganisation
                    ? `Organisation: ${selectedOrganisation.name}`
                    : 'Select an organisation to load available slots.'}
                </p>
              </div>

              <div className="flex gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-(--text-secondary)">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                  />
                </div>
                <div className="min-w-55">
                  <label className="mb-1 block text-xs font-medium text-(--text-secondary)">
                    Visit Reason
                  </label>
                  <input
                    value={visitReason}
                    onChange={(event) => setVisitReason(event.target.value)}
                    placeholder="Blurred vision, routine follow-up..."
                    className="w-full rounded-lg border border-(--border-color) bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
                  />
                </div>
              </div>
            </div>

            {!selectedOrganisationId ? (
              <div className="rounded-xl border border-dashed border-(--border-color) p-8 text-center text-(--text-secondary)">
                Please select an organisation first.
              </div>
            ) : loadingSlots ? (
              <div className="flex items-center gap-3 py-8 text-(--text-secondary)">
                <Spinner />
                <span>Loading slots...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {availableSlots.map((slot) => (
                  <div
                    key={slot.slotId}
                    className="rounded-xl border border-(--border-color) bg-(--bg-secondary) p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-(--text-primary)">
                      <Calendar className="h-4 w-4 text-cyan-600" />
                      {formatDate(slot.date)}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-(--text-secondary)">
                      <Clock className="h-4 w-4" />
                      {formatSlotTime(slot.startTime)} -{' '}
                      {formatSlotTime(slot.endTime)}
                    </div>
                    <div className="mt-2 text-xs text-(--text-secondary)">
                      Remaining capacity: {slot.remaining}/{slot.maxCapacity}
                    </div>

                    <button
                      type="button"
                      disabled={
                        slot.remaining <= 0 ||
                        createAppointmentMutation.isPending
                      }
                      onClick={() => void handleBookSlot(slot.slotId)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Stethoscope className="h-4 w-4" />
                      Book Clinic Visit
                    </button>
                  </div>
                ))}

                {availableSlots.length === 0 && (
                  <div className="rounded-xl border border-dashed border-(--border-color) p-8 text-center text-(--text-secondary) md:col-span-2 xl:col-span-3">
                    No available slots for selected date.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </PatientLayout>
  );
}
