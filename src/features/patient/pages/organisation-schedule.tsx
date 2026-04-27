import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowRight,
  CheckCircle2,
  User,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isPast,
  isToday,
} from 'date-fns';
import Spinner from '@/components/ui/spinner';
import PatientLayout from '../components/PatientLayout';
import {
  useCreateClinicAppointment,
  useOrganisationSchedule,
} from '../hooks/use-clinic-booking';
import { formatSlotTime } from '@/lib/date-utils';
import { toast } from 'react-toastify';
import { mapClinicPatientErrorMessage } from '@/lib/api-error';
import { useNavigate } from 'react-router-dom';
import type {
  AggregatedSlotDto,
  DoctorSlotDetailDto,
} from '../types/clinic-booking.types';

const REASON_SUGGESTIONS = [
  'Routine follow-up',
  'Blurred vision',
  'Eye pressure check',
  'Eye pain or discomfort',
  'First-time visit',
];

export default function OrganisationSchedulePage() {
  const { t: i18nT } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    i18nT(key as never, options as never) as unknown as string;
  const navigate = useNavigate();

  // 1. Logic
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date())
  );
  const [viewDate, setViewDate] = useState<Date>(startOfMonth(new Date()));
  const [visitReason, setVisitReason] = useState('');

  // New states for aggregated selection
  const [selectedAggregatedSlot, setSelectedAggregatedSlot] =
    useState<AggregatedSlotDto | null>(null);
  const [selectedDoctorSlot, setSelectedDoctorSlot] =
    useState<DoctorSlotDetailDto | null>(null);

  const dateParams = useMemo(() => {
    const d = format(selectedDate, 'yyyy-MM-dd');
    return { fromDate: d, toDate: d };
  }, [selectedDate]);

  const { data: schedule, isLoading: loadingSchedule } =
    useOrganisationSchedule(dateParams, true);

  const { mutate: createBooking, isPending: isBooking } =
    useCreateClinicAppointment();

  // 2. Calendar Logic
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const prefixDays = Array.from({ length: getDay(daysInMonth[0]) }).map(
    (_, i) => i
  );

  // 3. Slot Grouping
  const groupedSlots = useMemo(() => {
    if (!schedule?.aggregatedSlots) return { morning: [], afternoon: [] };

    return schedule.aggregatedSlots.reduce(
      (
        acc: { morning: AggregatedSlotDto[]; afternoon: AggregatedSlotDto[] },
        slot
      ) => {
        const hour = parseInt(slot.startTime.split(':')[0], 10);
        if (hour < 12) acc.morning.push(slot);
        else acc.afternoon.push(slot);
        return acc;
      },
      { morning: [], afternoon: [] }
    );
  }, [schedule]);

  const handleBook = () => {
    if (!selectedDoctorSlot) {
      toast.warn('Vui lòng chọn bác sĩ để tiếp tục.');
      return;
    }

    createBooking(
      {
        slotId: selectedDoctorSlot.slotId,
        visitReason: visitReason || 'Regular eye checkup',
      },
      {
        onSuccess: (data) => {
          if (data.paymentUrl) {
            toast.info(
              `Đặt lịch thành công! Đang chuyển đến trang thanh toán đặt cọc ${(data.depositAmount ?? 0).toLocaleString('vi-VN')} VND...`
            );
            setTimeout(() => {
              window.location.href = data.paymentUrl!;
            }, 1500);
          } else {
            toast.success(t('ClinicBooking.success.booked'));
            navigate('/patient/appointments');
          }
        },
        onError: (err) => {
          toast.error(mapClinicPatientErrorMessage(err));
        },
      }
    );
  };

  const handleTimeSelect = (slot: AggregatedSlotDto) => {
    setSelectedAggregatedSlot(slot);
    setSelectedDoctorSlot(null);
  };

  return (
    <PatientLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Available Slots
          </h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            Organisation:{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {schedule?.name || 'Aura Eyes Clinic'}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Calendar & Reason */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Visit Date
                </p>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => setViewDate(subMonths(viewDate, 1))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <ChevronLeft size={18} className="text-slate-600" />
                  </button>
                  <h3 className="font-bold text-slate-900 dark:text-white capitalize">
                    {format(viewDate, 'MMMM yyyy')}
                  </h3>
                  <button
                    onClick={() => setViewDate(addMonths(viewDate, 1))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <ChevronRight size={18} className="text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] font-bold text-slate-400 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {prefixDays.map((i) => (
                    <div key={`p-${i}`} />
                  ))}
                  {daysInMonth.map((date, idx) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isDisabled = isPast(date) && !isToday(date);

                    return (
                      <button
                        key={idx}
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedAggregatedSlot(null);
                          setSelectedDoctorSlot(null);
                        }}
                        className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all relative group ${
                          isSelected
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                            : isDisabled
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {format(date, 'd')}
                        {isToday(date) && !isSelected && (
                          <div className="absolute bottom-1 w-1 h-1 bg-cyan-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Visit Reason
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  placeholder="Blurred vision, routine follow-up..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                />
                <div className="flex flex-wrap gap-2">
                  {REASON_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setVisitReason(s)}
                      className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all ${
                        visitReason === s
                          ? 'bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-900/20 dark:border-cyan-800 dark:text-cyan-400'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Slots */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {format(selectedDate, 'MMM d, yyyy')}
              </h2>
              {schedule?.aggregatedSlots && (
                <span className="text-xs font-bold text-slate-400">
                  {schedule.aggregatedSlots.length} time frame(s)
                </span>
              )}
            </div>

            <div className="flex-1 space-y-10">
              {loadingSchedule ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                  <Spinner size={32} />
                  <p className="mt-4 text-sm italic">Searching for slots...</p>
                </div>
              ) : schedule?.aggregatedSlots &&
                schedule.aggregatedSlots.length > 0 ? (
                <div className="space-y-10">
                  {groupedSlots.morning.length > 0 && (
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock size={12} className="text-cyan-500" /> Morning
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {groupedSlots.morning.map((slot) => (
                          <AggregatedSlotCard
                            key={`${slot.startTime}-${slot.endTime}`}
                            slot={slot}
                            isSelected={
                              selectedAggregatedSlot?.startTime ===
                              slot.startTime
                            }
                            onClick={() => handleTimeSelect(slot)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {groupedSlots.afternoon.length > 0 && (
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock size={12} className="text-amber-500" /> Afternoon
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {groupedSlots.afternoon.map((slot) => (
                          <AggregatedSlotCard
                            key={`${slot.startTime}-${slot.endTime}`}
                            slot={slot}
                            isSelected={
                              selectedAggregatedSlot?.startTime ===
                              slot.startTime
                            }
                            onClick={() => handleTimeSelect(slot)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  <AnimatePresence mode="wait">
                    {selectedAggregatedSlot && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="pt-10 border-t border-slate-100 dark:border-slate-800 space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <User size={20} className="text-cyan-600" />
                            Select Ophthalmologist
                          </h3>
                          <span className="text-xs font-medium text-slate-400">
                            For{' '}
                            {formatSlotTime(selectedAggregatedSlot.startTime)} -{' '}
                            {formatSlotTime(selectedAggregatedSlot.endTime)}
                          </span>
                        </div>

                        <div className="flex flex-col gap-4">
                          {/* Random Doctor Option */}
                          <button
                            onClick={() => {
                              const availableDoctors =
                                selectedAggregatedSlot.doctors.filter(
                                  (d) => !d.isBooked
                                );
                              if (availableDoctors.length > 0) {
                                const randomDoc =
                                  availableDoctors[
                                    Math.floor(
                                      Math.random() * availableDoctors.length
                                    )
                                  ];
                                setSelectedDoctorSlot(randomDoc);
                                toast.info(
                                  `Đã chọn ngẫu nhiên bác sĩ: ${randomDoc.doctorName}`
                                );
                              }
                            }}
                            className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/30 hover:bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/10 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border-2 border-white dark:border-slate-800 shadow-sm">
                              <RefreshCw
                                size={24}
                                className="group-hover:rotate-180 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="text-sm font-bold text-cyan-900 dark:text-cyan-100">
                                Bất kỳ bác sĩ nào
                              </h4>
                              <p className="text-[10px] text-cyan-600/70 dark:text-cyan-400/70 font-medium">
                                Hệ thống sẽ chọn ngẫu nhiên 1 bác sĩ còn rảnh
                                cho bạn
                              </p>
                            </div>
                            <ArrowRight
                              size={18}
                              className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-all"
                            />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedAggregatedSlot.doctors.map((doctor) => (
                              <DoctorCard
                                key={doctor.doctorId}
                                doctor={doctor}
                                isSelected={
                                  selectedDoctorSlot?.doctorId ===
                                  doctor.doctorId
                                }
                                onClick={() =>
                                  !doctor.isBooked &&
                                  setSelectedDoctorSlot(doctor)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-full text-slate-300">
                    <CalendarDays size={48} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                      No Slots Available
                    </h4>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                      There are no available slots for this date. Please select
                      another day from the calendar.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block mt-auto pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <Info size={18} className="text-blue-500 shrink-0" />
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-tight">
                    Appointment is subject to confirmation. Please arrive 15
                    minutes before your time slot.
                  </p>
                </div>
                <button
                  disabled={!selectedDoctorSlot || isBooking}
                  onClick={handleBook}
                  className="bg-cyan-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-cyan-700 transition-all hover:shadow-xl hover:shadow-cyan-600/20 active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
                >
                  {isBooking ? (
                    <Spinner size={20} />
                  ) : (
                    <>
                      Confirm Booking <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}

function AggregatedSlotCard({
  slot,
  isSelected,
  onClick,
}: {
  slot: AggregatedSlotDto;
  isSelected: boolean;
  onClick: () => void;
}) {
  const availableCount = slot.doctors.filter((d) => !d.isBooked).length;
  const isFull = availableCount === 0;

  return (
    <button
      disabled={isFull}
      onClick={onClick}
      className={`p-3 rounded-xl border text-center transition-all duration-300 relative group flex flex-col gap-1.5 ${
        isSelected
          ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/10'
          : isFull
            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-400 hover:shadow-md'
      }`}
    >
      <span
        className={`text-sm font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}
      >
        {formatSlotTime(slot.startTime)}
      </span>
      <div className="flex flex-col gap-0">
        <span
          className={`text-[10px] font-bold ${isSelected ? 'text-cyan-100' : isFull ? 'text-red-400' : 'text-slate-400'}`}
        >
          {isFull ? 'Full' : `${availableCount}/${slot.doctors.length} Dr.`}
        </span>
      </div>

      {isSelected && (
        <motion.div
          layoutId="slotCheck"
          className="absolute -top-1.5 -right-1.5 bg-white text-cyan-600 rounded-full p-0.5 shadow-md border border-slate-50"
        >
          <CheckCircle2 size={12} />
        </motion.div>
      )}
    </button>
  );
}

function DoctorCard({
  doctor,
  isSelected,
  onClick,
}: {
  doctor: DoctorSlotDetailDto;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={doctor.isBooked}
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        isSelected
          ? 'bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800 shadow-sm'
          : doctor.isBooked
            ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-200'
      }`}
    >
      <div className="relative">
        {doctor.doctorAvatar ? (
          <img
            src={doctor.doctorAvatar}
            alt={doctor.doctorName}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border-2 border-white shadow-sm">
            <User size={24} />
          </div>
        )}
        {doctor.isBooked && (
          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 border-2 border-white">
            <Info size={10} />
          </div>
        )}
      </div>

      <div className="flex-1 text-left">
        <h4
          className={`text-sm font-bold ${doctor.isBooked ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}
        >
          {doctor.doctorName}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          {doctor.isBooked ? (
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
              Booked
            </span>
          ) : (
            <>
              <span className="text-[10px] font-medium text-slate-400">
                Consultation
              </span>
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                {doctor.price.toLocaleString('vi-VN')}₫
              </span>
            </>
          )}
        </div>
      </div>

      {isSelected && !doctor.isBooked && (
        <div className="bg-cyan-600 text-white rounded-full p-1.5 shadow-lg shadow-cyan-600/20">
          <CheckCircle2 size={16} />
        </div>
      )}
    </button>
  );
}
