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
const StatusPage = lazy(() => import('@/features/guest/pages/Status'));
const CompliancePage = lazy(() => import('@/features/guest/pages/Compliance'));

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
const SettingsPage = lazy(() => import('@/features/patient/pages/settings'));
const ClinicsPage = lazy(() => import('@/features/patient/pages/clinics'));
const VerificationPage = lazy(
  () => import('@/features/patient/pages/verification')
);
const RoadmapPage = lazy(() => import('@/features/patient/pages/roadmap'));
const ChatPage = lazy(() => import('@/features/patient/pages/chat'));
const WalletPage = lazy(() => import('@/features/patient/pages/wallet'));
const PaymentCallbackPage = lazy(
  () => import('@/features/patient/pages/payment-callback')
);
const RetinalAnalysisPage = lazy(
  () => import('@/features/patient/pages/retinal-analysis')
);
const ReviewPage = lazy(() => import('@/features/patient/pages/review'));

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

// Ophthalmologist pages
const OphthalmologistDashboard = lazy(
  () => import('@/features/ophthalmologist/pages/dashboard')
);
const OphthalmologistPatientsPage = lazy(
  () => import('@/features/ophthalmologist/pages/patients')
);
const OphthalmologistScreeningsPage = lazy(
  () => import('@/features/ophthalmologist/pages/screenings')
);
const OphthalmologistAnalyticsPage = lazy(
  () => import('@/features/ophthalmologist/pages/analytics')
);
const OphthalmologistAppointmentsPage = lazy(
  () => import('@/features/ophthalmologist/pages/appointments')
);
const OphthalmologistSettingsPage = lazy(
  () => import('@/features/ophthalmologist/pages/settings')
);
const OphthalmologistConsultationsPage = lazy(
  () => import('@/features/ophthalmologist/pages/consultations')
);
const OphthalmologistScreeningReviewPage = lazy(
  () => import('@/features/ophthalmologist/pages/screening-review')
);
const OphthalmologistSchedulesPage = lazy(
  () => import('@/features/ophthalmologist/pages/schedules')
);

// System Admin pages
const SystemAdminDashboard = lazy(
  () => import('@/features/system-admin/pages/dashboard')
);
const SystemAdminOrganisations = lazy(
  () => import('@/features/system-admin/pages/organisations')
);
const SystemAdminPatients = lazy(
  () => import('@/features/system-admin/pages/patients')
);
const SystemAdminOphthalmologists = lazy(
  () => import('@/features/system-admin/pages/ophthalmologists')
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
const SystemAdminSettings = lazy(
  () => import('@/features/system-admin/pages/settings')
);
const SystemAdminPermissions = lazy(
  () => import('@/features/system-admin/pages/permissions')
);
const SystemAdminContractTemplates = lazy(
  () => import('@/features/system-admin/pages/contract-templates')
);
const SystemAdminContractTemplateEditor = lazy(
  () => import('@/features/system-admin/pages/contract-template-editor')
);

// Professional Network pages
const NetworkLayout = lazy(() =>
  import('@/features/professional-network/components/layouts/NetworkLayout').then(
    (module) => ({ default: module.NetworkLayout })
  )
);
const NetworkFeedPage = lazy(
  () => import('@/features/professional-network/pages/FeedPage')
);
const NetworkDiscoverPage = lazy(
  () => import('@/features/professional-network/pages/DiscoverPage')
);
const NetworkConnectionsPage = lazy(
  () => import('@/features/professional-network/pages/ConnectionsPage')
);
const NetworkGroupsPage = lazy(
  () => import('@/features/professional-network/pages/GroupsPage')
);
const NetworkSavedPage = lazy(
  () => import('@/features/professional-network/pages/SavedPage')
);
const NetworkPostDetailPage = lazy(
  () => import('@/features/professional-network/pages/PostDetailPage')
);
const NetworkProfilePage = lazy(
  () => import('@/features/professional-network/pages/ProfilePage')
);
const NetworkOrganisationPage = lazy(
  () => import('@/features/professional-network/pages/OrganisationPage')
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
        <Route path="/status" element={<StatusPage />} />
        <Route path="/compliance" element={<CompliancePage />} />

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
        <Route path="/patient/analysis" element={<RetinalAnalysisPage />} />
        <Route path="/patient/screening/review" element={<ReviewPage />} />
        <Route path="/patient/reports" element={<ReportsPage />} />
        <Route path="/patient/appointments" element={<AppointmentsPage />} />
        <Route path="/patient/profile" element={<ProfilePage />} />
        <Route path="/patient/settings" element={<SettingsPage />} />
        <Route path="/patient/clinics" element={<ClinicsPage />} />
        <Route path="/patient/verification" element={<VerificationPage />} />
        <Route path="/patient/roadmap" element={<RoadmapPage />} />
        <Route path="/patient/chat" element={<ChatPage />} />
        <Route path="/patient/wallet" element={<WalletPage />} />
        <Route
          path="/patient/wallet/payment-callback"
          element={<PaymentCallbackPage />}
        />
        <Route path="/patient/security" element={<TwoFactorSettingsPage />} />

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

        {/* ============ OPHTHALMOLOGIST ROUTES ============ */}
        <Route
          path="/ophthalmologist/dashboard"
          element={<OphthalmologistDashboard />}
        />
        <Route
          path="/ophthalmologist/patients"
          element={<OphthalmologistPatientsPage />}
        />
        <Route
          path="/ophthalmologist/screenings"
          element={<OphthalmologistScreeningsPage />}
        />
        <Route
          path="/ophthalmologist/analytics"
          element={<OphthalmologistAnalyticsPage />}
        />
        <Route
          path="/ophthalmologist/appointments"
          element={<OphthalmologistAppointmentsPage />}
        />
        <Route
          path="/ophthalmologist/settings"
          element={<OphthalmologistSettingsPage />}
        />
        <Route
          path="/ophthalmologist/consultations"
          element={<OphthalmologistConsultationsPage />}
        />
        <Route
          path="/ophthalmologist/screenings/:screeningId/review"
          element={<OphthalmologistScreeningReviewPage />}
        />
        <Route
          path="/ophthalmologist/schedules"
          element={<OphthalmologistSchedulesPage />}
        />

        {/* ============ SYSTEM ADMIN ROUTES ============ */}
        <Route
          path="/system-admin/dashboard"
          element={<SystemAdminDashboard />}
        />
        <Route
          path="/system-admin/organisations"
          element={<SystemAdminOrganisations />}
        />
        <Route
          path="/system-admin/patients"
          element={<SystemAdminPatients />}
        />
        <Route
          path="/system-admin/ophthalmologists"
          element={<SystemAdminOphthalmologists />}
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
        <Route
          path="/system-admin/settings"
          element={<SystemAdminSettings />}
        />
        <Route
          path="/system-admin/permissions"
          element={<SystemAdminPermissions />}
        />
        <Route
          path="/system-admin/contract-templates"
          element={<SystemAdminContractTemplates />}
        />
        <Route
          path="/system-admin/contract-templates/:id/edit"
          element={<SystemAdminContractTemplateEditor />}
        />
        <Route
          path="/system-admin/contract-templates/new"
          element={<SystemAdminContractTemplateEditor />}
        />

        {/* ============ PROFESSIONAL NETWORK ROUTES ============ */}
        <Route path="/network" element={<NetworkLayout />}>
          <Route index element={<NetworkFeedPage />} />
          <Route path="feed" element={<NetworkFeedPage />} />
          <Route path="discover" element={<NetworkDiscoverPage />} />
          <Route path="connections" element={<NetworkConnectionsPage />} />
          <Route path="groups" element={<NetworkGroupsPage />} />
          <Route path="saved" element={<NetworkSavedPage />} />
          <Route path="post/:id" element={<NetworkPostDetailPage />} />
          <Route path="profile/:id" element={<NetworkProfilePage />} />
          <Route
            path="organisation/:id"
            element={<NetworkOrganisationPage />}
          />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default Router;
