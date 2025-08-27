import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import TradingDashboard from '@/components/trading/TradingDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { checkExistingSubmission } from '@/utils/kycUtils';
import { toast } from 'sonner';

const TradingDashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      if (!loading) {
        if (!user) {
          toast.error('Please log in to access the trading dashboard');
          navigate('/login', { state: { from: '/dashboard' } });
          return;
        }

        // Check if user has completed KYC
        try {
          const submission = await checkExistingSubmission(user.id);
          if (!submission) {
            toast.error('Please complete your KYC process before trading');
            navigate('/kyc');
            return;
          }

          if (submission.status !== 'approved') {
            toast.error('Your KYC is still pending approval. You cannot trade yet.');
            navigate('/');
            return;
          }
        } catch (error) {
          console.error('Error checking KYC status:', error);
          toast.error('Error verifying your account status');
          navigate('/');
        }
      }
    };

    checkAccess();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col trading-dashboard-bg">
      <Header />
      <div className="flex-1">
        <TradingDashboard />
      </div>
    </div>
  );
};

export default TradingDashboardPage;