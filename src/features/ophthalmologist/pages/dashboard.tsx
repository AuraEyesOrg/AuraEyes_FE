import { useEffect, useState } from 'react';
import {
  DoctorSidebar,
  DoctorHeader,
  StatsCardGrid,
  UrgentAIAlerts,
  ScreeningQueue,
} from '../components';
import type { OphthalmologistData } from '../types/ophthalmologist.types';

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DoctorSidebar doctor={data.doctor} />

      {/* Main Content */}
      <div className="ml-56">
        {/* Header */}
        <DoctorHeader doctor={data.doctor} />

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="mb-8">
            <StatsCardGrid stats={data.dashboardStats} />
          </div>

          {/* Urgent AI Alerts */}
          <UrgentAIAlerts alerts={data.urgentAlerts} />

          {/* Screening Queue */}
          <ScreeningQueue queue={data.screeningQueue} />
        </main>
      </div>
    </div>
  );
}
