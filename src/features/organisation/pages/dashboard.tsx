import { useEffect, useState } from 'react';
import { Activity, Users, AlertCircle, Brain } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import OrganisationHeader from '../components/OrganisationHeader';
import StatsCard from '../components/StatsCard';
import ActivityChart from '../components/ActivityChart';
import RecentPatients from '../components/RecentPatients';
import UpcomingAppointments from '../components/UpcomingAppointments';
import AccuracyCard from '../components/AccuracyCard';
import { OrganisationData } from '../types/organisation.types';

export default function OrganisationDashboard() {
  const [data, setData] = useState<OrganisationData | null>(null);

  useEffect(() => {
    // Load mock data
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a1929]">
      <Sidebar pendingCount={data.dashboardStats.pendingReviews.value} />

      <div className="ml-48">
        <OrganisationHeader />

        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {data.clinic.admin}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {data.clinic.name} • {data.clinic.location}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              icon={Activity}
              title="Total Screenings"
              value={data.dashboardStats.totalScreenings.value}
              change={data.dashboardStats.totalScreenings.change}
              trend={data.dashboardStats.totalScreenings.trend}
              color="#3b82f6"
            />
            <StatsCard
              icon={AlertCircle}
              title="Pending Reviews"
              value={data.dashboardStats.pendingReviews.value}
              change={data.dashboardStats.pendingReviews.change}
              trend={data.dashboardStats.pendingReviews.trend}
              color="#f59e0b"
            />
            <StatsCard
              icon={Brain}
              title="AI Predictions"
              value={data.dashboardStats.aiPredictions.value}
              change={`${data.dashboardStats.aiPredictions.accuracy}% accuracy`}
              trend={data.dashboardStats.aiPredictions.trend}
              color="#10b981"
            />
            <StatsCard
              icon={Users}
              title="Critical Cases"
              value={data.dashboardStats.criticalCases.value}
              change={data.dashboardStats.criticalCases.change}
              trend={data.dashboardStats.criticalCases.trend}
              color="#ef4444"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Activity Chart */}
            <div className="lg:col-span-2 space-y-6">
              <ActivityChart data={data.screeningActivity} />
              <RecentPatients patients={data.recentPatients} />
            </div>

            {/* Right Column - Accuracy & Appointments */}
            <div className="space-y-6">
              <AccuracyCard accuracy={data.predictionAccuracy} />
              <UpcomingAppointments appointments={data.upcomingAppointments} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
