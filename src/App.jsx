import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Minimal loading — just a small spinner, no full-page block
const Loading = () => (
  <div className="h-screen w-full flex items-center justify-center bg-gray-50">
    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Public screens
import LoginScreen    from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OtpVerifyScreen from './screens/OtpVerifyScreen';
import LandingPage    from './screens/LandingPage';

// Layouts
const AdminLayout    = lazy(() => import('./layouts/AdminLayout'));
const BorrowerLayout = lazy(() => import('./layouts/BorrowerLayout'));
const StaffLayout    = lazy(() => import('./layouts/StaffLayout'));
const AgentLayout    = lazy(() => import('./layouts/AgentLayout'));

// Staff screens
const StaffDashboard      = lazy(() => import('./screens/staff/StaffDashboard'));
const StaffLoans          = lazy(() => import('./screens/staff/StaffLoans'));
const StaffBorrowers      = lazy(() => import('./screens/staff/StaffBorrowers'));
const StaffPayments       = lazy(() => import('./screens/staff/StaffPayments'));
const StaffNotifications  = lazy(() => import('./screens/staff/StaffNotifications'));
const StaffProfile        = lazy(() => import('./screens/staff/StaffProfile'));
const StaffCalendar       = lazy(() => import('./screens/staff/StaffCalendar'));

// Admin screens
const AdminDashboard     = lazy(() => import('./screens/admin/AdminDashboard'));
const AdminStaff         = lazy(() => import('./screens/admin/AdminStaff'));
const AdminBorrowers     = lazy(() => import('./screens/admin/AdminBorrowers'));
const AdminAgents        = lazy(() => import('./screens/admin/AdminAgents'));
const AdminAdmins        = lazy(() => import('./screens/admin/AdminAdmins'));
const AdminPayments      = lazy(() => import('./screens/admin/AdminPayments'));
const AdminLoans         = lazy(() => import('./screens/admin/AdminLoans'));
const AdminDefaults      = lazy(() => import('./screens/admin/AdminDefaults'));
const AdminSettings      = lazy(() => import('./screens/admin/AdminSettings'));
const AdminAudit         = lazy(() => import('./screens/admin/AdminAudit'));
const AdminNotifications = lazy(() => import('./screens/admin/AdminNotifications'));
const AdminUsers         = lazy(() => import('./screens/admin/AdminUsers'));
const AdminProfile       = lazy(() => import('./screens/admin/AdminProfile'));
const AdminCollateral    = lazy(() => import('./screens/admin/AdminCollateral'));
const AdminCalendar      = lazy(() => import('./screens/admin/AdminCalendar'));
const AdminCRM           = lazy(() => import('./screens/admin/AdminCRM'));

// Borrower screens
const BorrowerDashboard     = lazy(() => import('./screens/borrower/BorrowerDashboard'));
const BorrowerLoans         = lazy(() => import('./screens/borrower/BorrowerLoans'));
const BorrowerProfile       = lazy(() => import('./screens/borrower/BorrowerProfile'));
const BorrowerCollateral    = lazy(() => import('./screens/borrower/BorrowerCollateral'));
const BorrowerPayments      = lazy(() => import('./screens/borrower/BorrowerPayments'));
const BorrowerNotifications = lazy(() => import('./screens/borrower/BorrowerNotifications'));
const LoanApplyForm         = lazy(() => import('./screens/borrower/LoanApplyForm'));

// Agent screens
const AgentDashboard     = lazy(() => import('./screens/agent/AgentDashboard'));
const AgentClients       = lazy(() => import('./screens/agent/AgentClients'));
const CommissionTracker  = lazy(() => import('./screens/agent/CommissionTracker'));
const AgentPayments      = lazy(() => import('./screens/agent/AgentPayments'));
const AgentNotifications = lazy(() => import('./screens/agent/AgentNotifications'));
const AgentProfile       = lazy(() => import('./screens/agent/AgentProfile'));

/** Old bookmarks: /app → /borrower (same child paths). */
function LegacyAppToBorrowerRedirect() {
  const { pathname, search } = useLocation();
  if (!pathname.startsWith('/app')) {
    return <Navigate to="/borrower/dashboard" replace />;
  }
  const suffix = pathname === '/app' ? '/dashboard' : pathname.slice(4);
  return <Navigate to={`/borrower${suffix}${search}`} replace />;
}

// App Routes
function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/register/borrower" element={<RegisterScreen fixedRole="BORROWER" />} />
          <Route path="/register/agent" element={<RegisterScreen fixedRole="AGENT" />} />
          <Route path="/otp"      element={<OtpVerifyScreen />} />

          <Route path="/app" element={<Navigate to="/borrower/dashboard" replace />} />
          <Route path="/app/*" element={<LegacyAppToBorrowerRedirect />} />

          {/* Staff */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffLayout /></ProtectedRoute>}>
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<StaffDashboard />} />
            <Route path="loans"         element={<StaffLoans />} />
            <Route path="borrowers"     element={<StaffBorrowers />} />
            <Route path="payments"      element={<StaffPayments />} />
            <Route path="calendar"      element={<StaffCalendar />} />
            <Route path="notifications" element={<StaffNotifications />} />
            <Route path="profile"       element={<StaffProfile />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<AdminDashboard />} />
            <Route path="users"         element={<AdminUsers />} />
            <Route path="staff"         element={<AdminStaff />} />
            <Route path="borrowers"     element={<AdminBorrowers />} />
            <Route path="agents"        element={<AdminAgents />} />
            <Route path="admins"        element={<AdminAdmins />} />
            <Route path="loans"         element={<AdminLoans />} />
            <Route path="payments"      element={<AdminPayments />} />
            <Route path="calendar"      element={<AdminCalendar />} />
            <Route path="commissions"   element={<CommissionTracker />} />
            <Route path="defaults"      element={<AdminDefaults />} />
            <Route path="collateral"    element={<AdminCollateral />} />
            <Route path="settings"      element={<AdminSettings />} />
            <Route path="audit"         element={<AdminAudit />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="profile"       element={<AdminProfile />} />
            <Route path="crm"           element={<AdminCRM />} />
          </Route>

          {/* Borrower — URL prefix matches role name like /admin, /staff, /agent */}
          <Route path="/borrower" element={<ProtectedRoute allowedRoles={['borrower']}><BorrowerLayout /></ProtectedRoute>}>
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<BorrowerDashboard />} />
            <Route path="apply"         element={<LoanApplyForm />} />
            <Route path="loans"         element={<BorrowerLoans />} />
            <Route path="payments"      element={<BorrowerPayments />} />
            <Route path="notifications" element={<BorrowerNotifications />} />
            <Route path="collateral"    element={<BorrowerCollateral />} />
            <Route path="profile"       element={<BorrowerProfile />} />
          </Route>

          {/* Agent */}
          <Route path="/agent" element={<ProtectedRoute allowedRoles={['agent']}><AgentLayout /></ProtectedRoute>}>
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<AgentDashboard />} />
            <Route path="clients"       element={<AgentClients />} />
            <Route path="earnings"      element={<CommissionTracker />} />
            <Route path="payments"      element={<AgentPayments />} />
            <Route path="notifications" element={<AgentNotifications />} />
            <Route path="profile"       element={<AgentProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

import { LoanProvider } from './context/LoanContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <LoanProvider>
          <AppRoutes />
        </LoanProvider>
      </AuthProvider>
    </Router>
  );
}
