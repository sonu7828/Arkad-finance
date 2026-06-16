import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const Loading = () => (
  <div className="h-screen w-full flex items-center justify-center bg-gray-50">
    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Screens
import LoginScreen from './screens/LoginScreen';

// Layouts
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const StaffLayout = lazy(() => import('./layouts/StaffLayout'));

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
const CommissionTracker  = lazy(() => import('./screens/agent/CommissionTracker'));

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/"       element={<Navigate to="/login" replace />} />
          <Route path="/login"  element={<LoginScreen isAdminPortal={true} />} />

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

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function AdminApp() {
  return (
    <Router basename="/manage">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
