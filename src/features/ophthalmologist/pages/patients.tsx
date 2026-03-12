import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { DoctorSidebar, DoctorHeader } from '../components';

// Mock patient data
const mockPatients = [
  {
    id: '#48291',
    name: 'Elena Miller',
    initials: 'EM',
    avatarColor: '#14b8a6',
    age: 45,
    gender: 'Female',
    phone: '+1 (555) 123-4567',
    email: 'elena.miller@email.com',
    lastVisit: 'Oct 24, 2023',
    nextAppointment: 'Nov 15, 2023',
    condition: 'Macular Degeneration',
    status: 'active',
    totalVisits: 8,
  },
  {
    id: '#48290',
    name: 'David Kim',
    initials: 'DK',
    avatarColor: '#f59e0b',
    age: 62,
    gender: 'Male',
    phone: '+1 (555) 234-5678',
    email: 'david.kim@email.com',
    lastVisit: 'Oct 24, 2023',
    nextAppointment: 'Dec 01, 2023',
    condition: 'Healthy',
    status: 'active',
    totalVisits: 3,
  },
  {
    id: '#48301',
    name: 'Sarah Jenkins',
    initials: 'SJ',
    avatarColor: '#8b5cf6',
    age: 58,
    gender: 'Female',
    phone: '+1 (555) 345-6789',
    email: 'sarah.jenkins@email.com',
    lastVisit: 'Oct 23, 2023',
    nextAppointment: 'Oct 30, 2023',
    condition: 'Microaneurysms',
    status: 'urgent',
    totalVisits: 12,
  },
  {
    id: '#48312',
    name: 'Marcus Wright',
    initials: 'MW',
    avatarColor: '#ec4899',
    age: 71,
    gender: 'Male',
    phone: '+1 (555) 456-7890',
    email: 'marcus.wright@email.com',
    lastVisit: 'Oct 23, 2023',
    nextAppointment: 'Nov 05, 2023',
    condition: 'Hypertensive Retinopathy',
    status: 'active',
    totalVisits: 6,
  },
  {
    id: '#48320',
    name: 'Linda Chen',
    initials: 'LC',
    avatarColor: '#06b6d4',
    age: 55,
    gender: 'Female',
    phone: '+1 (555) 567-8901',
    email: 'linda.chen@email.com',
    lastVisit: 'Oct 20, 2023',
    nextAppointment: 'Nov 10, 2023',
    condition: 'Diabetic Retinopathy',
    status: 'critical',
    totalVisits: 15,
  },
  {
    id: '#48325',
    name: 'James Rodriguez',
    initials: 'JR',
    avatarColor: '#10b981',
    age: 48,
    gender: 'Male',
    phone: '+1 (555) 678-9012',
    email: 'james.rodriguez@email.com',
    lastVisit: 'Oct 18, 2023',
    nextAppointment: 'Nov 20, 2023',
    condition: 'Glaucoma Suspect',
    status: 'active',
    totalVisits: 4,
  },
];

function getStatusStyle(status: string): { bg: string; text: string } {
  switch (status) {
    case 'critical':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'urgent':
      return { bg: 'bg-amber-100', text: 'text-amber-700' };
    default:
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
  }
}

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredPatients = mockPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || patient.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen w-full bg-(--bg-primary)">
      <DoctorSidebar pendingCount={12} />

      <div className="flex-1 h-full overflow-y-auto">
        <DoctorHeader pageName="Patients" />

        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Patients
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage and view patient records
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors">
              <Plus size={18} />
              Add Patient
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-200 dark:border-[#2d4a6f] hover:bg-gray-50 dark:hover:bg-[#2d4a6f] rounded-xl text-sm text-gray-700 dark:text-white transition-colors">
                <Filter size={16} />
                More Filters
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {mockPatients.length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Active
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {mockPatients.filter((p) => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Urgent
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {mockPatients.filter((p) => p.status === 'urgent').length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a1f44] rounded-xl border border-gray-100 dark:border-[#1e3a5f] p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Critical
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {mockPatients.filter((p) => p.status === 'critical').length}
              </p>
            </div>
          </div>

          {/* Patient Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => {
              const statusStyle = getStatusStyle(patient.status);

              return (
                <div
                  key={patient.id}
                  className="bg-white dark:bg-[#0a1f44] rounded-2xl border border-gray-100 dark:border-[#1e3a5f] p-5 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-[#0a1929]/50 transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: patient.avatarColor }}
                      >
                        {patient.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {patient.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {patient.id} • {patient.age}y • {patient.gender}
                        </p>
                      </div>
                    </div>
                    <button className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Condition Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {patient.condition}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone
                        size={14}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      {patient.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail
                        size={14}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      {patient.email}
                    </div>
                  </div>

                  {/* Visit Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#1e3a5f]">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} />
                      Next: {patient.nextAppointment}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Eye size={12} />
                      {patient.totalVisits} visits
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-4 py-2.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-xl transition-colors">
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
