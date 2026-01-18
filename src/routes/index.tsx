import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './private-route';
import PublicRoute from './public-route';

// Layouts
import { DashboardLayout, MainLayout } from '@/components/layouts';

// Shared Pages (không thuộc feature cụ thể)
import {
  ConfirmEmailPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  RegisterPage,
} from '@/pages';

// Lazy load feature pages cho code splitting
const PatientDashboard = lazy(
  () => import('@/features/patient/pages/dashboard')
);
const RetinalAnalysis = lazy(
  () => import('@/features/patient/pages/retinal_analysis')
);
const AdminDashboard = lazy(() => import('@/features/admin/pages/dashboard'));

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
 * Tổ chức routes theo features và protected/public routes
 */
const Router = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes - cho users chưa login */}
        <Route element={<PublicRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          {/* Auth Routes typically don't share MainLayout if MainLayout has a header/footer that contradicts AuthLayout.
              However, currently LoginPage was inside MainLayout.
              AuthLayout includes the full page structure.
              So I should move them out of MainLayout if it conflicts, or just keep them here if MainLayout is just a wrapper.
              Let's assume we want them independent or if MainLayout is a hindrance.
              Creating a new Route group for Auth. */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        </Route>

        {/* Protected Routes - cần authentication */}
        <Route element={<PrivateRoute />}>
          {/* Patient Routes */}
          <Route path="/patient" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="analysis" element={<RetinalAnalysis />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Clinic Routes - TODO */}
          <Route path="/clinic" element={<DashboardLayout />}>
            <Route index element={<div>Clinic Dashboard - Coming Soon</div>} />
          </Route>

          {/* Ophthalmologist Routes - TODO */}
          <Route path="/ophthalmologist" element={<DashboardLayout />}>
            <Route
              index
              element={<div>Ophthalmologist Dashboard - Coming Soon</div>}
            />
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default Router;
