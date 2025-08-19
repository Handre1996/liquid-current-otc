import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return "Password must be at least 6 characters long";
    }
    if (!hasLetter) {
      return "Password must contain at least one letter";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !surname.trim()) {
      toast.error("Please enter both first name and surname");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure your passwords match",
      });
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, {
        data: {
          first_name: firstName,
          surname: surname
        }
      });
      
      if (!error) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    }
  };

  const onCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const onCaptchaError = (err: Error) => {
    console.error("CAPTCHA error:", err);
    toast.error("CAPTCHA verification failed");
  };

  const onCaptchaExpire = () => {
    setCaptchaToken(null);
    toast.error("CAPTCHA expired, please verify again");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-heading font-bold text-navy dark:text-foam">
                Create an Account
              </h1>
              <p className="mt-2 font-body text-teal dark:text-foam/80">
                Register to start your KYC process
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-navy dark:text-foam">Register</CardTitle>
                <CardDescription>
                  Create an account to start your verification process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Surname</Label>
                      <Input
                        id="surname"
                        placeholder="Surname"
                        required
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Password must be at least 6 characters long and contain at least one letter and one special character
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center my-4">
                    <HCaptcha
                      ref={captchaRef}
                      sitekey="10000000-ffff-ffff-ffff-000000000001"
                      onVerify={onCaptchaVerify}
                      onError={onCaptchaError}
                      onExpire={onCaptchaExpire}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || !captchaToken}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                  <div className="text-center text-sm">
                    <p className="text-gray-600">
                    <p className="font-body text-teal dark:text-foam/70">
                      Already have an account?{" "}
                      <Link to="/login" className="text-navy hover:text-teal dark:text-foam dark:hover:text-foam/80 font-medium">
                        Sign In
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
