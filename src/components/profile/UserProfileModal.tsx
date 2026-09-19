import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import {
  X,
  User as UserIcon,
  Mail,
  Edit2,
  Check,
  LogOut,
  Sparkles,
  Trophy,
  Users,
  Coins,
  Star,
  Calendar,
  Cloud,
  LogIn,
  Loader2,
  Store,
  ShieldCheck,
  Save,
  CheckCircle2,
  Building2,
  Layers,
  Award,
  Target,
  Sparkle,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthForUpgrade?: () => void;
}

const AVATAR_OPTIONS = [
  { id: '👔', label: 'Store Manager' },
  { id: '🛒', label: 'Retail Pro' },
  { id: '👑', label: 'Supermarket Tycoon' },
  { id: '🧢', label: 'Quick Mart Boss' },
  { id: '👓', label: 'Smart Merchant' },
  { id: '🌟', label: 'Star Grocer' },
  { id: '🚀', label: 'Express Chief' },
  { id: '🥑', label: 'Fresh Organics' },
  { id: '💼', label: 'Retail Director' },
  { id: '🎯', label: 'Master Trader' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAuthForUpgrade,
}) => {
  const { user, isGuest, displayName, userEmail, logout, updateDisplayName } = useAuth();
  const {
    storeLevel,
    storeXp,
    maxXpForCurrentLevel,
    money,
    storeRating,
    cleanliness,
    currentDay,
    saveStatus,
    saveGame,
    storeName,
    setStoreName,
    avatarId,
    setAvatarId,
    shelfSlots,
    employees,
    expansionLevel,
    missions,
    achievements,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'cloud'>('profile');

  // Manager Name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(displayName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Store Name state
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [editedStoreName, setEditedStoreName] = useState(storeName || 'SuperMart 3D');

  // Manual save feedback
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  if (!isOpen) return null;

  // Compute title based on store level
  const getManagerTitle = (level: number) => {
    if (level <= 1) return 'Trainee Store Associate';
    if (level === 2) return 'Aisle & Inventory Lead';
    if (level === 3) return 'Assistant Store Manager';
    if (level === 4) return 'Senior General Manager';
    return 'Supermarket Retail Tycoon';
  };

  const handleLogout = async () => {
    sound.playClick();
    await logout();
    onClose();
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setNameError('Manager name cannot be empty.');
      return;
    }
    setIsSavingName(true);
    setNameError(null);
    sound.playClick();

    const res = await updateDisplayName(editedName.trim());
    setIsSavingName(false);

    if (res.success) {
      setIsEditingName(false);
      sound.playClick();
    } else {
      setNameError(res.error || 'Failed to update name');
    }
  };

  const handleSaveStoreName = () => {
    if (!editedStoreName.trim()) return;
    setStoreName(editedStoreName.trim());
    setIsEditingStore(false);
    sound.playClick();
  };

  const handleManualSave = async () => {
    sound.playClick();
    await saveGame();
    setSaveSuccessNotice(true);
    sound.playCashRegister();
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const hiredEmployeesCount = employees.filter((e) => e.hired).length;
  const completedMissionsCount = missions.filter((m) => m.claimed).length;
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/90 overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shadow"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Manager Avatar Display */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0">
              {avatarId || '👔'}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 border-2 border-slate-900 shadow">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-2.5 py-1 text-sm rounded-lg bg-slate-800 text-white border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 font-bold w-full"
                      placeholder="Enter Manager Name"
                      maxLength={24}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                      title="Save Name"
                    >
                      {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(displayName);
                      }}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                      {displayName}
                    </h2>
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setEditedName(displayName);
                      }}
                      title="Edit Manager Name"
                      className="p-1 hover:bg-slate-700 rounded-md transition text-slate-400 hover:text-emerald-400"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Store Name */}
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-xs font-extrabold text-emerald-400">
                  {getManagerTitle(storeLevel)}
                </span>
                <span className="text-[11px] text-slate-400">•</span>
                <span className="text-xs text-slate-300 font-semibold truncate flex items-center gap-1">
                  <Store className="w-3 h-3 text-amber-400" />
                  {storeName || 'SuperMart 3D'}
                </span>
              </div>

              {nameError && <p className="text-rose-400 text-[10px] font-bold mt-1">{nameError}</p>}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-700/80 bg-slate-850 px-3 pt-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('profile');
            }}
            className={`flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider rounded-t-xl transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile & Identity</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('stats');
            }}
            className={`flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider rounded-t-xl transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'stats'
                ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Career Stats</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('cloud');
            }}
            className={`flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider rounded-t-xl transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud & Sync</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Avatar Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Manager Avatar
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => {
                        sound.playClick();
                        setAvatarId(av.id);
                      }}
                      className={`p-2 rounded-2xl flex flex-col items-center gap-1 border transition ${
                        avatarId === av.id
                          ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                      }`}
                      title={av.label}
                    >
                      <span className="text-2xl">{av.id}</span>
                      <span className="text-[9px] font-bold truncate max-w-full text-center">
                        {av.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Store Name Customization */}
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    <span>Store Name</span>
                  </div>
                  {!isEditingStore && (
                    <button
                      onClick={() => {
                        setIsEditingStore(true);
                        setEditedStoreName(storeName);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  )}
                </div>

                {isEditingStore ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={editedStoreName}
                      onChange={(e) => setEditedStoreName(e.target.value)}
                      className="px-3 py-1.5 text-sm rounded-xl bg-slate-850 text-white border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 font-bold flex-1"
                      placeholder="e.g. My SuperMart"
                      maxLength={30}
                    />
                    <button
                      onClick={handleSaveStoreName}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition"
                      title="Save Store Name"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingStore(false)}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-base font-black text-white">{storeName || 'SuperMart 3D'}</p>
                )}
              </div>

              {/* Level & XP Progression Card */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                        Store Level
                      </span>
                      <span className="text-base font-black text-white leading-tight">
                        Level {storeLevel}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                      XP to Next Level
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400 leading-tight">
                      {storeXp} / {maxXpForCurrentLevel} XP
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-750">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (storeXp / maxXpForCurrentLevel) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-right font-medium">
                  {Math.max(0, maxXpForCurrentLevel - storeXp)} XP needed to reach Level {storeLevel + 1}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Career Stats */}
          {activeTab === 'stats' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* Cash in Hand */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Store Capital</span>
                  </div>
                  <div className="text-lg font-black text-emerald-400 mt-1 font-mono">
                    ₹{money.toLocaleString()}
                  </div>
                </div>

                {/* Store Rating */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Store Rating</span>
                  </div>
                  <div className="text-lg font-black text-amber-400 mt-1">
                    {storeRating.toFixed(1)} / 5.0
                  </div>
                </div>

                {/* Cleanliness */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cleanliness</span>
                  </div>
                  <div
                    className={`text-lg font-black mt-1 font-mono ${
                      cleanliness >= 80 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {cleanliness}%
                  </div>
                </div>

                {/* Current Day */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Operating Day</span>
                  </div>
                  <div className="text-lg font-black text-white mt-1">
                    Day {currentDay}
                  </div>
                </div>

                {/* Shelves & Coolers */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Shelf Slots</span>
                  </div>
                  <div className="text-lg font-black text-white mt-1">
                    {shelfSlots.length} Units
                  </div>
                </div>

                {/* Hired Employees */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    <span>Hired Staff</span>
                  </div>
                  <div className="text-lg font-black text-white mt-1">
                    {hiredEmployeesCount} Staff
                  </div>
                </div>
              </div>

              {/* Expansion & Milestones */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Expansion & Milestones</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-750">
                    <span className="text-[10px] text-slate-400 block font-bold">Floor Expansion</span>
                    <span className="text-sm font-black text-white">Tier {expansionLevel}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-750">
                    <span className="text-[10px] text-slate-400 block font-bold">Missions Claimed</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {completedMissionsCount}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-750">
                    <span className="text-[10px] text-slate-400 block font-bold">Achievements</span>
                    <span className="text-sm font-black text-purple-400 font-mono">
                      {unlockedAchievementsCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Cloud & Account */}
          {activeTab === 'cloud' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Account Card */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                        Account Status
                      </span>
                      <span className="text-sm font-black text-white leading-tight">
                        {user ? 'Registered Manager' : isGuest ? 'Guest Session' : 'Not Signed In'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      !user
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {user ? 'Supabase Cloud' : 'Local Cache'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex items-center gap-2 pt-1 border-t border-slate-700/60">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{userEmail || 'guest@local.offline'}</span>
                </div>

                {!user && onOpenAuthForUpgrade && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuthForUpgrade();
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                    >
                      {isGuest ? <Cloud className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                      <span>{isGuest ? 'Link to Supabase Cloud Account' : 'Login / Create Account'}</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-1.5">
                      {isGuest
                        ? 'Save your supermarket progress permanently and access it from any browser.'
                        : 'Login to sync your supermarket progress across browsers.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Manual Cloud Save */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-white block">Manual Store Save</span>
                    <span className="text-[11px] text-slate-400">
                      Sync current inventory, cash, and shelves immediately.
                    </span>
                  </div>
                  <button
                    onClick={handleManualSave}
                    disabled={saveStatus === 'saving'}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
                  >
                    <Save className={`w-3.5 h-3.5 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
                    <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Now'}</span>
                  </button>
                </div>

                {saveSuccessNotice && (
                  <div className="flex items-center gap-2 p-2 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-bold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Supermarket data saved successfully!</span>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              {(user || isGuest) && (
                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 px-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-800/50 transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>{isGuest ? 'RESET GUEST SESSION' : 'LOGOUT ACCOUNT'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info ribbon */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>SuperMart 3D • Store Engine v2.4</span>
          <span className="font-bold text-emerald-400">Auto-Save Enabled</span>
        </div>
      </div>
    </div>
  );
};
