import { useEffect, useState } from 'react';
import {
  DoctorSidebar,
  DoctorHeader,
  StatsCardGrid,
  UrgentAIAlerts,
  ScreeningQueue,
} from '../components';
import type { OphthalmologistData } from '../types/ophthalmologist.types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function OphthalmologistDashboard() {
  const [data, setData] = useState<OphthalmologistData | null>(null);

  useEffect(() => {
    // Load mock data
    import('@/data/ophthalmologist-mock.json').then((module) => {
      setData(module.default as OphthalmologistData);
    });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0a1929]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1929]">
      {/* Sidebar */}
      <DoctorSidebar
        doctor={data.doctor}
        pendingCount={data.dashboardStats.pendingReviews}
      />

      {/* Main Content */}
      <div className="ml-52">
        {/* Header */}
        <DoctorHeader doctor={data.doctor} />

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {getGreeting()}, {data.doctor.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {data.doctor.hospital} • {data.doctor.department}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-6">
            <StatsCardGrid stats={data.dashboardStats} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Screening Queue (spans 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              <ScreeningQueue queue={data.screeningQueue} />
            </div>

            {/* Right Column - Urgent AI Alerts */}
            <div className="space-y-6">
              <UrgentAIAlerts alerts={data.urgentAlerts} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
