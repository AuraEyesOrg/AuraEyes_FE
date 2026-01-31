import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  Plus,
  Image,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ChevronRight,
  Filter,
} from 'lucide-react';
import PatientLayout from '../components/PatientLayout';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  type: 'screening' | 'follow-up' | 'consultation' | 'verification';
  location: string;
  clinicName: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  isOnline: boolean;
  images?: string[];
  notes?: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    date: 'Jan 25, 2026',
    time: '10:00 AM',
    doctor: 'Dr. Sarah Smith',
    specialty: 'Ophthalmologist',
    type: 'follow-up',
    location: 'AURA Vision Clinic',
    clinicName: 'AURA Vision Clinic',
    status: 'upcoming',
    isOnline: false,
    images: ['retinal_001.jpg'],
    notes: 'Bring previous screening results',
  },
  {
    id: '2',
    date: 'Feb 5, 2026',
    time: '2:30 PM',
    doctor: 'Dr. John Williams',
    specialty: 'Retina Specialist',
    type: 'consultation',
    location: 'Online',
    clinicName: 'Eye Care Center',
    status: 'upcoming',
    isOnline: true,
  },
  {
    id: '3',
    date: 'Jan 15, 2026',
    time: '9:00 AM',
    doctor: 'Dr. Sarah Smith',
    specialty: 'Ophthalmologist',
    type: 'screening',
    location: 'AURA Vision Clinic',
    clinicName: 'AURA Vision Clinic',
    status: 'completed',
    isOnline: false,
    images: ['retinal_002.jpg', 'retinal_003.jpg'],
  },
  {
    id: '4',
    date: 'Jan 10, 2026',
    time: '11:00 AM',
    doctor: 'Dr. Emily Chen',
    specialty: 'Ophthalmologist',
    type: 'consultation',
    location: 'Online',
    clinicName: 'Vision Plus',
    status: 'cancelled',
    isOnline: true,
  },
];

const AppointmentsPage = () => {
  const [filter, setFilter] = useState<
    'all' | 'upcoming' | 'completed' | 'cancelled'
  >('all');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const filteredAppointments = mockAppointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const upcomingCount = mockAppointments.filter(
    (a) => a.status === 'upcoming'
  ).length;
  const completedCount = mockAppointments.filter(
    (a) => a.status === 'completed'
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'screening':
        return 'Retinal Screening';
      case 'follow-up':
        return 'Follow-up Visit';
      case 'consultation':
        return 'Consultation';
      case 'verification':
        return 'Result Verification';
      default:
        return type;
    }
  };

  return (
    <PatientLayout userName="John Doe">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Appointments</h1>
          <p className="text-gray-400">
            Manage your appointments and retinal images
          </p>
        </div>

        <Link
          to="/patient/clinics"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all w-fit"
        >
          <Plus className="h-5 w-5" />
          Book Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0d2137] rounded-xl border border-[#1e3a5f] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{upcomingCount}</p>
              <p className="text-xs text-gray-400">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0d2137] rounded-xl border border-[#1e3a5f] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completedCount}</p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0d2137] rounded-xl border border-[#1e3a5f] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5</p>
              <p className="text-xs text-gray-400">Images</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0d2137] rounded-xl border border-[#1e3a5f] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-xs text-gray-400">Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-gray-300 rounded-lg text-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-[#1e3a5f]/50 text-gray-400 hover:bg-[#1e3a5f]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((apt) => (
          <div
            key={apt.id}
            className={`bg-[#0d2137] rounded-2xl border border-[#1e3a5f] p-6 hover:border-primary/30 transition-colors ${
              apt.status === 'cancelled' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                    apt.status === 'upcoming'
                      ? 'bg-primary/20'
                      : apt.status === 'completed'
                        ? 'bg-green-500/20'
                        : 'bg-gray-500/20'
                  }`}
                >
                  <Calendar
                    className={`w-7 h-7 ${
                      apt.status === 'upcoming'
                        ? 'text-primary'
                        : apt.status === 'completed'
                          ? 'text-green-400'
                          : 'text-gray-400'
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-white">
                      {getTypeLabel(apt.type)}
                    </h3>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{apt.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4" />
                      <span>
                        {apt.doctor} - {apt.specialty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {apt.isOnline ? (
                        <>
                          <Video className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400">
                            Online Consultation
                          </span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">
                            {apt.clinicName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Attached Images */}
                  {apt.images && apt.images.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#1e3a5f]">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        Attached Images ({apt.images.length})
                      </p>
                      <div className="flex gap-2">
                        {apt.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 bg-[#1e3a5f] rounded-lg flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                        <button className="w-12 h-12 bg-[#1e3a5f]/50 border border-dashed border-[#2d4a6f] rounded-lg flex items-center justify-center hover:bg-[#1e3a5f] transition-colors">
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  {apt.notes && (
                    <p className="mt-3 text-sm text-amber-400/80 bg-amber-500/10 px-3 py-2 rounded-lg">
                      📝 {apt.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                {apt.status === 'upcoming' && (
                  <>
                    <button className="flex-1 lg:flex-none px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {apt.isOnline && (
                      <button className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <Video className="w-4 h-4" />
                        Join Call
                      </button>
                    )}
                    <button className="flex-1 lg:flex-none px-4 py-2 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors">
                      Cancel
                    </button>
                  </>
                )}
                {apt.status === 'completed' && (
                  <button className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    View Report
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Appointments Found
          </h3>
          <p className="text-gray-400 mb-6">
            {filter === 'all'
              ? "You haven't booked any appointments yet."
              : `No ${filter} appointments.`}
          </p>
          <Link
            to="/patient/clinics"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Book Your First Appointment
          </Link>
        </div>
      )}
    </PatientLayout>
  );
};

export default AppointmentsPage;
