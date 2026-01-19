import { GuestLayout } from '@/components/layouts';
import {
  Activity,
  Eye,
  Calendar,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const GuestDashboard = () => {
  return (
    <GuestLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, John! 👋
        </h1>
        <p className="text-gray-600">
          Here's an overview of your retinal health journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">3</h3>
          <p className="text-sm text-gray-600">Total Screenings</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Good
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Healthy</h3>
          <p className="text-sm text-gray-600">Last Result</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Soon
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">2</h3>
          <p className="text-sm text-gray-600">Upcoming Appointments</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              Improving
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">+12%</h3>
          <p className="text-sm text-gray-600">Health Progress</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Screening */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Screening
            </h2>
            <Link
              to="/screening"
              className="text-sm text-primary hover:text-accent transition-colors font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {[
              {
                date: 'Jan 15, 2026',
                status: 'Healthy',
                risk: 'Low',
                color: 'green',
              },
              {
                date: 'Dec 10, 2025',
                status: 'Normal',
                risk: 'Low',
                color: 'blue',
              },
              {
                date: 'Nov 5, 2025',
                status: 'Healthy',
                risk: 'Low',
                color: 'green',
              },
            ].map((screening, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 bg-${screening.color}-100 rounded-lg flex items-center justify-center`}
                  >
                    <Eye className={`h-5 w-5 text-${screening.color}-600`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Retinal Screening
                    </p>
                    <p className="text-sm text-gray-500">{screening.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-medium text-${screening.color}-600 bg-${screening.color}-100 px-3 py-1 rounded-full`}
                  >
                    {screening.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Risk: {screening.risk}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                to="/screening"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Activity className="h-5 w-5" />
                <span className="font-medium">New Screening</span>
              </Link>
              <Link
                to="/appointments"
                className="flex items-center gap-3 p-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Book Appointment</span>
              </Link>
              <Link
                to="/reports"
                className="flex items-center gap-3 p-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">View Reports</span>
              </Link>
            </div>
          </div>

          {/* Health Alerts */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Health Tip</h3>
                <p className="text-sm text-blue-700">
                  Regular eye screenings help detect issues early. Schedule your
                  next check-up!
                </p>
              </div>
            </div>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Schedule Now
            </button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default GuestDashboard;
