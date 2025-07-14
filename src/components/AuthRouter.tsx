import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRouterProps {
  children: React.ReactNode;
}

const AuthRouter = ({ children }: AuthRouterProps) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Don't navigate while auth is loading

    const currentPath = location.pathname;
    const isAuthPage = ['/login', '/register', '/reset-password'].includes(currentPath);
    const isProtectedPage = ['/admin', '/dashboard', '/kyc'].includes(currentPath);

    if (session && isAuthPage) {
      // Redirect authenticated users away from auth pages
      navigate('/');
    } else if (!session && isProtectedPage) {
      // Redirect unauthenticated users from protected pages to login
      navigate('/login');
    }
  }, [session, loading, location.pathname, navigate]);

  return <>{children}</>;
};

export default AuthRouter;