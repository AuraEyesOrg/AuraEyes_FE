import { useEffect, useState } from 'react';
import { Footprints, Flame, Droplets } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import WelcomeCard from '../components/WelcomeCard';
import StatsCard from '../components/StatsCard';
import FitnessChart from '../components/FitnessChart';
import SleepProgress from '../components/SleepProgress';
import CalendarWidget from '../components/CalendarWidget';
import UpcomingEvents from '../components/UpcomingEvents';
import ReminderCard from '../components/ReminderCard';
import ReportCard from '../components/ReportCard';
import WorkoutSessionCard from '../components/WorkoutSessionCard';
import UserProfile from '../components/UserProfile';
import GoalProgress from '../components/GoalProgress';
import type { AdminDashboardData } from '../types/admin.types';
import mockData from '@/data/admin-mock.json';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    // Simulate API call
    setData(mockData as AdminDashboardData);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a1929] dark:bg-[#0a1929] light:bg-gray-50 flex items-center justify-center">
        <div className="text-white dark:text-white light:text-gray-900">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1929] dark:bg-[#0a1929] light:bg-gray-50">
      <Sidebar reminderCount={data.reminders.length} />

      <div className="ml-48">
        <DashboardHeader />

        <main className="p-6">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-6">
              Dashboard Overview
            </h1>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Main Content */}
              <div className="col-span-9 space-y-6">
                {/* Welcome Card */}
                <WelcomeCard userName={data.user.name} />

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6">
                  <StatsCard
                    icon={Footprints}
                    value={data.dailyStats.steps.current}
                    goal={data.dailyStats.steps.goal}
                    unit={data.dailyStats.steps.unit}
                    label="Steps taken"
                    color="#3b82f6"
                  />
                  <StatsCard
                    icon={Flame}
                    value={data.dailyStats.calories.current}
                    goal={data.dailyStats.calories.goal}
                    unit={data.dailyStats.calories.unit}
                    label="Calories burned"
                    color="#10b981"
                  />
                  <StatsCard
                    icon={Droplets}
                    value={data.dailyStats.water.current}
                    goal={data.dailyStats.water.goal}
                    unit={data.dailyStats.water.unit}
                    label="Water taken"
                    color="#13ecec"
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <FitnessChart data={data.fitnessActivity} />
                  </div>
                  <div className="col-span-1">
                    <SleepProgress data={data.sleepData} />
                  </div>
                </div>

                {/* Program & Reports Section */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Reminders */}
                  <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4">
                      Your Program Today
                    </h3>
                    <div className="space-y-3">
                      {data.reminders.map((reminder) => (
                        <ReminderCard key={reminder.id} reminder={reminder} />
                      ))}
                    </div>
                  </div>

                  {/* Reports */}
                  <div className="bg-[#1e3a5f] dark:bg-[#1e3a5f] light:bg-white rounded-xl p-6 border border-[#2d4a6f] dark:border-[#2d4a6f] light:border-gray-200">
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4">
                      Reports
                    </h3>
                    <div className="space-y-2">
                      {data.reports.map((report) => (
                        <ReportCard key={report.id} report={report} />
                      ))}
                    </div>
                  </div>

                  {/* Goal Progress */}
                  <GoalProgress progress={data.goalProgress} />
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="col-span-3 space-y-6">
                {/* User Profile */}
                <UserProfile user={data.user} />

                {/* Calendar */}
                <CalendarWidget calendar={data.calendar} />

                {/* Upcoming Events */}
                <UpcomingEvents events={data.upcomingEvents} />

                {/* Past Workout Sessions */}
                <div>
                  <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4">
                    Past workout sessions
                  </h3>
                  <div className="space-y-3">
                    {data.workoutSessions.map((session) => (
                      <WorkoutSessionCard key={session.id} session={session} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
