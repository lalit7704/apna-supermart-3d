import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getSupabaseCredentials,
  saveCustomSupabaseCredentials,
  clearCustomSupabaseCredentials,
  SUPABASE_SQL_SCHEMA,
} from '../../lib/supabase';
import {
  X,
  Database,
  Key,
  Globe,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const { checkConfig } = useAuth();
  const currentCreds = getSupabaseCredentials();

  const [urlInput, setUrlInput] = useState(currentCreds.url || '');
  const [keyInput, setKeyInput] = useState(currentCreds.anonKey || '');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    sound.playClick();
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) return;

    saveCustomSupabaseCredentials(urlInput.trim(), keyInput.trim());
    checkConfig();
    setSaveSuccess(true);
    sound.playCashRegister();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToEnv = () => {
    clearCustomSupabaseCredentials();
    checkConfig();
    const creds = getSupabaseCredentials();
    setUrlInput(creds.url);
    setKeyInput(creds.anonKey);
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-['Fredoka'] tracking-tight flex items-center gap-2">
                <span>Supabase Cloud Integration</span>
                {currentCreds.isConfigured ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/50">
                    Connected ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/50">
                    Setup Required
                  </span>
                )}
              </h2>
              <p className="text-emerald-100/80 text-xs">
                Row Level Security (RLS) & Cloud Game Save Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / Sections */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Connection Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              currentCreds.isConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {currentCreds.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <span className="font-extrabold text-sm block">
                {currentCreds.isConfigured
                  ? 'Supabase is Live & Connected'
                  : 'Supabase Credentials Not Yet Configured'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {currentCreds.isConfigured
                  ? 'Your 3D restaurant is currently saving progression automatically to your Supabase PostgreSQL table with active Row Level Security.'
                  : 'You can test the game in Guest Mode right now. To enable cloud saves and Supabase Auth, add your project credentials below or set the environment variables in .env.'}
              </p>
            </div>
          </div>

          {/* Form: Enter Supabase Credentials */}
          <form onSubmit={handleSaveCredentials} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Project Credentials</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Project URL (VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Anon / Public Key (VITE_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Security note: Only provide your public <code>anon</code> key. Never paste your <code>service_role</code> key into the frontend.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                {saveSuccess ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{saveSuccess ? 'Saved!' : 'Save & Connect'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToEnv}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl font-medium transition-all"
              >
                Reset to .env Defaults
              </button>
            </div>
          </form>

          {/* SQL Schema & RLS Setup Section (Section 41) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-600" />
                <span>Supabase SQL Schema & RLS Policies</span>
              </h3>
              <button
                onClick={handleCopySchema}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition-all active:scale-95"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <div className="relative bg-slate-900 text-slate-200 rounded-2xl p-3.5 font-mono text-[11px] overflow-x-auto max-h-44 border border-slate-800">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
            <p className="text-[11px] text-slate-500">
              Run this in your <strong>Supabase Dashboard &gt; SQL Editor</strong> to create the <code>game_profiles</code> table with RLS policies ensuring each user can only access their own restaurant data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
