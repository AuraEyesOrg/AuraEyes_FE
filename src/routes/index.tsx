import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import PrivateRoute from './private-route';
import Spinner from '@/components/ui/spinner';
import { setRouterNavigator } from '@/lib/router';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { LocaleSync } from '@/i18n/LocaleSync';
import GuestLayout from '@/features/guest/layout';

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
const ForgotPasswordPage = lazy(
  () => import('@/features/auth/pages/forgot-password')
);
const ResetPasswordPage = lazy(
  () => import('@/features/auth/pages/reset-password')
);
const RegisterDoctorPage = lazy(
  () => import('@/features/auth/pages/register-doctor')
);
const RegisterOrganisationPage = lazy(
  () => import('@/features/auth/pages/register-organisation')
);

// Pending Approval page
const PendingApprovalPage = lazy(
  () => import('@/features/auth/pages/pending-approval')
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
const DoctorsPage = lazy(() => import('@/features/patient/pages/doctors'));

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
const BookAppointmentPage = lazy(
  () => import('@/features/patient/pages/book-appointment')
);
const BookingConfirmationPage = lazy(
  () => import('@/features/patient/pages/booking-confirmation')
);
const HelpFeedbackPage = lazy(
  () => import('@/features/patient/pages/help-feedback')
);
const NotificationsPage = lazy(
  () => import('@/features/patient/pages/notifications')
);

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
const OrganisationSlotManagementPage = lazy(
  () => import('@/features/organisation/pages/slot-management')
);
const OrganisationContractPage = lazy(
  () => import('@/features/organisation/pages/contract')
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
const OphthalmologistSlotManagementPage = lazy(
  () => import('@/features/ophthalmologist/pages/slot-management')
);
const OphthalmologistContractPage = lazy(
  () => import('@/features/ophthalmologist/pages/contract')
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
const SystemAdminVerificationRequests = lazy(
  () => import('@/features/system-admin/pages/verification-requests')
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
const SystemAdminContracts = lazy(
  () => import('@/features/system-admin/pages/contracts')
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
      <Spinner size={32} className="mx-auto" />
      <p className="mt-4 text-neutral">Loading...</p>
    </div>
  </div>
);

const RouterBridge = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setRouterNavigator((to, options) => {
      navigate(to, options);
    });
  }, [navigate]);

  return null;
};

interface LocalizedRedirectProps {
  target: string;
}

const LocalizedRedirect = ({ target }: LocalizedRedirectProps) => {
  const location = useLocation();
  const localizedPath = resolvePathWithLocale(target);

  return (
    <Navigate
      replace
      to={`${localizedPath}${location.search ?? ''}${location.hash ?? ''}`}
    />
  );
};

interface LocalizedAuthRouteProps {
  element: ReactNode;
}

const LocalizedAuthRoute = ({ element }: LocalizedAuthRouteProps) => (
  <>
    <LocaleSync />
    {element}
  </>
);

/**
 * Main Router Component
 */
const Router = () => (
  <BrowserRouter>
    <RouterBridge />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ============ GUEST ROUTES (Public - No Auth) ============ */}
        <Route path="/" element={<LocalizedRedirect target="/" />} />
        <Route path="/about" element={<LocalizedRedirect target="/about" />} />
        <Route
          path="/how-it-works"
          element={<LocalizedRedirect target="/how-it-works" />}
        />
        <Route
          path="/contact"
          element={<LocalizedRedirect target="/contact" />}
        />
        <Route
          path="/ethics"
          element={<LocalizedRedirect target="/ethics" />}
        />
        <Route
          path="/status"
          element={<LocalizedRedirect target="/status" />}
        />
        <Route
          path="/compliance"
          element={<LocalizedRedirect target="/compliance" />}
        />

        <Route
          path="/:locale/login"
          element={<LocalizedAuthRoute element={<LoginPage />} />}
        />
        <Route
          path="/:locale/forgot-password"
          element={<LocalizedAuthRoute element={<ForgotPasswordPage />} />}
        />
        <Route
          path="/:locale/reset-password"
          element={<LocalizedAuthRoute element={<ResetPasswordPage />} />}
        />
        <Route
          path="/:locale/register-doctor"
          element={<LocalizedAuthRoute element={<RegisterDoctorPage />} />}
        />
        <Route
          path="/:locale/register-organisation"
          element={
            <LocalizedAuthRoute element={<RegisterOrganisationPage />} />
          }
        />
        <Route
          path="/:locale/confirm-email"
          element={<LocalizedAuthRoute element={<ConfirmEmailPage />} />}
        />
        <Route
          path="/:locale/two-factor-auth"
          element={<LocalizedAuthRoute element={<TwoFactorSettingsPage />} />}
        />
        <Route
          path="/:locale/two-factor-verify"
          element={<LocalizedAuthRoute element={<TwoFactorVerifyPage />} />}
        />
        <Route
          path="/:locale/pending-approval"
          element={<LocalizedAuthRoute element={<PendingApprovalPage />} />}
        />

        <Route path="/:locale" element={<GuestLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="ethics" element={<EthicsPrivacyPage />} />
          <Route path="status" element={<StatusPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>

        {/* ============ AUTH ROUTES ============ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register-doctor" element={<RegisterDoctorPage />} />
        <Route
          path="/register-organisation"
          element={<RegisterOrganisationPage />}
        />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        <Route path="/two-factor-auth" element={<TwoFactorSettingsPage />} />
        <Route path="/two-factor-verify" element={<TwoFactorVerifyPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />

        {/* ============ PATIENT ROUTES ============ */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/screening" element={<ScreeningPage />} />
        <Route path="/patient/screening/new" element={<ScreeningNewPage />} />
        <Route
          path="/patient/screening/analyze"
          element={<RetinalAnalysisPage />}
        />
        <Route path="/patient/screening/review" element={<ReviewPage />} />
        <Route path="/patient/reports" element={<ReportsPage />} />
        <Route path="/patient/notifications" element={<NotificationsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/patient/appointments" element={<AppointmentsPage />} />
        <Route path="/patient/book" element={<BookAppointmentPage />} />
        <Route
          path="/patient/book/confirm"
          element={<BookingConfirmationPage />}
        />
        <Route path="/patient/profile" element={<ProfilePage />} />
        <Route path="/patient/settings" element={<SettingsPage />} />
        <Route path="/patient/clinics" element={<ClinicsPage />} />
        <Route path="/patient/doctors" element={<DoctorsPage />} />
        <Route path="/patient/roadmap" element={<RoadmapPage />} />
        <Route path="/patient/chat" element={<ChatPage />} />
        <Route path="/patient/wallet" element={<WalletPage />} />
        <Route path="/patient/help-feedback" element={<HelpFeedbackPage />} />
        <Route
          path="/patient/wallet/payment-callback"
          element={<PaymentCallbackPage />}
        />
        <Route path="/patient/security" element={<TwoFactorSettingsPage />} />

        {/* ============ ORGANISATION ROUTES ============ */}
        <Route
          path="/organisation/dashboard"
          element={
            <PrivateRoute>
              <OrganisationDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/patients"
          element={
            <PrivateRoute>
              <OrganisationPatientsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/analytics"
          element={
            <PrivateRoute>
              <OrganisationAnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/calendar"
          element={
            <PrivateRoute>
              <OrganisationCalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/slots"
          element={
            <PrivateRoute>
              <OrganisationSlotManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/contract"
          element={
            <PrivateRoute>
              <OrganisationContractPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/settings"
          element={
            <PrivateRoute>
              <OrganisationSettingsPage />
            </PrivateRoute>
          }
        />

        {/* ============ OPHTHALMOLOGIST ROUTES ============ */}
        <Route
          path="/ophthalmologist/dashboard"
          element={
            <PrivateRoute>
              <OphthalmologistDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/patients"
          element={
            <PrivateRoute>
              <OphthalmologistPatientsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/screenings"
          element={
            <PrivateRoute>
              <OphthalmologistScreeningsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/analytics"
          element={
            <PrivateRoute>
              <OphthalmologistAnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/appointments"
          element={
            <PrivateRoute>
              <OphthalmologistAppointmentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/settings"
          element={
            <PrivateRoute>
              <OphthalmologistSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/consultations"
          element={
            <PrivateRoute>
              <OphthalmologistConsultationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/screenings/:screeningId/review"
          element={
            <PrivateRoute>
              <OphthalmologistScreeningReviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/schedules"
          element={
            <PrivateRoute>
              <OphthalmologistSlotManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/slot-management"
          element={
            <PrivateRoute>
              <OphthalmologistSlotManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/contract"
          element={
            <PrivateRoute>
              <OphthalmologistContractPage />
            </PrivateRoute>
          }
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
        <Route
          path="/system-admin/verifications"
          element={<SystemAdminVerificationRequests />}
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
        <Route
          path="/system-admin/contracts"
          element={<SystemAdminContracts />}
        />

        {/* ============ PROFESSIONAL NETWORK ROUTES ============ */}
        <Route path="/network" element={<NetworkLayout />}>
          <Route index element={<NetworkFeedPage />} />
          <Route path="feed" element={<NetworkFeedPage />} />
          <Route path="discover" element={<NetworkDiscoverPage />} />

          <Route path="saved" element={<NetworkSavedPage />} />
          <Route path="post/:id" element={<NetworkPostDetailPage />} />
          <Route path="profile/:id" element={<NetworkProfilePage />} />
          <Route
            path="organisation/:id"
            element={<NetworkOrganisationPage />}
          />
        </Route>

        <Route path="*" element={<LocalizedRedirect target="/" />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default Router;
