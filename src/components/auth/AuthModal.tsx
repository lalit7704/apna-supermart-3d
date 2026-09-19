import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils,
  Lock,
  Mail,
  User as UserIcon,
  ChefHat,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { sound } from '../../utils/audio';

type AuthView = 'main_menu' | 'login' | 'signup' | 'forgot_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialView?: AuthView;
  onOpenSetup?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'main_menu',
  onOpenSetup,
}) => {
  const { login, signUp, resetPassword, playAsGuest, isConfigured } = useAuth();

  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlayAsGuest = () => {
    sound.playClick();
    playAsGuest();
    if (onClose) onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    const res = await login(email, password, rememberSession);
    setIsSubmitting(false);

    if (res.success) {
      sound.playLevelUp();
      if (onClose) onClose();
    } else {
      setErrorMessage(res.error || 'Incorrect email or password.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must meet the minimum security requirements (at least 6 characters).');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    const res = await signUp(email, password, fullName);
    setIsSubmitting(false);

    if (res.success) {
      sound.playLevelUp();
      if (res.message) {
        setSuccessMessage(res.message);
      } else {
        if (onClose) onClose();
      }
    } else {
      setErrorMessage(res.error || 'Could not create account. Please check your details.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    const res = await resetPassword(email);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Password reset link sent! Please check your email inbox.');
    } else {
      setErrorMessage(res.error || 'Unable to connect. Please check your internet connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Decorative Chef Hat & Badges */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-200/40 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

        {/* Supabase Notice Banner if not configured yet */}
        {!isConfigured && (
          <div className="mb-5 p-3.5 bg-amber-100/90 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Supabase Not Connected:</span> You can test the 3D game right now with{' '}
              <span className="font-bold text-amber-800">Play as Guest</span>, or connect your Supabase credentials in{' '}
              <button
                onClick={onOpenSetup}
                className="text-amber-700 underline font-semibold hover:text-amber-950"
              >
                Cloud Setup
              </button>.
            </div>
          </div>
        )}

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-amber-950 shadow-lg border-2 border-yellow-200 mb-3 transform hover:rotate-6 transition-transform">
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-tight font-['Fredoka']">
            SHREE GANESH KIRANA STORE
          </h1>
          <p className="text-amber-800/80 text-sm mt-1 font-medium">
            {currentView === 'main_menu' && 'Manage grocery inventory, stock shelves, bill customers & upgrade your shop!'}
            {currentView === 'login' && 'Welcome Back, Sethji! (दुकान लॉगिन)'}
            {currentView === 'signup' && 'Create your Kirana Owner Account (खाता बनाएं)'}
            {currentView === 'forgot_password' && 'Reset your Account Password (पासवर्ड रीसेट)'}
          </p>
        </div>

        {/* Error / Success Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* --- 1. MAIN MENU VIEW --- */}
        {currentView === 'main_menu' && (
          <div className="space-y-3.5">
            <button
              onClick={() => {
                sound.playClick();
                setCurrentView('login');
              }}
              id="main-menu-login-btn"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-base shadow-lg shadow-amber-700/20 border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <span>LOGIN (लॉगिन)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setCurrentView('signup');
              }}
              id="main-menu-create-account-btn"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-700/20 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>CREATE ACCOUNT (नया खाता)</span>
            </button>

            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200" />
              </div>
              <span className="relative px-3 bg-amber-50 text-amber-600/80 font-bold text-xs uppercase tracking-wider">
                OR
              </span>
            </div>

            <button
              onClick={handlePlayAsGuest}
              id="main-menu-play-as-guest-btn"
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-200/80 hover:bg-amber-200 text-amber-950 font-extrabold text-base border-2 border-amber-300 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">🛒</span>
              <span>PLAY AS GUEST (गेस्ट मोड)</span>
            </button>

            <p className="text-[11px] text-center text-amber-800/70 pt-1">
              Guest progress stays local on this device. Create an account anytime to save to the Supabase Cloud!
            </p>
          </div>
        )}

        {/* --- 2. LOGIN VIEW --- */}
        {currentView === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@restaurant.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-amber-900">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
                />
                Remember session
              </label>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentView('forgot_password');
                }}
                className="text-amber-700 hover:text-amber-950 font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="auth-submit-login-btn"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-base shadow-lg shadow-amber-700/20 border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>LOGIN</span>
              )}
            </button>

            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200" />
              </div>
              <span className="relative px-3 bg-amber-50 text-amber-600/80 font-bold text-xs uppercase tracking-wider">
                ──────── OR ────────
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlayAsGuest}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-sm border border-amber-300 transition-all flex items-center justify-center gap-2"
            >
              <span>PLAY AS GUEST</span>
            </button>

            <div className="text-center pt-2 text-xs text-amber-900 font-medium">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentView('signup');
                }}
                className="text-amber-700 font-extrabold hover:underline ml-1"
              >
                CREATE ACCOUNT
              </button>
            </div>
          </form>
        )}

        {/* --- 3. SIGN UP VIEW --- */}
        {currentView === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Chef Lalit"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@restaurant.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="auth-submit-create-account-btn"
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-700/20 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>

            <div className="relative py-1 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200" />
              </div>
              <span className="relative px-3 bg-amber-50 text-amber-600/80 font-bold text-xs uppercase tracking-wider">
                ──────── OR ────────
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlayAsGuest}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-sm border border-amber-300 transition-all flex items-center justify-center gap-2"
            >
              <span>PLAY AS GUEST</span>
            </button>

            <div className="text-center pt-2 text-xs text-amber-900 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentView('login');
                }}
                className="text-amber-700 font-extrabold hover:underline ml-1"
              >
                LOGIN
              </button>
            </div>
          </form>
        )}

        {/* --- 4. FORGOT PASSWORD VIEW --- */}
        {currentView === 'forgot_password' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              Enter the email address registered with your restaurant account. We will send a secure password reset link to your email inbox.
            </p>

            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@restaurant.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-amber-300 text-amber-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setCurrentView('login');
              }}
              className="w-full text-center text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline pt-2"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
