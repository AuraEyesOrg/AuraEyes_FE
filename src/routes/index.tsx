import { lazy, Suspense, useEffect, type ReactElement } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import PrivateRoute from './private-route';
import PublicRoute from './public-route';
import Spinner from '@/components/ui/spinner';
import { setRouterNavigator } from '@/lib/router';
import { resolvePathWithLocale } from '@/i18n/middleware';
import { LocaleSync } from '@/i18n/LocaleSync';
import GuestLayout from '@/features/guest/layout';
import useAuthStore from '@/store/auth-store';

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
const MaintenancePage = lazy(
  () => import('@/features/guest/pages/Maintenance')
);
const NotFoundPage = lazy(() => import('@/features/guest/pages/NotFound'));
const PersonalDataPage = lazy(
  () => import('@/features/guest/pages/PersonalData')
);
const PrivacyPage = lazy(() => import('@/features/guest/pages/Privacy'));
const SecurityPage = lazy(() => import('@/features/guest/pages/Security'));
const TermsOfUsePage = lazy(() => import('@/features/guest/pages/TermsofUse'));

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
const EmailVerificationRequiredPage = lazy(
  () => import('@/features/auth/pages/email-verification-required')
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
const ViewAllNotificationsPage = lazy(
  () => import('@/features/notifications/pages/view-all')
);

// Organisation pages
const OrganisationDashboard = lazy(
  () => import('@/features/organisation/pages/dashboard')
);
const OrganisationPatientsPage = lazy(
  () => import('@/features/organisation/pages/patients')
);
const OrganisationPatientHistoryPage = lazy(
  () => import('@/features/organisation/pages/patient-history')
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
const OrganisationScreeningPage = lazy(
  () => import('@/features/organisation/pages/screening')
);
const OrganisationScreeningResultPage = lazy(
  () => import('@/features/organisation/pages/screening-result')
);
const OrganisationBillingPage = lazy(
  () => import('@/features/organisation/pages/billing')
);
const OrganisationWalletPage = lazy(
  () => import('@/features/organisation/pages/wallet')
);
const OrganisationReportsPage = lazy(
  () => import('@/features/organisation/pages/reports')
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
const OphthalmologistWalletPage = lazy(
  () => import('@/features/ophthalmologist/pages/wallet')
);

// System Admin pages
const SystemAdminDashboard = lazy(
  () => import('@/features/system-admin/pages/dashboard')
);
const SystemAdminStatus = lazy(
  () => import('@/features/system-admin/pages/status')
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
const SystemAdminWithdrawalRequests = lazy(
  () => import('@/features/system-admin/pages/withdrawal-requests')
);
const SystemAdminUsers = lazy(
  () => import('@/features/system-admin/pages/users')
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
const SystemAdminCashflow = lazy(
  () => import('@/features/system-admin/pages/cashflow')
);

// Professional Network pages
const NetworkLayout = lazy(() =>
  import('@/features/professional-network/components/layouts/NetworkLayout').then(
    (module) => ({ default: module.NetworkLayout })
  )
);
const NetworkFeedPage = lazy(
  () => import('@/features/professional-network/pages/feed')
);
const NetworkDiscoverPage = lazy(
  () => import('@/features/professional-network/pages/discover')
);
const NetworkSavedPage = lazy(
  () => import('@/features/professional-network/pages/saved')
);
const NetworkPostDetailPage = lazy(
  () => import('@/features/professional-network/pages/post-detail')
);
const NetworkProfilePage = lazy(
  () => import('@/features/professional-network/pages/profile')
);
const NetworkOrganisationPage = lazy(
  () => import('@/features/professional-network/pages/organisation')
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

const LogoutRoute = () => {
  const navigate = useNavigate();
  const { locale } = useParams();

  useEffect(() => {
    useAuthStore.getState().logout();

    const loginPath = locale
      ? `/${locale}/login`
      : resolvePathWithLocale('/login');
    navigate(loginPath, { replace: true });
  }, [locale, navigate]);

  return <PageLoader />;
};

interface LocalizedAuthRouteProps {
  element: ReactElement;
}

const LocalizedPublicRoute = ({ element }: LocalizedAuthRouteProps) => (
  <>
    <LocaleSync />
    <PublicRoute>{element}</PublicRoute>
  </>
);

interface LocalizedPrivateRouteProps {
  element: ReactElement;
  allowedRoles?: string[];
}

const LocalizedPrivateRoute = ({
  element,
  allowedRoles,
}: LocalizedPrivateRouteProps) => (
  <>
    <LocaleSync />
    <PrivateRoute allowedRoles={allowedRoles}>{element}</PrivateRoute>
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
          path="/maintenance"
          element={<LocalizedRedirect target="/maintenance" />}
        />
        <Route
          path="/personal-data"
          element={<LocalizedRedirect target="/personal-data" />}
        />
        <Route
          path="/privacy"
          element={<LocalizedRedirect target="/privacy" />}
        />
        <Route
          path="/security"
          element={<LocalizedRedirect target="/security" />}
        />
        <Route path="/terms" element={<LocalizedRedirect target="/terms" />} />
        <Route path="/404" element={<LocalizedRedirect target="/404" />} />
        <Route path="/logout" element={<LogoutRoute />} />
        <Route path="/:locale/logout" element={<LogoutRoute />} />

        <Route
          path="/:locale/login"
          element={<LocalizedPublicRoute element={<LoginPage />} />}
        />
        <Route
          path="/:locale/forgot-password"
          element={<LocalizedPublicRoute element={<ForgotPasswordPage />} />}
        />
        <Route
          path="/:locale/reset-password"
          element={<LocalizedPublicRoute element={<ResetPasswordPage />} />}
        />
        <Route
          path="/:locale/register-doctor"
          element={<LocalizedPublicRoute element={<RegisterDoctorPage />} />}
        />
        <Route
          path="/:locale/register-organisation"
          element={
            <LocalizedPublicRoute element={<RegisterOrganisationPage />} />
          }
        />
        <Route
          path="/:locale/confirm-email"
          element={<LocalizedPublicRoute element={<ConfirmEmailPage />} />}
        />
        <Route
          path="/:locale/email-verification-required"
          element={
            <LocalizedPublicRoute element={<EmailVerificationRequiredPage />} />
          }
        />
        <Route
          path="/:locale/two-factor-auth"
          element={<LocalizedPublicRoute element={<TwoFactorSettingsPage />} />}
        />
        <Route
          path="/:locale/two-factor-verify"
          element={<LocalizedPublicRoute element={<TwoFactorVerifyPage />} />}
        />
        <Route
          path="/:locale/ophthalmologist/pending-approval"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<PendingApprovalPage />}
            />
          }
        />
        <Route
          path="/:locale/pending-approval"
          element={
            <LocalizedRedirect target="/ophthalmologist/pending-approval" />
          }
        />

        <Route
          path="/:locale/ophthalmologist/dashboard"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistDashboard />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/patients"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistPatientsPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/screenings"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistScreeningsPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/analytics"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistAnalyticsPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/appointments"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistAppointmentsPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/settings"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistSettingsPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/consultations"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistConsultationsPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/screenings/:screeningId/review"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistScreeningReviewPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/schedules"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistSlotManagementPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/slot-management"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistSlotManagementPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/contract"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistContractPage />}
            />
          }
        />
        <Route
          path="/:locale/ophthalmologist/wallet"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Ophthalmologist']}
              element={<OphthalmologistWalletPage />}
            />
          }
        />

        <Route
          path="/:locale/patient/dashboard"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<PatientDashboard />}
            />
          }
        />
        <Route
          path="/:locale/patient/screening"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<ScreeningPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/screening/new"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<ScreeningNewPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/analysis"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<RetinalAnalysisPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/screening/review"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<ReviewPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/reports"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<ReportsPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/notifications"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<NotificationsPage />}
            />
          }
        />
        <Route
          path="/:locale/notifications/view-all"
          element={
            <LocalizedPrivateRoute
              allowedRoles={[
                'Patient',
                'SystemAdmin',
                'Admin',
                'OrgAdmin',
                'Ophthalmologist',
              ]}
              element={<ViewAllNotificationsPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/appointments"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<AppointmentsPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/book"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<BookAppointmentPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/book/confirm"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<BookingConfirmationPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/profile"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<ProfilePage />}
            />
          }
        />
        <Route
          path="/:locale/patient/settings"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<SettingsPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/clinics"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<ClinicsPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/doctors"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<DoctorsPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/roadmap"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<RoadmapPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/chat"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<ChatPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/wallet"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<WalletPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/help-feedback"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<HelpFeedbackPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/wallet/payment-callback"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<PaymentCallbackPage />}
            />
          }
        />
        <Route
          path="/:locale/patient/security"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['Patient']}
              element={<TwoFactorSettingsPage />}
            />
          }
        />

        <Route
          path="/:locale/organisation/dashboard"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationDashboard />}
            />
          }
        />
        <Route
          path="/:locale/organisation/patients"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationPatientsPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/patients/:patientId/history"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin', 'Organization']}
              element={<OrganisationPatientHistoryPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/analytics"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationAnalyticsPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/screening"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationScreeningPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/screening/result"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationScreeningResultPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/wallet"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationWalletPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/billing"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationBillingPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/reports"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationReportsPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/calendar"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationCalendarPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/slots"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationSlotManagementPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/contract"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationContractPage />}
            />
          }
        />
        <Route
          path="/:locale/organisation/settings"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['OrgAdmin']}
              element={<OrganisationSettingsPage />}
            />
          }
        />

        <Route
          path="/:locale/system-admin/dashboard"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['SystemAdmin', 'Admin']}
              element={<SystemAdminDashboard />}
            />
          }
        />
        <Route
          path="/:locale/system-admin/status"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['SystemAdmin', 'Admin']}
              element={<SystemAdminStatus />}
            />
          }
        />
        <Route
          path="/:locale/system-admin/cashflow"
          element={
            <LocalizedPrivateRoute
              allowedRoles={['SystemAdmin', 'Admin']}
              element={<SystemAdminCashflow />}
            />
          }
        />

        <Route path="/:locale" element={<GuestLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="ethics" element={<EthicsPrivacyPage />} />
          <Route path="status" element={<StatusPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="personal-data" element={<PersonalDataPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="terms" element={<TermsOfUsePage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ============ AUTH ROUTES ============ */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register-doctor"
          element={
            <PublicRoute>
              <RegisterDoctorPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register-organisation"
          element={
            <PublicRoute>
              <RegisterOrganisationPage />
            </PublicRoute>
          }
        />
        <Route
          path="/confirm-email"
          element={
            <PublicRoute>
              <ConfirmEmailPage />
            </PublicRoute>
          }
        />
        <Route
          path="/email-verification-required"
          element={
            <PublicRoute>
              <EmailVerificationRequiredPage />
            </PublicRoute>
          }
        />
        <Route
          path="/two-factor-auth"
          element={
            <PublicRoute>
              <TwoFactorSettingsPage />
            </PublicRoute>
          }
        />
        <Route
          path="/two-factor-verify"
          element={
            <PublicRoute>
              <TwoFactorVerifyPage />
            </PublicRoute>
          }
        />
        <Route
          path="/ophthalmologist/pending-approval"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <PendingApprovalPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/pending-approval"
          element={
            <LocalizedRedirect target="/ophthalmologist/pending-approval" />
          }
        />

        {/* ============ PATIENT ROUTES ============ */}
        <Route
          path="/patient/dashboard"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/screening"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <ScreeningPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/screening/new"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <ScreeningNewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/analysis"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <RetinalAnalysisPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/screening/review"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <ReviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/reports"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <ReportsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/notifications"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications/view-all"
          element={
            <PrivateRoute
              allowedRoles={[
                'Patient',
                'SystemAdmin',
                'Admin',
                'OrgAdmin',
                'Ophthalmologist',
              ]}
            >
              <ViewAllNotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <AppointmentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/book"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <BookAppointmentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/book/confirm"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <BookingConfirmationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/settings"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/clinics"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <ClinicsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/doctors"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <DoctorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/roadmap"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <RoadmapPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/chat"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/wallet"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <WalletPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/help-feedback"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <HelpFeedbackPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/wallet/payment-callback"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <PaymentCallbackPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/security"
          element={
            <PrivateRoute allowedRoles={['Patient']}>
              <TwoFactorSettingsPage />
            </PrivateRoute>
          }
        />

        {/* ============ ORGANISATION ROUTES ============ */}
        <Route
          path="/organisation/dashboard"
          element={
            <PrivateRoute allowedRoles={['OrgAdmin']}>
              <OrganisationDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/patients"
          element={
            <PrivateRoute allowedRoles={['OrgAdmin']}>
              <OrganisationPatientsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/patients/:patientId/history"
          element={
            <PrivateRoute allowedRoles={['OrgAdmin', 'Organization']}>
              <OrganisationPatientHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/analytics"
          element={
            <PrivateRoute allowedRoles={['OrgAdmin']}>
              <OrganisationAnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/calendar"
          element={
            <PrivateRoute allowedRoles={['OrgAdmin']}>
              <OrganisationCalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/slots"
          element={
            <PrivateRoute allowedRoles={['OrgAdmin']}>
              <OrganisationSlotManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/contract"
          element={
            <PrivateRoute allowedRoles={['OrgAdmin']}>
              <OrganisationContractPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/wallet"
          element={
            <PrivateRoute allowedRoles={['OrgAdmin']}>
              <OrganisationWalletPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organisation/settings"
          element={
            <PrivateRoute allowedRoles={['OrgAdmin']}>
              <OrganisationSettingsPage />
            </PrivateRoute>
          }
        />

        {/* ============ OPHTHALMOLOGIST ROUTES ============ */}
        <Route
          path="/ophthalmologist/dashboard"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/patients"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistPatientsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/screenings"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistScreeningsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/analytics"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistAnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/appointments"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistAppointmentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/settings"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/consultations"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistConsultationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/screenings/:screeningId/review"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistScreeningReviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/schedules"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistSlotManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/slot-management"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistSlotManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ophthalmologist/contract"
          element={
            <PrivateRoute allowedRoles={['Ophthalmologist']}>
              <OphthalmologistContractPage />
            </PrivateRoute>
          }
        />

        {/* ============ SYSTEM ADMIN ROUTES ============ */}
        <Route
          path="/system-admin/dashboard"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/status"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminStatus />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/organisations"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminOrganisations />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/patients"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminPatients />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/ophthalmologists"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminOphthalmologists />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/verifications"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminVerificationRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/withdrawal-requests"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminWithdrawalRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/cashflow"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminCashflow />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/users"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/audit-logs"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminAuditLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/settings"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/permissions"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminPermissions />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/contract-templates"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminContractTemplates />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/contract-templates/:id/edit"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminContractTemplateEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/contract-templates/new"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminContractTemplateEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/system-admin/contracts"
          element={
            <PrivateRoute allowedRoles={['SystemAdmin', 'Admin']}>
              <SystemAdminContracts />
            </PrivateRoute>
          }
        />

        {/* ============ PROFESSIONAL NETWORK ROUTES ============ */}
        <Route
          path="/network"
          element={
            <PrivateRoute
              allowedRoles={[
                'SystemAdmin',
                'Admin',
                'OrgAdmin',
                'Ophthalmologist',
              ]}
            >
              <NetworkLayout />
            </PrivateRoute>
          }
        >
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

        <Route path="*" element={<LocalizedRedirect target="/404" />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default Router;
