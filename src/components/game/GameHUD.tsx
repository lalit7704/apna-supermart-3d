import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { sound } from '../../utils/audio';
import {
  Coins,
  Sparkles,
  Star,
  Clock,
  DoorOpen,
  DoorClosed,
  Monitor,
  Target,
  Award,
  Gift,
  Camera,
  Volume2,
  VolumeX,
  Save,
  Package,
  Trash2,
  HelpCircle,
  Smartphone,
  Menu,
  X,
  Zap,
  User,
} from 'lucide-react';

interface GameHUDProps {
  onOpenComputer: () => void;
  onOpenMissions: () => void;
  onOpenAchievements: () => void;
  onOpenDailyRewards: () => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
  onTriggerMobileInteract: () => void;
  interactionPrompt: string | null;
  onJoystickMove: (delta: { x: number; y: number }) => void;
  mobileIsRunning?: boolean;
  onToggleRun?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  onOpenComputer,
  onOpenMissions,
  onOpenAchievements,
  onOpenDailyRewards,
  onOpenHelp,
  onOpenProfile,
  onTriggerMobileInteract,
  interactionPrompt,
  onJoystickMove,
  mobileIsRunning = false,
  onToggleRun,
}) => {
  const { displayName } = useAuth();
  const {
    money,
    storeLevel,
    storeXp,
    maxXpForCurrentLevel,
    cleanliness,
    storeRating,
    currentDay,
    dayTimeSeconds,
    isStoreOpen,
    openSupermarket,
    closeSupermarket,
    cameraMode,
    setCameraMode,
    carriedBox,
    dropCarriedBox,
    saveGame,
    saveStatus,
    isDeliveryIncoming,
    avatarId,
    storeName,
  } = useGame();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);
  const [isTouchControlsVisible, setIsTouchControlsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024;
  });

  // Joystick state
  const [joystickTouchId, setJoystickTouchId] = useState<number | null>(null);
  const [joystickKnobPos, setJoystickKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Format Clock seconds to 12-hour AM/PM time
  const formatTime = (totalSecs: number) => {
    const hours24 = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    const padMin = minutes.toString().padStart(2, '0');
    return `${hours12}:${padMin} ${period}`;
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const toggleCamera = () => {
    sound.playClick();
    setCameraMode(cameraMode === 'first_person' ? 'third_person' : 'first_person');
  };

  const isMouseDownOnJoystick = useRef(false);

  const updateJoystickFromCoords = (clientX: number, clientY: number, targetElem: HTMLElement) => {
    const rect = targetElem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxDist = 48;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    setJoystickKnobPos({ x: dx, y: dy });
    onJoystickMove({ x: dx / maxDist, y: dy / maxDist });
  };

  // Virtual Joystick touch and mouse listeners
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchId !== null) return;
    const touch = e.changedTouches[0];
    setJoystickTouchId(touch.identifier);
    updateJoystickFromCoords(touch.clientX, touch.clientY, e.currentTarget);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId) {
        updateJoystickFromCoords(touch.clientX, touch.clientY, e.currentTarget);
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    setJoystickTouchId(null);
    setJoystickKnobPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isMouseDownOnJoystick.current = true;
    updateJoystickFromCoords(e.clientX, e.clientY, e.currentTarget);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownOnJoystick.current) return;
    updateJoystickFromCoords(e.clientX, e.clientY, e.currentTarget);
  };

  const handleMouseUp = () => {
    if (!isMouseDownOnJoystick.current) return;
    isMouseDownOnJoystick.current = false;
    setJoystickKnobPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  };

  const handleDirectionPress = (dir: 'up' | 'down' | 'left' | 'right') => {
    const maxOffset = 36;
    if (dir === 'up') {
      setJoystickKnobPos({ x: 0, y: -maxOffset });
      onJoystickMove({ x: 0, y: -1 }); // Forward
    } else if (dir === 'down') {
      setJoystickKnobPos({ x: 0, y: maxOffset });
      onJoystickMove({ x: 0, y: 1 }); // Backward
    } else if (dir === 'left') {
      setJoystickKnobPos({ x: -maxOffset, y: 0 });
      onJoystickMove({ x: -1, y: 0 }); // Left
    } else if (dir === 'right') {
      setJoystickKnobPos({ x: maxOffset, y: 0 });
      onJoystickMove({ x: 1, y: 0 }); // Right
    }
  };

  const handleDirectionRelease = () => {
    isMouseDownOnJoystick.current = false;
    setJoystickKnobPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  };

  // Determine dynamic action label for mobile button
  const getActionInfo = () => {
    if (!interactionPrompt) return { label: 'ACTION', icon: '⚡', isHot: false };
    const p = interactionPrompt.toLowerCase();
    if (p.includes('organize')) return { label: 'ORGANIZE', icon: '🏷️', isHot: true };
    if (p.includes('restock')) return { label: 'RESTOCK', icon: '📦', isHot: true };
    if (p.includes('checkout') || p.includes('cash register') || p.includes('register')) {
      return { label: 'BILLING', icon: '🧾', isHot: true };
    }
    if (p.includes('pc') || p.includes('computer') || p.includes('order')) {
      return { label: 'STORE PC', icon: '💻', isHot: true };
    }
    if (p.includes('pick up') || p.includes('box')) {
      return { label: 'PICK BOX', icon: '📦', isHot: true };
    }
    if (p.includes('sweep') || p.includes('clean')) {
      return { label: 'CLEAN', icon: '🧹', isHot: true };
    }
    return { label: 'USE [E]', icon: '⚡', isHot: true };
  };

  const actionInfo = getActionInfo();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 select-none z-10 font-sans">
      {/* Top Main Navigation Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 pointer-events-auto">
        {/* Left: Financial & Store Info */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl shadow-xl">
          {/* Manager Profile Chip */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            title="Open Store Manager Profile & Career Stats"
            className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-2.5 border-r border-slate-700 hover:bg-slate-800/80 px-1.5 py-0.5 rounded-xl transition group text-left"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">
              {avatarId || '👔'}
            </div>
            <div className="hidden min-[480px]:block">
              <span className="text-[8px] sm:text-[9px] text-emerald-400 uppercase font-black tracking-wider block leading-none">
                Manager
              </span>
              <span className="text-xs sm:text-sm font-black text-white truncate max-w-[80px] sm:max-w-[110px] block leading-tight group-hover:text-emerald-300">
                {displayName}
              </span>
            </div>
          </button>

          {/* Money Display */}
          <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-slate-700">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-wider block leading-none">
                Cash
              </span>
              <span className="text-sm sm:text-base md:text-lg font-black font-mono text-emerald-400 leading-none">
                ₹{money.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Level & XP */}
          <div className="flex flex-col min-w-[75px] sm:min-w-[100px] pr-2 sm:pr-3 border-r border-slate-700">
            <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-slate-300 mb-0.5 sm:mb-1">
              <span>Lvl {storeLevel}</span>
              <span className="text-emerald-400 font-mono">
                {Math.round((storeXp / maxXpForCurrentLevel) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (storeXp / maxXpForCurrentLevel) * 100)}%` }}
              />
            </div>
          </div>

          {/* Cleanliness */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-base">✨</span>
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-wider block leading-none">
                Clean
              </span>
              <span
                className={`text-[11px] sm:text-xs md:text-sm font-bold font-mono ${
                  cleanliness >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {cleanliness}%
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clock & Open/Close Store Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-200">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <div className="text-center">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold block leading-none">
                Day {currentDay}
              </span>
              <span className="text-[11px] sm:text-xs md:text-sm font-bold font-mono text-white leading-tight">
                {formatTime(dayTimeSeconds)}
              </span>
            </div>
          </div>

          {isStoreOpen ? (
            <button
              onClick={closeSupermarket}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-rose-600/90 hover:bg-rose-500 active:scale-95 text-white text-[11px] sm:text-xs font-bold rounded-xl transition shadow"
            >
              <DoorClosed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Close Store</span>
            </button>
          ) : (
            <button
              onClick={openSupermarket}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] sm:text-xs font-bold rounded-xl transition shadow animate-pulse"
            >
              <DoorOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>OPEN STORE</span>
            </button>
          )}
        </div>

        {/* Right: Quick Tools Buttons (Desktop Bar / Mobile Drawer Toggle) */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 p-1 sm:p-1.5 rounded-2xl shadow-xl">
          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setShowMobileDrawer((prev) => !prev)}
            title="Menu & Controls"
            className="p-1.5 sm:hidden hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-xl transition"
          >
            {showMobileDrawer ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Desktop/Tablet Quick Buttons */}
          <div className="hidden sm:flex items-center gap-1 md:gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                onOpenProfile();
              }}
              title="Store Manager Profile & Stats"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-xl transition relative group"
            >
              <User className="w-4 h-4" />
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
                Profile
              </span>
            </button>

            <button
              onClick={onOpenComputer}
              title="Open Store PC"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-xl transition"
            >
              <Monitor className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenMissions}
              title="Daily Missions"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-xl transition"
            >
              <Target className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAchievements}
              title="Achievements"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-purple-400 rounded-xl transition"
            >
              <Award className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenDailyRewards}
              title="7-Day Rewards"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-xl transition"
            >
              <Gift className="w-4 h-4" />
            </button>

            <button
              onClick={toggleCamera}
              title={`Switch Camera (${cameraMode === 'first_person' ? '1st Person' : '3rd Person'})`}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-blue-400 rounded-xl transition"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsTouchControlsVisible((v) => !v)}
              title={isTouchControlsVisible ? 'Hide Mobile Touch Controls' : 'Show Mobile Touch Controls'}
              className={`p-2 hover:bg-slate-800 rounded-xl transition ${
                isTouchControlsVisible ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSound}
              title="Audio Mute/Unmute"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={saveGame}
              title="Save Game"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-xl transition"
            >
              <Save className={`w-4 h-4 ${saveStatus === 'saving' ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={onOpenHelp}
              title="Controls & How to Play"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Expandable menu on phone) */}
      {showMobileDrawer && (
        <div className="sm:hidden absolute top-14 right-2 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-3 rounded-2xl shadow-2xl pointer-events-auto flex flex-col gap-2 min-w-[170px] animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              onOpenProfile();
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl bg-emerald-950/30 border border-emerald-500/30"
          >
            <span className="text-base">{avatarId || '👔'}</span>
            <div className="text-left">
              <span className="block text-white font-extrabold truncate max-w-[100px]">{displayName}</span>
              <span className="text-[10px] text-emerald-400 font-medium">My Profile</span>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenComputer();
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl"
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>Store PC</span>
          </button>

          <button
            onClick={() => {
              onOpenMissions();
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl"
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span>Daily Missions</span>
          </button>

          <button
            onClick={() => {
              onOpenAchievements();
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl"
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>Achievements</span>
          </button>

          <button
            onClick={() => {
              onOpenDailyRewards();
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Daily Rewards</span>
          </button>

          <button
            onClick={() => {
              toggleCamera();
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl"
          >
            <Camera className="w-4 h-4 text-blue-400" />
            <span>Cam: {cameraMode === 'first_person' ? '1st Person' : '3rd Person'}</span>
          </button>

          <button
            onClick={() => {
              setIsTouchControlsVisible((v) => !v);
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Touch Controls: {isTouchControlsVisible ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              toggleSound();
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>Sound: {isMuted ? 'Muted' : 'Enabled'}</span>
          </button>

          <button
            onClick={() => {
              saveGame();
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Progress</span>
          </button>

          <button
            onClick={() => {
              onOpenHelp();
              setShowMobileDrawer(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-xl border-t border-slate-800"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How to Play / Help</span>
          </button>
        </div>
      )}

      {/* Center Reticle & Context Interaction Tooltip */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-1.5 h-1.5 bg-white/80 rounded-full shadow border border-black/40" />

        {/* Dynamic Context Prompt */}
        {interactionPrompt && (
          <div className="absolute top-[52%] bg-slate-900/90 border border-emerald-500/60 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-2xl flex items-center gap-2 animate-in zoom-in-95 pointer-events-auto">
            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-white tracking-wide text-center">
              {interactionPrompt}
            </span>
          </div>
        )}

        {isDeliveryIncoming && (
          <div className="absolute top-[18%] bg-blue-950/85 border border-blue-500/50 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-2xl text-blue-200 text-xs font-bold animate-pulse">
            🚚 Delivery truck arriving with stock!
          </div>
        )}
      </div>

      {/* Bottom Bar: Carried Box Notification (Desktop / Mobile) */}
      <div className="w-full flex items-end justify-between pointer-events-none pb-1">
        {/* Carried Box HUD Badge */}
        <div className="pointer-events-auto">
          {carriedBox ? (
            <div className="bg-slate-900/90 backdrop-blur-md border border-amber-500/50 p-2.5 sm:p-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow"
                style={{ backgroundColor: carriedBox.color || '#d97706' }}
              >
                📦
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase tracking-wider block leading-none">
                  Carrying Box
                </span>
                <p className="text-xs sm:text-sm font-bold text-white leading-tight">{carriedBox.productName}</p>
                <span className="text-[10px] sm:text-xs text-slate-300 font-mono">
                  {carriedBox.quantity} units remaining
                </span>
              </div>
              <button
                onClick={dropCarriedBox}
                title="Drop Box [Q]"
                className="ml-1 sm:ml-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] sm:text-xs font-bold rounded-xl border border-slate-700 transition"
              >
                Drop [Q]
              </button>
            </div>
          ) : (
            <div className="hidden md:block text-slate-400 text-xs bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-800">
              WASD: Move • Shift: Run • E: Interact • Q: Drop • Mouse/Swipe: Look
            </div>
          )}
        </div>
      </div>

      {/* DUAL-ZONE MOBILE TOUCH CONTROLS (Active on mobile or when toggled on) */}
      {isTouchControlsVisible && (
        <div className="fixed inset-x-0 bottom-0 pointer-events-none z-30 flex items-end justify-between p-4 sm:p-6 select-none">
          {/* LEFT THUMB: Virtual Analog Joystick with Direct Arrow Buttons */}
          <div className="pointer-events-auto relative">
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/60 border-2 border-emerald-500/40 backdrop-blur-md flex items-center justify-center relative touch-none shadow-2xl cursor-grab active:cursor-grabbing"
            >
              {/* Clickable / Tappable Directional Arrow Guides */}
              <div className="absolute inset-0 flex flex-col items-center justify-between py-1 text-xs font-black text-emerald-400">
                <button
                  type="button"
                  onPointerDown={(e) => { e.stopPropagation(); handleDirectionPress('up'); }}
                  onPointerUp={handleDirectionRelease}
                  onPointerLeave={handleDirectionRelease}
                  className="w-8 h-7 flex items-center justify-center rounded-lg bg-slate-900/50 hover:bg-emerald-600/40 active:bg-emerald-500 text-emerald-300 transition"
                  title="Forward (Up Arrow / W)"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => { e.stopPropagation(); handleDirectionPress('down'); }}
                  onPointerUp={handleDirectionRelease}
                  onPointerLeave={handleDirectionRelease}
                  className="w-8 h-7 flex items-center justify-center rounded-lg bg-slate-900/50 hover:bg-emerald-600/40 active:bg-emerald-500 text-emerald-300 transition"
                  title="Backward (Down Arrow / S)"
                >
                  ▼
                </button>
              </div>
              <div className="absolute inset-0 flex items-center justify-between px-1 text-xs font-black text-emerald-400">
                <button
                  type="button"
                  onPointerDown={(e) => { e.stopPropagation(); handleDirectionPress('left'); }}
                  onPointerUp={handleDirectionRelease}
                  onPointerLeave={handleDirectionRelease}
                  className="w-7 h-8 flex items-center justify-center rounded-lg bg-slate-900/50 hover:bg-emerald-600/40 active:bg-emerald-500 text-emerald-300 transition"
                  title="Left (Left Arrow / A)"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => { e.stopPropagation(); handleDirectionPress('right'); }}
                  onPointerUp={handleDirectionRelease}
                  onPointerLeave={handleDirectionRelease}
                  className="w-7 h-8 flex items-center justify-center rounded-lg bg-slate-900/50 hover:bg-emerald-600/40 active:bg-emerald-500 text-emerald-300 transition"
                  title="Right (Right Arrow / D)"
                >
                  ▶
                </button>
              </div>

              {/* Central Thumb Knob */}
              <div
                className="w-12 h-12 rounded-full bg-emerald-500 border-2 border-emerald-300 shadow-lg absolute flex items-center justify-center transition-transform duration-75 text-emerald-950 font-black text-xs pointer-events-none"
                style={{
                  transform: `translate(${joystickKnobPos.x}px, ${joystickKnobPos.y}px)`,
                }}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-200/80" />
              </div>
            </div>
            <div className="text-center text-[10px] font-bold text-slate-400/80 mt-1 uppercase tracking-wider">
              Move
            </div>
          </div>

          {/* RIGHT THUMB: Action Buttons Cluster */}
          <div className="pointer-events-auto flex flex-col items-end gap-2.5">
            {/* Upper row: Sprint, Drop, Cam shortcuts */}
            <div className="flex items-center gap-2">
              {/* Quick PC Order Button */}
              <button
                onClick={onOpenComputer}
                title="Store PC"
                className="w-11 h-11 rounded-2xl bg-slate-900/90 active:bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs shadow-lg flex flex-col items-center justify-center transition active:scale-95"
              >
                <Monitor className="w-4 h-4" />
                <span className="text-[8px]">PC</span>
              </button>

              {/* Cam Mode Toggle (1P / 3P) */}
              <button
                onClick={toggleCamera}
                title="Switch Camera View"
                className="w-11 h-11 rounded-2xl bg-slate-900/90 active:bg-slate-800 border border-slate-700 text-blue-400 font-bold text-xs shadow-lg flex flex-col items-center justify-center transition active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span className="text-[8px]">{cameraMode === 'first_person' ? '1P' : '3P'}</span>
              </button>

              {/* Sprint / Run Toggle */}
              <button
                onClick={onToggleRun}
                className={`w-11 h-11 rounded-2xl border font-black text-xs shadow-lg flex flex-col items-center justify-center transition active:scale-95 ${
                  mobileIsRunning
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/50'
                    : 'bg-slate-900/90 border-slate-700 text-slate-300'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="text-[8px]">{mobileIsRunning ? 'RUN' : 'WALK'}</span>
              </button>

              {/* Drop Box Button (Visible when carrying box) */}
              {carriedBox && (
                <button
                  onClick={dropCarriedBox}
                  className="w-11 h-11 rounded-2xl bg-amber-600 active:bg-amber-500 border border-amber-400 text-white font-black text-xs shadow-lg flex flex-col items-center justify-center transition active:scale-95 animate-in zoom-in-90"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[8px]">DROP</span>
                </button>
              )}
            </div>

            {/* Main Primary Action Button */}
            <button
              onClick={onTriggerMobileInteract}
              className={`w-20 h-20 rounded-3xl font-black text-xs shadow-2xl flex flex-col items-center justify-center border-2 transition-transform active:scale-95 ${
                actionInfo.isHot
                  ? 'bg-emerald-600 active:bg-emerald-500 border-emerald-300 text-white shadow-emerald-500/50 animate-pulse'
                  : 'bg-slate-900/90 active:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <span className="text-xl mb-0.5">{actionInfo.icon}</span>
              <span className="text-[10px] leading-tight font-extrabold text-center px-1">
                {actionInfo.label}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
