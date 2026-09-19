import React from 'react';
import { X, Keyboard, MousePointer, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-wide">How to Play & Controls</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs md:text-sm">
          {/* Controls Section */}
          <div>
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> Mobile Controls (फोन / मोबाइल पर कैसे खेलें)
            </h3>
            <div className="space-y-2 bg-slate-800/60 border border-emerald-500/30 rounded-xl p-3 text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">🕹️ Left Thumb Stick:</span>
                <span>Drag to walk forward, backward, and strafe left/right.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">👆 Right Screen Swipe:</span>
                <span>Swipe anywhere on the right screen to rotate camera, aim & look around.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">⚡ Big Action Button:</span>
                <span>Restock shelves, pick up boxes, open checkout register, or sweep spills when near.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">📦 Drop Button:</span>
                <span>Tap the orange DROP button to set down a carried box.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">🏃 SPRINT Button:</span>
                <span>Toggle between Walk and Sprint Run.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">👁️ 1P / 3P View:</span>
                <span>Tap the camera button to switch between 1st Person and 3rd Person camera.</span>
              </div>
            </div>
          </div>

          {/* Desktop Controls */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4" /> Desktop Keyboard & Mouse
            </h3>
            <div className="grid grid-cols-2 gap-2 bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-slate-300">
              <div><span className="font-bold text-white">W / A / S / D</span> : Walk</div>
              <div><span className="font-bold text-white">Shift</span> : Sprint Run</div>
              <div><span className="font-bold text-white">Mouse Look</span> : Rotate Camera</div>
              <div><span className="font-bold text-white">E / Space</span> : Interact / Restock</div>
              <div><span className="font-bold text-white">Q</span> : Drop Carried Box</div>
              <div><span className="font-bold text-white">V</span> : Switch 1st/3rd Person</div>
            </div>
          </div>

          {/* Gameplay Loop */}
          <div>
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Core Gameplay Loop
            </h3>
            <div className="space-y-2 bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-slate-300">
              <p>1. <span className="font-bold text-white">Order Stock</span>: Use the Manager PC desk to buy products wholesale. A delivery truck drops boxes in your storage bay.</p>
              <p>2. <span className="font-bold text-white">Carry & Restock</span>: Approach a delivery box, press <span className="text-emerald-400 font-bold">[E]</span> to pick it up, walk to the shelf, and press <span className="text-emerald-400 font-bold">[E]</span> to fill the shelf.</p>
              <p>3. <span className="font-bold text-white">Set Prices</span>: Manage prices from your computer or walk up to shelves. Set fair profit margins.</p>
              <p>4. <span className="font-bold text-white">Open Supermarket</span>: Click [OPEN STORE]. Customers enter, pick products, and line up at checkout.</p>
              <p>5. <span className="font-bold text-white">Operate Checkout</span>: Walk up to the POS counter, scan barcodes, collect cash/card payment, and return change.</p>
              <p>6. <span className="font-bold text-white">Hire Staff & Expand</span>: Hire Cashiers, Stockers, and Cleaners. Buy building expansions to grow into a hypermarket!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
