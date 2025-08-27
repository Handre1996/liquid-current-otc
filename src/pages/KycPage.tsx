import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import KycForm from '@/components/KycForm';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const KycPage = () => {
  const { user, loading, kycStatus, hasSubmittedKyc, kycLoading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check authentication on initial render and redirect if not logged in
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("User not authenticated, redirecting to login");
        toast.error("Please log in to access the KYC form");
        setIsRedirecting(true);
        navigate('/login', { 
          state: { from: '/kyc' } // Store the intended destination
        });
      } else if (hasSubmittedKyc && !kycLoading) {
        // If user has already submitted KYC, redirect to home
        console.log("User already has KYC submission, redirecting to home");
        toast.info("You have already submitted your KYC documents");
        navigate('/', { replace: true });
      } else {
        console.log("KYC page accessed by authenticated user:", user.id);
      }
    }
  }, [user, loading, hasSubmittedKyc, kycLoading, navigate]);

  if (loading || kycLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg">
            {kycLoading ? 'Checking KYC status...' : 'Loading...'}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col kyc-page-bg">
      <Header />
      <div className="flex-1">
        {user && !hasSubmittedKyc && <KycForm />}
      </div>
      <Footer />
    </div>
  );
};

export default KycPage;