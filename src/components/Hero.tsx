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

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-navy via-teal to-navy dark:from-navy dark:via-teal dark:to-navy text-blanc">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/beautiful.jpg"
          alt="Background"
          className="w-full h-full object-cover"
          style={{
            objectPosition: "80% 30%",      // shift more left than before (40% → 30%)
            transform: "scale(1.45)",       // slightly more zoom to bring subject closer
            transformOrigin: "left center", // anchor zooming from the left side
          }}
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-foam/10 via-teal/10 to-foam/10 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-foam/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-foam/3 via-teal/3 to-foam/3 rounded-full blur-3xl animate-spin"
          style={{ animationDuration: '20s' }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-6">
              {/* Logo + OTC Desk */}
              <div className="flex flex-col items-start">
                {/* Light mode: Navy logo */}
                <img
                  src="/LiquidCurrent_Logo_CMYK_SecondaryLogoNavy.png"
                  alt="Liquid Current OTC Desk"
                  className="h-40 w-auto mb-4 -ml-10 dark:hidden"
                />
                {/* Dark mode: White logo */}
                <img
                  src="/LiquidCurrent_Logo_CMYK_SecondaryLogoWhite.png"
                  alt="Liquid Current OTC Desk"
                  className="h-40 w-auto mb-4 -ml-10 hidden dark:block"
                />

                {/* OTC Desk */}
                <span className="inline-block bg-white text-navy font-heading text-2xl sm:text-3xl lg:text-4xl px-4 py-2 rounded-lg">
                  OTC Desk
                </span>
              </div>

              {/* Tagline */}
              <p className="mt-6 text-xl text-navy max-w-3xl leading-relaxed font-body">
                Trade cryptocurrency for fiat or fiat for crypto through<br />
                our FSCA regulated OTC desk. Complete your KYC<br />
                once and trade with confidence.
              </p>

              {/* Call-to-action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-navy to-teal hover:from-navy/90 hover:to-teal/90 text-blanc font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 font-body"
                >
                  Start KYC Process
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-navy bg-foam text-navy hover:bg-foam/80 hover:text-navy hover:border-navy font-semibold transition-all duration-300 transform hover:scale-105 font-body"
                  asChild
                >
                  <Link to="/about">Contact Us</Link>
                </Button>
              </div>

              {/* Disclaimer under buttons */}
              <p className="mt-4 text-xs text-navy font-body">
                Regulated by the Financial Sector Conduct Authority (FSCA) under FSP Number 53702
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
}
