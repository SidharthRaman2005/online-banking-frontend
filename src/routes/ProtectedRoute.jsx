import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageSpinner from '../components/ui/FullPageSpinner';

/**
 * Waits for the session to rehydrate before deciding. Redirecting during `loading` is the classic
 * bug here: every hard refresh on a protected page would kick the user back to login.
 */
export default function ProtectedRoute({ adminOnly = false, userOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back there.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (userOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
