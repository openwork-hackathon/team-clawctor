import type { FC } from 'react';
import { useState } from 'react';
import {
  AuthHeader,
  AuthToggle,
  GoogleSSOButton,
  Divider,
  LoginForm,
  SignUpForm,
  SecurityFooter,
  LegalLinks,
  BackgroundPattern,
  AuthCard,
  type AuthMode,
} from '../components/auth';
import type { AuthResult } from '../lib/auth-client';

export interface LoginPageProps {
  onSignIn?: (email: string, password: string) => Promise<AuthResult>;
  onSignUp?: (name: string, email: string, password: string) => Promise<AuthResult>;
  onGoogleSignIn?: () => Promise<AuthResult>;
  onForgotPassword?: () => void;
}

export const LoginPage: FC<LoginPageProps> = ({
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  onForgotPassword,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGoogleSSO = async () => {
    if (!onGoogleSignIn) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onGoogleSignIn();
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    if (!onSignIn) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onSignIn(email, password);
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (name: string, email: string, password: string, confirmPassword: string) => {
    if (!onSignUp) return;
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onSignUp(name, email, password);
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccessMessage('Account created successfully! Please sign in.');
        setAuthMode('login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      // Default behavior - could navigate to forgot password page
      console.log('Forgot password clicked');
    }
  };

  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMessage(null);
  };

  const title = authMode === 'login' ? 'Welcome back' : 'Create your account';
  const subtitle =
    authMode === 'login'
      ? 'Access your AI Health Check Center & Security Audit Portal'
      : 'Start your AI Health Check journey today';

  return (
    <div className="relative flex h-screen w-full flex-col overflow-x-hidden">
      <AuthHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        <BackgroundPattern />
        <AuthCard title={title} subtitle={subtitle}>
          <AuthToggle mode={authMode} onModeChange={handleModeChange} />
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            </div>
          )}
          
          <GoogleSSOButton onClick={handleGoogleSSO} isLoading={isLoading} />
          <Divider />
          {authMode === 'login' ? (
            <LoginForm 
              onSubmit={handleLogin} 
              onForgotPassword={handleForgotPassword}
              isLoading={isLoading}
            />
          ) : (
            <SignUpForm 
              onSubmit={handleSignUp}
              isLoading={isLoading}
            />
          )}
          <SecurityFooter />
        </AuthCard>
        <LegalLinks />
      </main>
    </div>
  );
};

export default LoginPage;
