import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import KycProcess from '@/components/KycProcess';
import Footer from '@/components/Footer';

const Index = () => {
  const { user, kycStatus, hasSubmittedKyc, kycLoading } = useAuth();
  const navigate = useNavigate();
  
  // Automatically redirect to trading dashboard if KYC is approved
  useEffect(() => {
    if (kycStatus === 'approved' && !kycLoading) {
      navigate('/dashboard');
    }
  }, [kycStatus, kycLoading, navigate]);
  
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
            <div className="bg-redAccent/10 dark:bg-redAccent/20 py-8 border-b border-redAccent/30 dark:border-redAccent/50">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-heading font-bold text-redAccent dark:text-redAccent mb-4">
                  KYC Requires Attention
                </h2>
                <p className="font-body text-redAccent dark:text-redAccent/80 mb-6">
                  Your KYC submission needs to be updated. Please contact support for assistance.
                </p>
              </div>
            </div>
          ) : !hasSubmittedKyc ? (
            <div className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 py-8 border-b border-foam/50 dark:border-teal/30">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam mb-4">
                  Complete Your Verification
                </h2>
                <p className="font-body text-teal dark:text-foam/80 mb-6">
                  You're logged in as {user.email}. Complete your KYC process to start trading.
                </p>
                <Button onClick={handleKycClick} className="bg-gradient-to-r from-navy to-teal hover:from-navy/90 hover:to-teal/90 text-blanc font-body">
                  Start KYC Process
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="bg-gradient-to-r from-foam/20 to-ivory/50 dark:from-teal/20 dark:to-navy/30 py-8 border-b border-foam/50 dark:border-teal/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam mb-4">
              Start Trading Today
            </h2>
            <p className="font-body text-teal dark:text-foam/80 mb-6">
              Register and complete KYC to access our OTC trading platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => navigate('/register')} className="bg-gradient-to-r from-navy to-teal hover:from-navy/90 hover:to-teal/90 text-blanc font-body">
                Register Now
              </Button>
              <Button variant="outline" onClick={() => navigate('/login')} className="border-navy text-navy hover:bg-navy hover:text-blanc dark:border-foam dark:text-foam dark:hover:bg-foam dark:hover:text-navy font-body">
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