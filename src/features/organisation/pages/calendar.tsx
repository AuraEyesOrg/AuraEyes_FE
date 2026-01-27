import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import { OrganisationData, Appointment } from '../types/organisation.types';

export default function CalendarPage() {
  const [data, setData] = useState<OrganisationData | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [_selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    import('@/data/organisation-mock.json').then((module) => {
      setData(module.default as OrganisationData);
    });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a1929]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isBlocked = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.calendarAvailability.blockedDates.includes(dateStr);
  };

  const getAppointmentsForDate = (day: number): Appointment[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return data.upcomingAppointments.filter((apt) => apt.date === dateStr);
  };

  return (
    <div className="min-h-screen bg-[#0a1929] dark:bg-[#0a1929] light:bg-gray-50">
      <Sidebar pendingCount={data.dashboardStats.pendingReviews.value} />

      <div className="ml-48">
        <OrganisationHeader />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
              Appointment Calendar
            </h1>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
              Manage clinic availability and appointments
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white dark:text-white light:text-gray-900">
                    {monthNames[currentDate.getMonth()]}{' '}
                    {currentDate.getFullYear()}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={previousMonth}
                      className="p-2 rounded-lg bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-gray-50 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-lg bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-gray-50 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-300 text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const appointments = getAppointmentsForDate(day);
                    const blocked = isBlocked(day);

                    return (
                      <button
                        key={day}
                        onClick={() =>
                          setSelectedDate(
                            new Date(
                              currentDate.getFullYear(),
                              currentDate.getMonth(),
                              day
                            )
                          )
                        }
                        className={`
                          aspect-square p-2 rounded-lg border transition-all relative
                          ${
                            isToday(day)
                              ? 'bg-primary border-primary text-white'
                              : blocked
                                ? 'bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed'
                                : 'bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-gray-50 border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:border-primary'
                          }
                        `}
                        disabled={blocked}
                      >
                        <span className="text-sm font-semibold">{day}</span>
                        {appointments.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {appointments.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className="w-1 h-1 rounded-full bg-green-500"
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar - Working Hours & Appointments */}
            <div className="space-y-6">
              {/* Working Hours */}
              <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                    Working Hours
                  </h3>
                  <button className="text-primary hover:text-primary/80 transition-colors text-sm">
                    Edit
                  </button>
                </div>

                <div className="space-y-3">
                  {Object.entries(data.calendarAvailability.workingHours).map(
                    ([day, hours]) => (
                      <div
                        key={day}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 capitalize">
                          {day}
                        </span>
                        <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">
                          {hours.length > 0 ? hours.join(', ') : 'Closed'}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                    <Clock size={16} />
                    <span>
                      {data.calendarAvailability.appointmentDuration} min per
                      appointment
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Appointments */}
              <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                    Today's Schedule
                  </h3>
                  <button className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm">
                    <Plus size={16} />
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {data.upcomingAppointments.slice(0, 4).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-3 rounded-lg bg-[#0a1f44] dark:bg-[#0a1f44] light:bg-gray-50 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
                          {appointment.time}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">
                          {appointment.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">
                        {appointment.patientName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
                        {appointment.doctor}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
