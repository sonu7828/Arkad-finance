import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function homeDashboardPath(role) {
  const r = role?.toLowerCase();
  if (r === 'admin' || r === 'staff' || r === 'agent' || r === 'borrower') {
    return `/${r}/dashboard`;
  }
  return '/login';
}

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Show loading only briefly (token check is now instant, so this rarely shows)
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeDashboardPath(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
