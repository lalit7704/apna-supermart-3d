import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GameSaveData, RestaurantSaveData } from '../types/game';

// Environment variable retrieval (supports both Vite and Next.js conventions)
export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = '';
  let anonKey = '';

  // 1. Check Vite env variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    url = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '') as string;
    anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '') as string;
  }

  // 2. Check localStorage override for development / testing convenience
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('supabase_custom_url');
    const customKey = localStorage.getItem('supabase_custom_anon_key');
    if (customUrl && customKey) {
      url = customUrl;
      anonKey = customKey;
    }
  }

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    anonKey.length > 10 &&
    !url.includes('your-project')
  );

  return { url, anonKey, isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfiguredUrl = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance || currentConfiguredUrl !== url) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      });
      currentConfiguredUrl = url;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function saveCustomSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('supabase_custom_url', url.trim());
    localStorage.setItem('supabase_custom_anon_key', anonKey.trim());
    supabaseInstance = null; // force re-init
  }
}

export function clearCustomSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase_custom_url');
    localStorage.removeItem('supabase_custom_anon_key');
    supabaseInstance = null;
  }
}

/**
 * Friendly error translator adhering to requirement 39:
 * Wrong password: "Incorrect email or password."
 * Email already registered: "An account with this email already exists."
 * Weak password: "Password must meet the minimum security requirements."
 * Network problem: "Unable to connect. Please check your internet connection."
 */
export function formatAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const message = (typeof error === 'object' && error !== null && 'message' in error)
    ? String((error as { message: string }).message).toLowerCase()
    : String(error).toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('invalid credentials') || message.includes('wrong password') || message.includes('email not confirmed')) {
    return 'Incorrect email or password.';
  }
  if (message.includes('user already registered') || message.includes('already exists') || message.includes('unique constraint')) {
    return 'An account with this email already exists.';
  }
  if (message.includes('password should be') || message.includes('weak password') || message.includes('at least 6')) {
    return 'Password must meet the minimum security requirements (at least 6 characters).';
  }
  if (message.includes('network') || message.includes('failed to fetch') || message.includes('connection') || !navigator.onLine) {
    return 'Unable to connect. Please check your internet connection.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a few moments and try again.';
  }

  return 'Could not process request. Please check your details and try again.';
}

/**
 * Fetch user game profile from Supabase
 */
export async function fetchUserGameProfile(userId: string): Promise<GameSaveData | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('game_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching game profile:', error.message);
      return null;
    }

    if (!data) return null;

    if (data.save_data) {
      return data.save_data as GameSaveData;
    }

    return null;
  } catch (err) {
    console.warn('Network error fetching profile:', err);
    return null;
  }
}

/**
 * Save user game profile to Supabase with upsert
 */
export async function saveUserGameProfile(profile: GameSaveData): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const payload = {
      user_id: profile.user_id,
      display_name: profile.display_name,
      save_data: profile,
      last_saved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('game_profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.warn('Error saving to game_profiles:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const msg = formatAuthError(err);
    return { success: false, error: msg };
  }
}

/**
 * Complete Supabase SQL Schema for easy 1-click copy paste into Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- =========================================================
-- MY 3D RESTAURANT: GAME PROFILES & ROW LEVEL SECURITY (RLS)
-- Run this in your Supabase SQL Editor (supabase.com/dashboard)
-- =========================================================

create table if not exists public.game_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text default 'Chef' not null,
  coins bigint default 250 not null,
  level integer default 1 not null,
  xp bigint default 0 not null,
  rating numeric(3, 2) default 5.00 not null,
  customers_served integer default 0 not null,
  current_day integer default 1 not null,
  restaurant_upgrades jsonb default '{"kitchen_level": 1, "patience_level": 1, "capacity_level": 1, "walking_speed_level": 1, "decoration_level": 1}'::jsonb not null,
  unlocked_foods text[] default array['burger', 'fries'] not null,
  kitchen_level integer default 1 not null,
  patience_level integer default 1 not null,
  capacity_level integer default 1 not null,
  walking_speed_level integer default 1 not null,
  decoration_level integer default 1 not null,
  last_saved_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.game_profiles enable row level security;

-- Policy 1: Users can read only their own game profile
create policy "Users can read own game profile"
  on public.game_profiles
  for select
  using (auth.uid() = user_id);

-- Policy 2: Users can insert their own game profile
create policy "Users can insert own game profile"
  on public.game_profiles
  for insert
  with check (auth.uid() = user_id);

-- Policy 3: Users can update their own game profile
create policy "Users can update own game profile"
  on public.game_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: Auto-update updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_game_profile_updated
  before update on public.game_profiles
  for each row execute procedure public.handle_updated_at();
`;
