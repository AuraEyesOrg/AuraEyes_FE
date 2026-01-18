import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RetinalAnalysis from '@/features/patient/pages/retinal_analysis';
import AdminDashboard from '@/features/admin/pages/dashboard';
import OrganisationDashboard from '@/features/organisation/pages/dashboard';
import PatientsPage from '@/features/organisation/pages/patients';
import CalendarPage from '@/features/organisation/pages/calendar';
import SettingsPage from '@/features/organisation/pages/settings';
import AnalyticsPage from '@/features/organisation/pages/analytics';
import Header from '@/components/ui/header';

/**
 * Loading component hiển thị khi lazy load
 */
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      <p className="mt-4 text-neutral">Loading...</p>
    </div>
  </div>
);

const HomePage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
    <div className="glass-panel max-w-2xl rounded-3xl border border-white/5 px-12 py-16">
      <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white shadow-lg">
        A
      </div>
      <h1 className="mb-4 text-5xl font-bold text-white">Welcome to AURA</h1>
      <p className="mb-2 text-xl text-neutral">
        Retinal Vascular Health Screening System
      </p>
      <p className="mb-8 text-lg text-neutral">
        Hệ Thống Sàng Lọc Sức Khỏe Mạch Máu Võng Mạc
      </p>
      <div className="space-y-4 text-left">
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
          <h3 className="mb-2 text-lg font-semibold text-primary">🚀 Status</h3>
          <p className="text-neutral">System is up and running!</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
          <h3 className="mb-2 text-lg font-semibold text-accent">✨ Version</h3>
          <p className="text-neutral">v1.0.0 - Production Ready</p>
        </div>
      </div>
    </div>
  </div>
);

// Layout for patient pages (with Header)
const PatientLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-b from-dark via-[#0d223f] to-dark text-white">
    <Header />
    <main className="mx-auto max-w-6xl px-6 pb-12 pt-8">{children}</main>
  </div>
);

/**
 * Main Router Component
 */
const Router = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
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
    </Suspense>
  </BrowserRouter>
);

export default Router;
