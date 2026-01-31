import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Guest/Landing pages (public - no auth required)
const HomePage = lazy(() => import('@/features/guest/pages/Home'));
const AboutPage = lazy(() => import('@/features/guest/pages/About'));
const HowItWorksPage = lazy(() => import('@/features/guest/pages/HowItWorks'));
const ContactPage = lazy(() => import('@/features/guest/pages/Contact'));
const EthicsPrivacyPage = lazy(
  () => import('@/features/guest/pages/EthicsPrivacy')
);

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/login'));
const TwoFactorSettingsPage = lazy(
  () => import('@/features/auth/pages/two-factor-settings')
);
const TwoFactorVerifyPage = lazy(
  () => import('@/features/auth/pages/two-factor-verify')
);
const ConfirmEmailPage = lazy(
  () => import('@/features/auth/pages/confirm-email')
);
const RegisterDoctorPage = lazy(
  () => import('@/features/auth/pages/register-doctor')
);

// Patient pages
const PatientDashboard = lazy(
  () => import('@/features/patient/pages/dashboard')
);
const ScreeningPage = lazy(() => import('@/features/patient/pages/screening'));
const ScreeningNewPage = lazy(
  () => import('@/features/patient/pages/screening-new')
);
const ReportsPage = lazy(() => import('@/features/patient/pages/reports'));
const AppointmentsPage = lazy(
  () => import('@/features/patient/pages/appointments')
);
const ProfilePage = lazy(() => import('@/features/patient/pages/profile'));
const ClinicsPage = lazy(() => import('@/features/patient/pages/clinics'));
const VerificationPage = lazy(
  () => import('@/features/patient/pages/verification')
);
const RoadmapPage = lazy(() => import('@/features/patient/pages/roadmap'));
const ChatPage = lazy(() => import('@/features/patient/pages/chat'));
const WalletPage = lazy(() => import('@/features/patient/pages/wallet'));

// Organisation pages
const OrganisationDashboard = lazy(
  () => import('@/features/organisation/pages/dashboard')
);
const OrganisationPatientsPage = lazy(
  () => import('@/features/organisation/pages/patients')
);
const OrganisationCalendarPage = lazy(
  () => import('@/features/organisation/pages/calendar')
);
const OrganisationSettingsPage = lazy(
  () => import('@/features/organisation/pages/settings')
);
const OrganisationAnalyticsPage = lazy(
  () => import('@/features/organisation/pages/analytics')
);

// System Admin pages
const SystemAdminDashboard = lazy(
  () => import('@/features/system-admin/pages/dashboard')
);
const SystemAdminOrganisations = lazy(
  () => import('@/features/system-admin/pages/organisations')
);
const SystemAdminUsers = lazy(
  () => import('@/features/system-admin/pages/users')
);
const SystemAdminAIModels = lazy(
  () => import('@/features/system-admin/pages/ai-models')
);
const SystemAdminAuditLogs = lazy(
  () => import('@/features/system-admin/pages/audit-logs')
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
        {/* ============ GUEST ROUTES (Public - No Auth) ============ */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/ethics" element={<EthicsPrivacyPage />} />

        {/* ============ AUTH ROUTES ============ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-doctor" element={<RegisterDoctorPage />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        <Route path="/two-factor-auth" element={<TwoFactorSettingsPage />} />
        <Route path="/two-factor-verify" element={<TwoFactorVerifyPage />} />

        {/* ============ PATIENT ROUTES ============ */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/screening" element={<ScreeningPage />} />
        <Route path="/patient/screening/new" element={<ScreeningNewPage />} />
        <Route path="/patient/reports" element={<ReportsPage />} />
        <Route path="/patient/appointments" element={<AppointmentsPage />} />
        <Route path="/patient/profile" element={<ProfilePage />} />
        <Route path="/patient/clinics" element={<ClinicsPage />} />
        <Route path="/patient/verification" element={<VerificationPage />} />
        <Route path="/patient/roadmap" element={<RoadmapPage />} />
        <Route path="/patient/chat" element={<ChatPage />} />
        <Route path="/patient/wallet" element={<WalletPage />} />

        {/* ============ ORGANISATION ROUTES ============ */}
        <Route
          path="/organisation/dashboard"
          element={<OrganisationDashboard />}
        />
        <Route
          path="/organisation/patients"
          element={<OrganisationPatientsPage />}
        />
        <Route
          path="/organisation/analytics"
          element={<OrganisationAnalyticsPage />}
        />
        <Route
          path="/organisation/calendar"
          element={<OrganisationCalendarPage />}
        />
        <Route
          path="/organisation/settings"
          element={<OrganisationSettingsPage />}
        />

        {/* ============ OPHTHALMOLOGIST ROUTES (Coming Soon) ============ */}
        {/* Add ophthalmologist routes here */}

        {/* ============ SYSTEM ADMIN ROUTES ============ */}
        <Route
          path="/system-admin/dashboard"
          element={<SystemAdminDashboard />}
        />
        <Route
          path="/system-admin/organisations"
          element={<SystemAdminOrganisations />}
        />
        <Route path="/system-admin/users" element={<SystemAdminUsers />} />
        <Route
          path="/system-admin/ai-models"
          element={<SystemAdminAIModels />}
        />
        <Route
          path="/system-admin/audit-logs"
          element={<SystemAdminAuditLogs />}
        />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default Router;
