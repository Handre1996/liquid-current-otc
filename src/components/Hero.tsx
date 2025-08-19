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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-foam/5 via-teal/5 to-foam/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-sm">
                <span className="text-sm font-medium text-blue-200">🏆 FSCA Regulated • FSP 53702</span>
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <div className="flex flex-col items-center lg:items-start">
                  <img 
                    src="/LiquidCurrent_Logo_CMYK_SecondaryLogoNavy.png" 
                    alt="Liquid Current OTC Desk" 
                    className="h-40 w-auto mb-4 ml-16 filter brightness-0 invert"
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
              >
                {!user ? '🚀 Get Started' : 
                 !hasSubmittedKyc ? '📋 Start KYC Process' : 
                 kycStatus === 'approved' ? '💼 Go to Trading Dashboard' : 
                 '📊 View Status'}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-blue-400/50 bg-white/10 backdrop-blur-sm text-blue-100 hover:bg-white/20 hover:text-white hover:border-blue-300 font-semibold transition-all duration-300 transform hover:scale-105" 
                asChild
              >
                <Link to="/about">
                  📖 Learn More
                </Link>
              </Button>
            </div>
            
            <div className="pt-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-100">FSCA Regulated</p>
                    <p className="text-xs text-blue-200">Financial Sector Conduct Authority</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-100">FSP Number 53702</p>
                    <p className="text-xs text-blue-200">Licensed Financial Service Provider</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-100">Secure & Professional</p>
                    <p className="text-xs text-blue-200">Enterprise-grade security</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading stats */}
            <div className="pt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">R1B+</div>
                  <div className="text-sm text-blue-200">Volume Traded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-sm text-blue-200">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-sm text-blue-200">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-blue-200">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
}