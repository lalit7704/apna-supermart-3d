import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { X, Calendar, Gift, CheckCircle2, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

interface DailyRewardsModalProps {
  onClose: () => void;
}

const REWARDS = [
  { day: 1, reward: '₹5,000 Starter Cash', amount: 5000, icon: '💵' },
  { day: 2, reward: 'Free Grocery Stock Box', amount: 3000, icon: '📦' },
  { day: 3, reward: '₹10,000 Cash Bonus', amount: 10000, icon: '💰' },
  { day: 4, reward: 'Staff Efficiency Boost', amount: 4000, icon: '⚡' },
  { day: 5, reward: '₹15,000 Store Fund', amount: 15000, icon: '💎' },
  { day: 6, reward: 'Storage Expansion Pack', amount: 8000, icon: '🏪' },
  { day: 7, reward: '₹25,000 Tycoon Jackpot', amount: 25000, icon: '🏆' },
];

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({ onClose }) => {
  const { currentDay } = useGame();
  const [claimedDays, setClaimedDays] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('claimed_daily_rewards');
    return saved ? new Set(JSON.parse(saved)) : new Set([1]);
  });

  const handleClaim = (dayNum: number, amount: number) => {
    if (claimedDays.has(dayNum)) return;

    sound.playCashRegister();
    const updated = new Set(claimedDays).add(dayNum);
    setClaimedDays(updated);
    localStorage.setItem('claimed_daily_rewards', JSON.stringify(Array.from(updated)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">7-Day Manager Rewards</h2>
              <p className="text-xs text-slate-400">Log in daily to claim bonuses and cash gifts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7 Days Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {REWARDS.map((rew) => {
            const isClaimed = claimedDays.has(rew.day);
            const isCurrent = currentDay >= rew.day && !isClaimed;

            return (
              <div
                key={rew.day}
                className={`border rounded-2xl p-4 flex flex-col items-center text-center justify-between transition ${
                  isClaimed
                    ? 'bg-slate-800/40 border-slate-700/60 opacity-60'
                    : isCurrent
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-900/20'
                    : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="w-full text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Day {rew.day}
                </div>

                <div className="text-3xl my-2">{rew.icon}</div>
                <p className="text-xs font-bold text-white mb-3">{rew.reward}</p>

                {isClaimed ? (
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                  </span>
                ) : isCurrent ? (
                  <button
                    onClick={() => handleClaim(rew.day, rew.amount)}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition"
                  >
                    Claim!
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 font-semibold">Locked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
