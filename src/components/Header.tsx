import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { X, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, kycStatus, hasSubmittedKyc } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdmin = user?.email?.endsWith('@liquidcurrent.com');
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [location.pathname]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Helper to check if a path is active
  const isActive = (path: string) => location.pathname === path;
  
  const handleKycClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/kyc' } });
    } else {
      navigate('/kyc');
    }
  };

  const handleDashboardClick = () => {
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
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-0 sm:px-2 lg:px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center ml-6 lg:ml-0">
                <img 
                  src="/LiquidCurrent_Logo_CMYK_SecondaryLogoNavy.png" 
                  alt="Liquid Current" 
                  className="h-24 w-auto dark:hidden"
                />
                <img 
                  src="/LiquidCurrent_Logo_CMYK_SecondaryLogoFoam.png" 
                  alt="Liquid Current" 
                  className="h-24 w-auto hidden dark:block"
                />
              </Link>
            </div>
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                  isActive('/') 
                    ? "border-navy text-navy dark:border-foam dark:text-foam" 
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                  isActive('/about') 
                    ? "border-navy text-navy dark:border-foam dark:text-foam" 
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                About
              </Link>
              {user && kycStatus === 'approved' && (
                <Link 
                  to="/dashboard" 
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                    isActive('/dashboard') 
                      ? "border-brand-500 text-foreground" 
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  Trading
                </Link>
              )}
              {user && !hasSubmittedKyc && (
                <Link 
                  to="/kyc" 
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                    isActive('/kyc') 
                      ? "border-brand-500 text-foreground" 
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  KYC Process
                </Link>
              )}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                    isActive('/admin') 
                      ? "border-brand-500 text-foreground" 
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                {kycStatus === 'approved' ? (
                  <Button variant="ghost" onClick={handleDashboardClick} className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                    Trading Dashboard
                  </Button>
                ) : !hasSubmittedKyc ? (
                  <Button variant="ghost" onClick={handleKycClick} className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                    Complete KYC
                  </Button>
                ) : kycStatus === 'pending' ? (
                  <Button variant="ghost" disabled className="text-muted-foreground">
                    KYC Pending
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <div className="ml-3 relative">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/register" className="bg-gradient-to-r from-navy to-teal hover:from-navy/90 hover:to-teal/90 text-blanc">
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden space-x-2">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden border-t border-border`}>
        <div className="pt-2 pb-3 space-y-1 bg-background">
          <Link 
            to="/" 
            className={cn(
              "block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors",
              isActive('/') 
                ? "border-brand-500 text-foreground bg-brand-50 dark:bg-brand-950" 
                : "border-transparent text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground"
            )}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={cn(
              "block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors",
              isActive('/about') 
                ? "border-brand-500 text-foreground bg-brand-50 dark:bg-brand-950" 
                : "border-transparent text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground"
            )}
          >
            About
          </Link>
          {user && kycStatus === 'approved' && (
            <Link 
              to="/dashboard" 
              className={cn(
                "block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors",
                isActive('/dashboard') 
                  ? "border-brand-500 text-foreground bg-brand-50 dark:bg-brand-950" 
                  : "border-transparent text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground"
              )}
            >
              Trading
            </Link>
          )}
          {user && !hasSubmittedKyc && (
            <Link 
              to="/kyc" 
              className={cn(
                "block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors",
                isActive('/kyc') 
                  ? "border-brand-500 text-foreground bg-brand-50 dark:bg-brand-950" 
                  : "border-transparent text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground"
              )}
            >
              KYC Process
            </Link>
          )}
          {isAdmin && (
            <Link 
              to="/admin" 
              className={cn(
                "block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors",
                isActive('/admin') 
                  ? "border-brand-500 text-foreground bg-brand-50 dark:bg-brand-950" 
                  : "border-transparent text-muted-foreground hover:bg-accent hover:border-border hover:text-foreground"
              )}
            >
              Admin
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-border bg-background">
          {user ? (
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-foreground">
                  {user.email}
                </div>
              </div>
            </div>
          ) : null}
          <div className="mt-3 space-y-1">
            {user ? (
              <>
                {kycStatus === 'approved' ? (
                  <button
                    onClick={handleDashboardClick}
                    className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-brand-600 hover:bg-accent dark:text-brand-400"
                  >
                    Trading Dashboard
                  </button>
                ) : !hasSubmittedKyc ? (
                  <button
                    onClick={handleKycClick}
                    className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-brand-600 hover:bg-accent dark:text-brand-400"
                  >
                    Complete KYC
                  </button>
                ) : null}
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="px-4 py-2 space-y-2">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link to="/login" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600">
                  <Link to="/register" className="bg-gradient-to-r from-navy to-teal hover:from-navy/90 hover:to-teal/90 text-blanc">
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;