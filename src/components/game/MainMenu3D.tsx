import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';
import { Play, User, LogIn, HelpCircle, Settings, ShoppingCart, Sparkles, Store } from 'lucide-react';

interface MainMenu3DProps {
  onStartGame: () => void;
  onOpenAuth: () => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
}

export const MainMenu3D: React.FC<MainMenu3DProps> = ({
  onStartGame,
  onOpenAuth,
  onOpenHelp,
  onOpenProfile,
}) => {
  const { user, isGuest, continueAsGuest, displayName } = useAuth();
  const { avatarId, storeName, storeLevel } = useGame();

  const handlePlay = () => {
    sound.playClick();
    onStartGame();
  };

  const handleGuestPlay = () => {
    continueAsGuest();
    sound.playClick();
    onStartGame();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="max-w-md w-full text-center flex flex-col items-center">
        {/* Brand Logo & Title */}
        <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400/40 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/20 mb-4 animate-bounce">
          🏪
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-1">
          {storeName || 'SuperMart 3D'}
        </h1>
        <p className="text-emerald-400 font-bold tracking-widest text-xs uppercase mb-6">
          Original Supermarket Simulator
        </p>

        <p className="text-slate-300 text-xs md:text-sm max-w-sm mb-6 leading-relaxed">
          Order wholesale stock, carry boxes, restock shelves, set prices, serve customers at the POS counter, hire staff, and build a retail empire!
        </p>

        {/* Manager Profile Chip Bar */}
        <div className="w-full mb-5 p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl shrink-0">
              {avatarId || '👔'}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block leading-none">
                Manager Lvl {storeLevel}
              </span>
              <span className="text-xs font-black text-white block leading-tight">
                {displayName}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-600/80 transition flex items-center gap-1.5 shadow"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Profile</span>
          </button>
        </div>

        {/* Menu Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={handlePlay}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-base rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/50 border border-emerald-400/40 transition"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY NOW</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-750 active:scale-[0.98] text-slate-200 hover:text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Manager Profile & Store Settings</span>
          </button>

          {!user && (
            <button
              onClick={handleGuestPlay}
              className="w-full py-3 bg-slate-850 hover:bg-slate-800 active:scale-[0.98] text-slate-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-700/60 transition"
            >
              <User className="w-4 h-4" />
              <span>Continue as Guest</span>
            </button>
          )}

          {!user && (
            <button
              onClick={onOpenAuth}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-800 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Sync with Supabase</span>
            </button>
          )}

          <button
            onClick={onOpenHelp}
            className="w-full py-2.5 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to Play & Controls</span>
          </button>
        </div>

        {user && (
          <div className="mt-5 text-xs text-slate-400">
            Logged in as <span className="text-emerald-400 font-semibold">{user.email || 'Store Owner'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
