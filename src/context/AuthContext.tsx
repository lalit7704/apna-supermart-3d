import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  getSupabaseCredentials,
  formatAuthError,
} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  displayName: string;
  userEmail: string;
  loading: boolean;
  isConfigured: boolean;
  migrationSuccessBanner: boolean;
  clearMigrationBanner: () => void;
  playAsGuest: () => void;
  continueAsGuest: () => void;
  login: (email: string, password: string, rememberSession?: boolean) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateDisplayName: (newName: string) => Promise<{ success: boolean; error?: string }>;
  checkConfig: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem('supermart_guest_name') || 'Store Manager';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [migrationSuccessBanner, setMigrationSuccessBanner] = useState<boolean>(false);

  const checkConfig = () => {
    const creds = getSupabaseCredentials();
    setIsConfigured(creds.isConfigured);
  };

  useEffect(() => {
    checkConfig();
    const supabase = getSupabaseClient();

    if (!supabase) {
      // If not configured, default to not logged in, but not guest until they click Play as Guest or Login
      const savedGuestSession = localStorage.getItem('my_3d_restaurant_guest_active');
      if (savedGuestSession === 'true') {
        setIsGuest(true);
        setDisplayName('Guest Chef');
      }
      setLoading(false);
      return;
    }

    // Check existing active Supabase session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!error && session?.user) {
        setSession(session);
        setUser(session.user);
        setIsGuest(false);
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Chef';
        setDisplayName(name);
      } else {
        const savedGuest = localStorage.getItem('my_3d_restaurant_guest_active');
        if (savedGuest === 'true') {
          setIsGuest(true);
          setDisplayName('Guest Chef');
        }
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setUser(newSession.user);
        setIsGuest(false);
        localStorage.removeItem('my_3d_restaurant_guest_active');
        const name = newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name || newSession.user.email?.split('@')[0] || 'Chef';
        setDisplayName(name);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const playAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setSession(null);
    setDisplayName('Guest Chef');
    localStorage.setItem('my_3d_restaurant_guest_active', 'true');
  };

  const login = async (email: string, password: string, _rememberSession: boolean = true) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured yet. Please enter your credentials or Play as Guest.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: formatAuthError(error) };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setIsGuest(false);
        localStorage.removeItem('my_3d_restaurant_guest_active');
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Chef';
        setDisplayName(name);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured yet. Please enter your credentials or Play as Guest.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || 'Chef',
          },
        },
      });

      if (error) {
        return { success: false, error: formatAuthError(error) };
      }

      // Check if session was auto-created (confirm email disabled) or if verification email is sent
      if (data.session && data.user) {
        setUser(data.user);
        setSession(data.session);
        setIsGuest(false);
        localStorage.removeItem('my_3d_restaurant_guest_active');
        setDisplayName(fullName.trim() || 'Chef');
        // Trigger migration banner if guest had previous data
        const guestData = localStorage.getItem('my_3d_restaurant_guest_save');
        if (guestData) {
          setMigrationSuccessBanner(true);
        }
        return { success: true };
      } else if (data.user) {
        // User created, confirmation email might be pending
        return {
          success: true,
          message: 'Account created! If email confirmation is enabled in your project, please check your inbox to activate your account.'
        };
      }

      return { success: false, error: 'Failed to create account.' };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const resetPassword = async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured yet.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) {
        return { success: false, error: formatAuthError(error) };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem('my_3d_restaurant_guest_active');
    setDisplayName('Guest Chef');
  };

  const updateDisplayName = async (newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return { success: false, error: 'Name cannot be empty' };

    setDisplayName(cleanName);
    localStorage.setItem('supermart_guest_name', cleanName);

    const supabase = getSupabaseClient();
    if (supabase && user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: cleanName },
        });
        if (error) {
          return { success: false, error: formatAuthError(error) };
        }
      } catch (err) {
        return { success: false, error: formatAuthError(err) };
      }
    }
    return { success: true };
  };

  const clearMigrationBanner = () => {
    setMigrationSuccessBanner(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isGuest,
        displayName,
        userEmail: user?.email || (isGuest ? 'guest@local.offline' : ''),
        loading,
        isConfigured,
        migrationSuccessBanner,
        clearMigrationBanner,
        playAsGuest,
        continueAsGuest: playAsGuest,
        login,
        signUp,
        resetPassword,
        logout,
        updateDisplayName,
        checkConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
