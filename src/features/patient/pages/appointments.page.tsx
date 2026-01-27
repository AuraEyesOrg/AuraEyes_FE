import { GuestLayout } from '@/components/layouts';
import { Calendar, Clock, MapPin, User, Video, Plus } from 'lucide-react';

const AppointmentsPage = () => {
  const appointments = [
    {
      id: 1,
      date: 'Jan 25, 2026',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Smith',
      specialty: 'Ophthalmologist',
      type: 'Follow-up',
      location: 'AURA Vision Clinic',
      status: 'upcoming',
    },
    {
      id: 2,
      date: 'Feb 5, 2026',
      time: '2:30 PM',
      doctor: 'Dr. John Williams',
      specialty: 'Retina Specialist',
      type: 'Consultation',
      location: 'Online',
      status: 'upcoming',
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      date: 'Jan 15, 2026',
      time: '9:00 AM',
      doctor: 'Dr. Sarah Smith',
      specialty: 'Ophthalmologist',
      type: 'Screening',
      location: 'AURA Vision Clinic',
      status: 'completed',
    },
  ];

  return (
    <GuestLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointments
          </h1>
          <p className="text-gray-600">
            Manage your upcoming and past appointments
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all">
          <Plus className="h-5 w-5" />
          Book Appointment
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Upcoming Appointments
        </h2>
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-xl p-6 border-2 border-primary/20 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {apt.type}
                      </h3>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        Upcoming
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          {apt.doctor} - {apt.specialty}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.location === 'Online' ? (
                          <>
                            <Video className="h-4 w-4" />
                            <span className="text-blue-600">
                              {apt.location}
                            </span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4" />
                            <span>{apt.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Appointments */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Past Appointments
        </h2>
        <div className="grid gap-4">
          {pastAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all opacity-75"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {apt.type}
                      </h3>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        Completed
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          {apt.doctor} - {apt.specialty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  View Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GuestLayout>
  );
};

export default AppointmentsPage;
