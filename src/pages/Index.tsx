import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import KycProcess from '@/components/KycProcess';
import Footer from '@/components/Footer';
import { checkExistingSubmission } from '@/utils/kycUtils';
import { useEffect, useState } from 'react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasSubmittedKyc, setHasSubmittedKyc] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  
  useEffect(() => {
    const checkKyc = async () => {
      if (!user) return;
      
      try {
        const submission = await checkExistingSubmission(user.id);
        setHasSubmittedKyc(!!submission);
        setKycStatus(submission?.status || null);
        
        // Automatically redirect to trading dashboard if KYC is approved
        if (submission?.status === 'approved') {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error checking KYC status:", error);
      }
    };
    
    checkKyc();
  }, [user, navigate]);
  
  const handleKycClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/kyc' } });
    } else {
      navigate('/kyc');
    }
  };

  const handleTradingClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/dashboard' } });
    } else if (!hasSubmittedKyc) {
      navigate('/kyc');
    } else if (kycStatus !== 'approved') {
      navigate('/');
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      
      {/* Add appropriate CTA based on user status */}
      {user ? (
        <>
          {kycStatus === 'pending' ? (
            <div className="bg-yellow-50 dark:bg-yellow-950/50 py-8 border-b border-yellow-200 dark:border-yellow-800">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">
                  KYC Under Review
                </h2>
                <p className="text-yellow-600 dark:text-yellow-400 mb-6">
                  Your KYC documents are being reviewed. You'll be notified once approved.
                </p>
              </div>
            </div>
          ) : kycStatus === 'rejected' ? (
            <div className="bg-red-50 dark:bg-red-950/50 py-8 border-b border-red-200 dark:border-red-800">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-4">
                  KYC Requires Attention
                </h2>
                <p className="text-red-600 dark:text-red-400 mb-6">
                  Your KYC submission needs to be updated. Please contact support for assistance.
                </p>
              </div>
            </div>
          ) : !hasSubmittedKyc ? (
            <div className="bg-brand-50 dark:bg-brand-950/50 py-8 border-b border-brand-200 dark:border-brand-800">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold text-brand-800 dark:text-brand-300 mb-4">
                  Complete Your Verification
                </h2>
                <p className="text-muted-foreground mb-6">
                  You're logged in as {user.email}. Complete your KYC process to start trading.
                </p>
                <Button onClick={handleKycClick} className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
                  Start KYC Process
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="bg-brand-50 dark:bg-brand-950/50 py-8 border-b border-brand-200 dark:border-brand-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-brand-800 dark:text-brand-300 mb-4">
              Start Trading Today
            </h2>
            <p className="text-muted-foreground mb-6">
              Register and complete KYC to access our OTC trading platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => navigate('/register')} className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
                Register Now
              </Button>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Features />
      <KycProcess />
      <Footer />
    </div>
  );
};

export default Index;