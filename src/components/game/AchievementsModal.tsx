import React from 'react';
import { useGame } from '../../context/GameContext';
import { X, Award, CheckCircle2 } from 'lucide-react';

interface AchievementsModalProps {
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const { achievements } = useGame();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Store Achievements</h2>
              <p className="text-xs text-slate-400">Milestones of your supermarket career</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievements List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {achievements.map((ach) => {
            const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`border rounded-2xl p-4 flex items-center justify-between transition ${
                  ach.unlocked
                    ? 'bg-purple-950/20 border-purple-500/40'
                    : 'bg-slate-800/50 border-slate-700/80 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">{ach.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      {ach.title}
                      {ach.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-purple-400 inline" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">{ach.description}</p>
                    <div className="mt-2 w-36 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-semibold text-slate-300">
                    {ach.progress.toLocaleString()} / {ach.maxProgress.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
