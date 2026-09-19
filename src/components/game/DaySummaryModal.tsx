import React from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/audio';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Star,
  ArrowRight,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const DaySummaryModal: React.FC = () => {
  const {
    currentDay,
    dailyReport,
    advanceToNextDay,
    storeLevel,
    storeXp,
    maxXpForCurrentLevel,
  } = useGame();

  if (!dailyReport) return null;

  const isProfitable = dailyReport.netProfit >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-6 text-center relative">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Receipt className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            Day {dailyReport.day} Financial Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">SuperMart 3D Daily Performance Summary</p>
        </div>

        {/* Financial Breakdown Table */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2.5 text-xs md:text-sm">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Gross Sales Revenue:
              </span>
              <span className="font-mono font-bold text-emerald-400 text-base">
                +₹{dailyReport.revenue.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Wholesale Stock Cost:</span>
              <span className="font-mono font-semibold text-rose-400">
                -₹{dailyReport.stockExpenses.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Staff Wages:</span>
              <span className="font-mono font-semibold text-rose-400">
                -₹{dailyReport.wagesExpenses.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Store Rent & Utilities:</span>
              <span className="font-mono font-semibold text-rose-400">
                -₹{dailyReport.rentExpenses.toLocaleString()}
              </span>
            </div>

            <div className="h-px bg-slate-700 my-2" />

            <div className="flex justify-between items-center text-base font-extrabold">
              <span className="text-white">NET DAILY PROFIT:</span>
              <span
                className={`font-mono text-xl ${
                  isProfitable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isProfitable ? '+' : ''}₹{dailyReport.netProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Performance Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-black text-white">{dailyReport.customersServed}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Customers</p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3">
              <ShoppingBag className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-black text-white">{dailyReport.itemsSold}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Items Sold</p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3">
              <Star className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-black text-white">{dailyReport.averageSatisfaction}%</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Satisfaction</p>
            </div>
          </div>

          {/* Store Level Progress */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3">
            <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
              <span>Store Level {storeLevel}</span>
              <span className="text-emerald-400 font-mono">
                {storeXp} / {maxXpForCurrentLevel} XP
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (storeXp / maxXpForCurrentLevel) * 100)}%` }}
              />
            </div>
          </div>

          {/* Advance Button */}
          <button
            onClick={advanceToNextDay}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition text-sm"
          >
            <span>Start Day {currentDay + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
