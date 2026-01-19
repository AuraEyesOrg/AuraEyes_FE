import HomePage from '@/features/guest/pages/Home';
import AboutPage from '@/features/guest/pages/About';
import HowItWorksPage from '@/features/guest/pages/HowItWorks';
import ContactPage from '@/features/guest/pages/Contact';
import EthicsPrivacyPage from '@/features/guest/pages/EthicsPrivacy';
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

        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/ethics" element={<EthicsPrivacyPage />} />
        {/* ============ ADMIN ROUTES ============ */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* ============ ORGANISATION ROUTES ============ */}
        <Route
          path="/retinal_analysisorganisation/dashboard"
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
