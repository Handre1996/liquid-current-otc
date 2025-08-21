import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { checkExistingSubmission } from '@/utils/kycUtils';

export default function Hero() {
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
      } catch (error) {
        console.error("Error checking KYC status:", error);
      }
    };

    checkKyc();
  }, [user]);

  const handleCTAClick = () => {
    if (!user) {
      navigate('/login');
    } else if (!hasSubmittedKyc) {
      navigate('/kyc');
    } else if (kycStatus === 'approved') {
      navigate('/dashboard');
    } else {
      // For pending or rejected KYC, just stay on the home page
      navigate('/');
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-navy via-teal to-navy dark:from-navy dark:via-teal dark:to-navy text-blanc">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-foam/20 via-teal/20 to-foam/20 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-foam/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-foam/5 via-teal/5 to-foam/5 rounded-full blur-3xl animate-spin"
          style={{ animationDuration: '20s' }}
        ></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-sm">
                  <span className="text-sm font-medium text-blue-200">
                    🏆 FSCA Regulated • FSP 53702
                  </span>
                </div>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <div className="flex flex-col items-center lg:items-start">
                  <img
                    src="/LiquidCurrent_Logo_CMYK_SecondaryLogoNavy.png"
                    alt="Liquid Current OTC Desk"
                    className="h-40 w-auto mb-4 filter brightness-0 invert lg:-ml-5"
                  />
                  <span className="block bg-gradient-to-r from-foam via-teal to-foam bg-clip-text text-transparent font-heading text-2xl sm:text-3xl lg:text-4xl">
                    OTC Desk
                  </span>
                </div>
              </h1>

              <p className="mt-6 text-xl text-foam dark:text-foam max-w-3xl leading-relaxed font-body">
                Trade cryptocurrency for fiat or fiat for crypto through our FSCA regulated OTC desk.
                Complete your KYC once and trade with confidence in a secure, professional environment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={handleCTAClick}
                className="bg-gradient-to-r from-navy to-teal hover:from-navy/90 hover:to-teal/90 text-blanc font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
              >
                {!user
                  ? '🚀 Get Started'
                  : !hasSubmittedKyc
                  ? '📋 Start KYC Process'
                  : kycStatus === 'approved'
                  ? '💼 Go to Trading Dashboard'
                  : '📊 View Status'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-foam/50 bg-blanc/10 backdrop-blur-sm text-foam hover:bg-blanc/20 hover:text-blanc hover:border-foam font-semibold transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <Link to="/about">📖 Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
}
