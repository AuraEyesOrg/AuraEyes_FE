import { Search, Bell } from 'lucide-react';
import type { Doctor } from '../types/ophthalmologist.types';

interface DoctorHeaderProps {
  doctor: Doctor;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DoctorHeader({ doctor }: DoctorHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left - Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          {getGreeting()}, {doctor.name}
        </h1>
        <p className="text-sm text-gray-500">
          {doctor.hospital} - {doctor.department} | {formatDate()}
        </p>
      </div>

      {/* Right - Search & Notifications */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients, ID..."
            className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
