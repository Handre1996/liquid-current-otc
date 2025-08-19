import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, loading } = useAuth();
  const { supabase } = useAuth();
  
  const from = location.state?.from || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        toast.success(`Welcome back${email ? ', ' + email.split('@')[0] : ''}!`);
      } else {
        // Handle specific error cases with more robust checking
        const errorMessage = error.message || '';
        const errorCode = (error as any)?.code || '';
        
        if (errorMessage.includes('Invalid login credentials') || 
            errorMessage.includes('invalid_credentials') ||
            errorCode === 'invalid_credentials') {
          setErrorMessage('Invalid email or password. Please check your credentials and try again.');
          toast.error('Invalid email or password. Please try again or reset your password if you forgot it.');
        } else if (errorMessage.includes('Email not confirmed') || 
                   errorMessage.includes('email_not_confirmed') ||
                   errorCode === 'email_not_confirmed') {
          setErrorMessage('Please confirm your email address before logging in.');
          toast.error('Please check your email and confirm your account before logging in.');
        } else if (errorMessage.includes('Too many requests') ||
                   errorCode === 'too_many_requests') {
          setErrorMessage('Too many login attempts. Please wait a moment before trying again.');
          toast.error('Too many login attempts. Please wait a moment before trying again.');
        } else {
          setErrorMessage(errorMessage || 'An error occurred during login');
          toast.error(`Login failed: ${errorMessage || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      const message = error.message || 'An error occurred during login';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset link sent! Please check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setIsResetting(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-brand-800">
              <h1 className="text-3xl font-heading font-bold text-navy dark:text-foam">
                Welcome Back
              </h1>
              <p className="mt-2 text-gray-600">
              <p className="mt-2 font-body text-teal dark:text-foam/80">
                Sign in to access your account
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-navy dark:text-foam">Sign In</CardTitle>
                <CardDescription>
                <CardDescription className="font-body text-teal dark:text-foam/70">
                  Enter your credentials to sign in to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                    <div className="p-3 text-sm text-redAccent bg-redAccent/10 border border-redAccent/20 rounded-md">
                      {errorMessage}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage(''); // Clear error when user types
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={isResetting}
                        className="text-sm text-navy hover:text-teal dark:text-foam dark:hover:text-foam/80"
                      >
                        {isResetting ? 'Sending...' : 'Forgot password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrorMessage(''); // Clear error when user types
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <div className="text-center text-sm">
                    <p className="text-gray-600">
                    <p className="font-body text-teal dark:text-foam/70">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-navy hover:text-teal dark:text-foam dark:hover:text-foam/80 font-medium">
                        Create an Account
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}