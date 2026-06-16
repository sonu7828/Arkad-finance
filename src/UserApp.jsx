import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const Loading = () => (
  <div className="h-screen w-full flex items-center justify-center bg-gray-50">
    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Public
import LoginScreen    from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OtpVerifyScreen from './screens/OtpVerifyScreen';
import LandingPage    from './screens/LandingPage';

// Layouts
const BorrowerLayout = lazy(() => import('./layouts/BorrowerLayout'));
const AgentLayout    = lazy(() => import('./layouts/AgentLayout'));

// Borrower
const BorrowerDashboard     = lazy(() => import('./screens/borrower/BorrowerDashboard'));
const BorrowerLoans         = lazy(() => import('./screens/borrower/BorrowerLoans'));
const BorrowerProfile       = lazy(() => import('./screens/borrower/BorrowerProfile'));
const BorrowerCollateral    = lazy(() => import('./screens/borrower/BorrowerCollateral'));
const BorrowerPayments      = lazy(() => import('./screens/borrower/BorrowerPayments'));
const BorrowerNotifications = lazy(() => import('./screens/borrower/BorrowerNotifications'));
const LoanApplyForm         = lazy(() => import('./screens/borrower/LoanApplyForm'));

// Agent
const AgentDashboard     = lazy(() => import('./screens/agent/AgentDashboard'));
const AgentClients       = lazy(() => import('./screens/agent/AgentClients'));
const CommissionTracker  = lazy(() => import('./screens/agent/CommissionTracker'));
const AgentPayments      = lazy(() => import('./screens/agent/AgentPayments'));
const AgentNotifications = lazy(() => import('./screens/agent/AgentNotifications'));

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

          {/* Borrower */}
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
            <Route path="profile"       element={<BorrowerProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function UserApp() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
