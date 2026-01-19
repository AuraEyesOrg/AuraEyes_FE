import HomePage from '@/features/guest/pages/Home';
import RetinalAnalysis from '@/features/patient/pages/retinal_analysis';
import AdminDashboard from '@/features/admin/pages/dashboard';
import OrganisationDashboard from '@/features/organisation/pages/dashboard';
import PatientsPage from '@/features/organisation/pages/patients';
import CalendarPage from '@/features/organisation/pages/calendar';
import SettingsPage from '@/features/organisation/pages/settings';
import AnalyticsPage from '@/features/organisation/pages/analytics';
import Header from '@/components/ui/header';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Layout for patient pages (with Header)
const PatientLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-b from-dark via-[#0d223f] to-dark text-white">
    <Header />
    <main className="mx-auto max-w-6xl px-6 pb-12 pt-8">{children}</main>
  </div>
);

const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/retinal_analysis"
        element={
          <PatientLayout>
            <RetinalAnalysis />
          </PatientLayout>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Organisation Routes */}
      <Route path="/organisation" element={<OrganisationDashboard />} />
      <Route path="/organisation/patients" element={<PatientsPage />} />
      <Route path="/organisation/analytics" element={<AnalyticsPage />} />
      <Route path="/organisation/calendar" element={<CalendarPage />} />
      <Route path="/organisation/settings" element={<SettingsPage />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
