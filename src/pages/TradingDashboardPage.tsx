import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import TradingDashboard from '@/components/trading/TradingDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const TradingDashboardPage = () => {
  const { user, loading, kycStatus, hasSubmittedKyc, kycLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      if (!loading && !kycLoading) {
        if (!user) {
          toast.error('Please log in to access the trading dashboard');
          navigate('/login', { state: { from: '/dashboard' } });
          return;
        }

        // Check KYC status from context
        if (!hasSubmittedKyc) {
          toast.error('Please complete your KYC process before trading');
          navigate('/kyc');
          return;
        }

        if (kycStatus !== 'approved') {
          toast.error('Your KYC is still pending approval. You cannot trade yet.');
          navigate('/');
          return;
        }
      }
    };

    checkAccess();
  }, [user, loading, kycStatus, hasSubmittedKyc, kycLoading, navigate]);

  if (loading || kycLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg">
            {kycLoading ? 'Checking KYC status...' : 'Loading...'}
          </div>
        </div>
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