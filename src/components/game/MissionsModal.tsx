import React from 'react';
import { useGame } from '../../context/GameContext';
import { X, Target, CheckCircle2, Gift, Sparkles, Coins } from 'lucide-react';
import { sound } from '../../utils/audio';

interface MissionsModalProps {
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ onClose }) => {
  const { missions, claimMissionReward } = useGame();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Daily Missions</h2>
              <p className="text-xs text-slate-400">Complete tasks to earn cash and bonus XP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {missions.map((mission) => {
            const progressPct = Math.min(100, Math.round((mission.current / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{mission.title}</h4>
                    <p className="text-xs text-slate-400">{mission.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-full">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+₹{mission.rewardCoins}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>Progress</span>
                    <span className="font-mono text-slate-200">
                      {mission.current} / {mission.target}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                {mission.claimed ? (
                  <div className="w-full py-2 text-center text-xs font-bold text-slate-400 bg-slate-900/60 rounded-xl">
                    Reward Claimed ✅
                  </div>
                ) : mission.completed ? (
                  <button
                    onClick={() => claimMissionReward(mission.id)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Gift className="w-4 h-4" />
                    Claim Reward (₹{mission.rewardCoins} + {mission.rewardXp} XP)
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-xs font-bold text-slate-500 bg-slate-900/40 rounded-xl">
                    In Progress ({progressPct}%)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
