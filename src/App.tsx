import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider, useGame } from './context/GameContext';
import { Supermarket3DScene } from './components/game/Supermarket3DScene';
import { GameHUD } from './components/game/GameHUD';
import { CheckoutModal } from './components/game/CheckoutModal';
import { ComputerOrderModal } from './components/game/ComputerOrderModal';
import { DaySummaryModal } from './components/game/DaySummaryModal';
import { MissionsModal } from './components/game/MissionsModal';
import { AchievementsModal } from './components/game/AchievementsModal';
import { DailyRewardsModal } from './components/game/DailyRewardsModal';
import { HelpModal } from './components/game/HelpModal';
import { ShelfOrganizeModal } from './components/game/ShelfOrganizeModal';
import { MainMenu3D } from './components/game/MainMenu3D';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { SupabaseSetupModal } from './components/setup/SupabaseSetupModal';
import { CheckCircle2, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isGuest, loading, migrationSuccessBanner, clearMigrationBanner } = useAuth();
  const { showDaySummary } = useGame();

  // Screen State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Modals
  const [showComputerModal, setShowComputerModal] = useState<boolean>(false);
  const [computerTab, setComputerTab] = useState<'supplier' | 'pricing' | 'staff' | 'expansion'>('supplier');
  const [focusProductId, setFocusProductId] = useState<string | undefined>(undefined);

  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutCustomerId, setCheckoutCustomerId] = useState<string | undefined>(undefined);

  const [showShelfOrganizeModal, setShowShelfOrganizeModal] = useState<boolean>(false);
  const [organizingShelfId, setOrganizingShelfId] = useState<string | null>(null);

  const [showMissionsModal, setShowMissionsModal] = useState<boolean>(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [showDailyRewardsModal, setShowDailyRewardsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

  // Crosshair Interaction & Mobile Controls
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [mobileJoystickDelta, setMobileJoystickDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mobileIsRunning, setMobileIsRunning] = useState<boolean>(false);
  const [isInteractingTrigger, setIsInteractingTrigger] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-3xl animate-bounce mb-4 shadow-2xl">
          🏪
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">SuperMart 3D Simulator</h1>
        <p className="text-xs text-emerald-400 font-semibold mt-1">Booting Supermarket Engine & 3D Assets...</p>
      </div>
    );
  }

  // Handle open computer modal
  const handleOpenComputer = (tab: 'supplier' | 'pricing' | 'staff' | 'expansion' = 'supplier', prodId?: string) => {
    setComputerTab(tab);
    setFocusProductId(prodId);
    setShowComputerModal(true);
  };

  // Handle open checkout modal
  const handleOpenCheckout = (customerId?: string) => {
    setCheckoutCustomerId(customerId);
    setShowCheckoutModal(true);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-slate-950 select-none font-sans">
      {/* Cloud Migration Success Banner */}
      {migrationSuccessBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>Your SuperMart progress has been saved to your account!</span>
          </div>
          <button
            onClick={clearMigrationBanner}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3D Supermarket Scene (Always active in background) */}
      <main className="w-full h-full relative overflow-hidden">
        <Supermarket3DScene
          onOpenComputer={() => handleOpenComputer('supplier')}
          onOpenCheckout={(cust) => handleOpenCheckout(cust)}
          onOpenPriceManager={(prod) => handleOpenComputer('pricing', prod)}
          onOpenShelfOrganize={(shelfId) => {
            setOrganizingShelfId(shelfId);
            setShowShelfOrganizeModal(true);
          }}
          interactionPrompt={interactionPrompt}
          setInteractionPrompt={setInteractionPrompt}
          mobileJoystickDelta={mobileJoystickDelta}
          mobileIsRunning={mobileIsRunning}
          isInteractingTrigger={isInteractingTrigger}
          onInteractionHandled={() => setIsInteractingTrigger(false)}
        />
      </main>

      {/* Main Menu (Shown before clicking Play) */}
      {!isPlaying && (
        <MainMenu3D
          onStartGame={() => setIsPlaying(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      )}

      {/* Game HUD Overlay (Active while playing) */}
      {isPlaying && (
        <GameHUD
          onOpenComputer={() => handleOpenComputer('supplier')}
          onOpenMissions={() => setShowMissionsModal(true)}
          onOpenAchievements={() => setShowAchievementsModal(true)}
          onOpenDailyRewards={() => setShowDailyRewardsModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenProfile={() => setShowProfileModal(true)}
          onTriggerMobileInteract={() => setIsInteractingTrigger(true)}
          interactionPrompt={interactionPrompt}
          onJoystickMove={setMobileJoystickDelta}
          mobileIsRunning={mobileIsRunning}
          onToggleRun={() => setMobileIsRunning((r) => !r)}
        />
      )}

      {/* Shelf Organizer & Pricing Modal */}
      {showShelfOrganizeModal && (
        <ShelfOrganizeModal
          shelfId={organizingShelfId}
          onClose={() => setShowShelfOrganizeModal(false)}
        />
      )}

      {/* Interactive POS Checkout Register Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          onClose={() => setShowCheckoutModal(false)}
          targetCustomerId={checkoutCustomerId}
        />
      )}

      {/* Manager Computer OS Modal */}
      {showComputerModal && (
        <ComputerOrderModal
          onClose={() => setShowComputerModal(false)}
          initialTab={computerTab}
          focusProductId={focusProductId}
        />
      )}

      {/* End-of-Day Financial Summary Report */}
      {showDaySummary && <DaySummaryModal />}

      {/* Missions & Achievements Modals */}
      {showMissionsModal && <MissionsModal onClose={() => setShowMissionsModal(false)} />}
      {showAchievementsModal && <AchievementsModal onClose={() => setShowAchievementsModal(false)} />}
      {showDailyRewardsModal && <DailyRewardsModal onClose={() => setShowDailyRewardsModal(false)} />}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}

      {/* Supabase Authentication & Profile Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onOpenSetup={() => setShowSetupModal(true)}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onOpenAuthForUpgrade={() => setShowAuthModal(true)}
      />

      <SupabaseSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <MainAppContent />
      </GameProvider>
    </AuthProvider>
  );
}
