import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullPageSpinner from '../components/ui/FullPageSpinner';

/** Keeps a signed-in user off the login and register screens. */
export default function PublicOnlyRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;

  return <Outlet />;
}
