import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkExistingSubmission } from '@/utils/kycUtils';
import { toast } from 'sonner';
import { notifyAdminNewSignup } from '@/services/adminNotificationService';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  kycStatus: string | null;
  hasSubmittedKyc: boolean;
  kycLoading: boolean;
  refreshKycStatus: () => Promise<void>;
  signUp: (email: string, password: string, options?: { data?: { first_name?: string; surname?: string } }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  supabase: typeof supabase;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [hasSubmittedKyc, setHasSubmittedKyc] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  const loadKycStatus = async (userId: string) => {
    setKycLoading(true);
    try {
      const submission = await checkExistingSubmission(userId);
      setHasSubmittedKyc(!!submission);
      setKycStatus(submission?.status || null);
    } catch (error) {
      console.error("Error checking KYC status:", error);
      setHasSubmittedKyc(false);
      setKycStatus(null);
    } finally {
      setKycLoading(false);
    }
  };

  const refreshKycStatus = async () => {
    if (user) {
      await loadKycStatus(user.id);
    }
  };
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        // Sync user to database if signed in
        if (initialSession?.user) {
          try {
            await syncUserToDatabase(initialSession.user);
            await loadKycStatus(initialSession.user.id);
          } catch (error) {
            console.error('Error syncing user to database on init:', error);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Clear any corrupted session data
        setSession(null);
        setUser(null);
      }

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          
          // Sync user to public.users table on sign in/up
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              await syncUserToDatabase(session.user);
              await loadKycStatus(session.user.id);
              toast.success('Signed in successfully');
            } catch (error) {
              console.error('Error syncing user to database:', error);
              toast.success('Signed in successfully');
            }
          } else if (event === 'SIGNED_OUT') {
            // Clear KYC status on sign out
            setKycStatus(null);
            setHasSubmittedKyc(false);
            // Check if this was due to an invalid session
            if (session === null && (user !== null || session !== null)) {
              toast.error('Your session has expired. Please log in again.');
            } else {
              toast.success('Signed out successfully');
            }
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }
        }
      );

      // Add global error listener for refresh token errors
      const handleGlobalError = (event: ErrorEvent) => {
        const errorMessage = event.message || event.error?.message || '';
        if (errorMessage.includes('Invalid Refresh Token') || 
            errorMessage.includes('refresh_token_not_found')) {
          console.warn('Invalid refresh token detected, clearing session');
          signOut();
          toast.error('Your session has become invalid. Please log in again.');
        }
      };

      // Listen for unhandled promise rejections that might contain refresh token errors
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason;
        if (reason && typeof reason === 'object') {
          const message = reason.message || JSON.stringify(reason);
          if (message.includes('Invalid Refresh Token') || 
              message.includes('refresh_token_not_found')) {
            console.warn('Invalid refresh token detected in promise rejection, clearing session');
            signOut();
            toast.error('Your session has become invalid. Please log in again.');
          }
        }
      };

      window.addEventListener('error', handleGlobalError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      setLoading(false);

      return () => {
        subscription?.unsubscribe();
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    };
    
    initAuth();
  }, []);

  const syncUserToDatabase = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          surname: user.user_metadata?.surname || '',
          phone: user.phone || '',
          created_at: user.created_at,
          updated_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          email_confirmed_at: user.email_confirmed_at,
          is_active: true
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error syncing user to database:', error);
      }
    } catch (error) {
      console.error('Error in syncUserToDatabase:', error);
    }
  };

  const signUp = async (email: string, password: string, options?: { data?: { first_name?: string; surname?: string } }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login',
          data: options?.data
        }
      });
      
      if (error) {
        if (error.message === 'User already registered') {
          toast.error('An account with this email already exists. Please sign in instead.');
          return { error: null };
        }
        toast.error(error.message);
        return { error };
      }
      
      // If user is created, sync to database immediately
      if (data.user) {
        try {
          await syncUserToDatabase(data.user);
          
          // Send email notification to admin about new user signup
          await notifyAdminNewSignup(data.user);
        } catch (syncError) {
          console.error('Error syncing new user to database:', syncError);
          // Don't fail registration if sync fails
        }
      }
      
      toast.success('Registration successful! Please check your email to confirm your account.');
      return { error: null };
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during signup");
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      return { error: null };
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during sign-in");
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear local session state immediately after successful sign-out
      setSession(null);
      setUser(null);
      
      if (error) {
        console.error("Sign-out error:", error);
        toast.error("Failed to sign out properly");
      }
    } catch (error) {
      console.error("Sign-out error:", error);
      // Still clear local state even if sign-out fails
      setSession(null);
      setUser(null);
      toast.error("Failed to sign out properly");
    }
  };

  const contextValue = {
    session,
    user,
    loading,
    kycStatus,
    hasSubmittedKyc,
    kycLoading,
    refreshKycStatus,
    signUp,
    signIn,
    signOut,
    supabase,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};