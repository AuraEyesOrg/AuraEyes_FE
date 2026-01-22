import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Guest/Landing pages
const HomePage = lazy(() => import('@/features/guest/pages/Home'));
const AboutPage = lazy(() => import('@/features/guest/pages/About'));
const HowItWorksPage = lazy(() => import('@/features/guest/pages/HowItWorks'));
const ContactPage = lazy(() => import('@/features/guest/pages/Contact'));
const EthicsPrivacyPage = lazy(
  () => import('@/features/guest/pages/EthicsPrivacy')
);

// Auth pages
const LoginPage = lazy(() =>
  import('@/pages').then((module) => ({ default: module.LoginPage }))
);
const ConfirmEmailPage = lazy(() =>
  import('@/pages').then((module) => ({ default: module.ConfirmEmailPage }))
);
const RegisterDoctorPage = lazy(() =>
  import('@/pages').then((module) => ({ default: module.RegisterDoctorPage }))
);

// Guest/Customer pages (After Login)
const GuestDashboard = lazy(() =>
  import('@/pages/guest').then((module) => ({ default: module.GuestDashboard }))
);
const ScreeningPage = lazy(() =>
  import('@/pages/guest').then((module) => ({ default: module.ScreeningPage }))
);
const ReportsPage = lazy(() =>
  import('@/pages/guest').then((module) => ({ default: module.ReportsPage }))
);
const AppointmentsPage = lazy(() =>
  import('@/pages/guest').then((module) => ({
    default: module.AppointmentsPage,
  }))
);

// Admin pages
const AdminDashboard = lazy(() => import('@/features/admin/pages/dashboard'));

// Organisation pages
const OrganisationDashboard = lazy(
  () => import('@/features/organisation/pages/dashboard')
);
const PatientsPage = lazy(
  () => import('@/features/organisation/pages/patients')
);
const CalendarPage = lazy(
  () => import('@/features/organisation/pages/calendar')
);
const SettingsPage = lazy(
  () => import('@/features/organisation/pages/settings')
);
const AnalyticsPage = lazy(
  () => import('@/features/organisation/pages/analytics')
);

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
