import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Admin imports
import AdminDashboard from '@/features/admin/pages/dashboard';

// Organisation imports
import OrganisationDashboard from '@/features/organisation/pages/dashboard';
import PatientsPage from '@/features/organisation/pages/patients';
import CalendarPage from '@/features/organisation/pages/calendar';
import SettingsPage from '@/features/organisation/pages/settings';
import AnalyticsPage from '@/features/organisation/pages/analytics';

// Auth pages
import {
  LoginPage,
  RegisterPage,
  ConfirmEmailPage,
  RegisterDoctorPage,
} from '@/pages';

// Guest/Customer pages
import {
  GuestDashboard,
  ScreeningPage,
  ReportsPage,
  AppointmentsPage,
} from '@/pages/guest';

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
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center p-4">
    <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center">
      <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-4xl font-bold text-white shadow-xl">
        A
      </div>
      <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Welcome to AURA
      </h1>
      <p className="mb-2 text-2xl text-gray-700 font-semibold">
        Retinal Vascular Health Screening System
      </p>
      <p className="mb-8 text-lg text-gray-600">
        Hệ Thống Sàng Lọc Sức Khỏe Mạch Máu Võng Mạc
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-4 text-left">
          <h3 className="mb-2 text-lg font-semibold text-primary">🚀 Status</h3>
          <p className="text-gray-700">System is up and running!</p>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-6 py-4 text-left">
          <h3 className="mb-2 text-lg font-semibold text-accent">✨ Version</h3>
          <p className="text-gray-700">v1.0.0 - Production Ready</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/login"
          className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Login
        </a>
        <a
          href="/register"
          className="px-8 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
        >
          Register
        </a>
      </div>
    </div>
  </div>
);

/**
 * Main Router Component
 */
const Router = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* ============ AUTH ROUTES ============ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-doctor" element={<RegisterDoctorPage />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />

        {/* ============ GUEST/CUSTOMER ROUTES (After Login) ============ */}
        <Route path="/dashboard" element={<GuestDashboard />} />
        <Route path="/screening" element={<ScreeningPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />

        {/* ============ ADMIN ROUTES ============ */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* ============ ORGANISATION ROUTES ============ */}
        <Route
          path="/organisation/dashboard"
          element={<OrganisationDashboard />}
        />
        <Route path="/organisation/patients" element={<PatientsPage />} />
        <Route path="/organisation/analytics" element={<AnalyticsPage />} />
        <Route path="/organisation/calendar" element={<CalendarPage />} />
        <Route path="/organisation/settings" element={<SettingsPage />} />

        {/* ============ OPHTHALMOLOGIST ROUTES (Coming Soon) ============ */}
        {/* Add ophthalmologist routes here */}
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default Router;
