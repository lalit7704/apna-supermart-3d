import React, { useState } from 'react';
import { X, Package, DollarSign, Layers, Trash2, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { PRODUCT_CATALOG, ProductDefinition } from '../../data/products';
import { ShelfSlot } from '../../types/game';

interface ShelfOrganizeModalProps {
  shelfId: string | null;
  onClose: () => void;
}

export const ShelfOrganizeModal: React.FC<ShelfOrganizeModalProps> = ({ shelfId, onClose }) => {
  const {
    shelfSlots,
    assignShelfProduct,
    clearShelf,
    inventoryPrices,
    updateProductPrice,
    inventoryStorage,
    storeLevel,
  } = useGame();

  const currentShelf = shelfSlots.find((s) => s.id === shelfId);

  // Selected product to assign
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    currentShelf?.productId || null
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customPrice, setCustomPrice] = useState<number>(() => {
    if (currentShelf?.productId && inventoryPrices[currentShelf.productId]) {
      return inventoryPrices[currentShelf.productId];
    }
    return 50;
  });
  const [notification, setNotification] = useState<string | null>(null);

  if (!currentShelf) return null;

  const currentProductDef = PRODUCT_CATALOG.find((p) => p.id === currentShelf.productId);
  const selectedProductDef = PRODUCT_CATALOG.find((p) => p.id === selectedProductId);

  // Filter products by unlock level and category
  const availableProducts = PRODUCT_CATALOG.filter((p) => {
    const isUnlocked = p.unlockLevel <= storeLevel;
    if (!isUnlocked) return false;
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const handleSelectProduct = (product: ProductDefinition) => {
    setSelectedProductId(product.id);
    const existingPrice = inventoryPrices[product.id] || product.defaultPrice;
    setCustomPrice(existingPrice);
  };

  const handleApplyAssignment = () => {
    if (!selectedProductId) return;

    // Apply product assignment to this shelf
    assignShelfProduct(currentShelf.id, selectedProductId);

    // Save custom selling price
    if (customPrice > 0) {
      updateProductPrice(selectedProductId, customPrice);
    }

    setNotification('Product assigned to shelf successfully!');
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 600);
  };

  const handleClearShelf = () => {
    clearShelf(currentShelf.id);
    setSelectedProductId(null);
    setNotification('Shelf cleared! Products packed into storage box.');
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Shelf Organizer & Pricing
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                  {currentShelf.shelfName || currentShelf.id}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure assigned product, shelf capacity & retail profit margins
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-6 py-2.5 text-sm text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            {notification}
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Current Shelf Status Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Shelf Assignment
              </span>
              <div className="flex items-center gap-2 mt-1">
                {currentProductDef ? (
                  <>
                    <span className="text-2xl">{currentProductDef.emoji}</span>
                    <div>
                      <div className="font-semibold text-white">{currentProductDef.name}</div>
                      <div className="text-xs text-slate-400">
                        Brand: <span className="text-amber-400">{currentProductDef.brand}</span> | Category: {currentProductDef.category}
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-amber-400 font-medium">
                    Empty / Unassigned Shelf (No product displayed)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-400">Current Stock</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {currentShelf.currentStock} / {currentShelf.capacity} units
                </div>
              </div>

              {currentShelf.productId && (
                <button
                  onClick={handleClearShelf}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition"
                  title="Empty shelf and pack remaining stock into a delivery box"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Shelf
                </button>
              )}
            </div>
          </div>

          {/* Select Product Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-400" />
                Select Real Product to Assign to Shelf:
              </label>
              <div className="flex gap-1 overflow-x-auto pb-1 max-w-[60%] text-xs">
                {['all', 'grocery', 'snacks', 'drinks', 'dairy', 'frozen', 'household', 'personal_care'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2 py-1 rounded-md capitalize transition whitespace-nowrap ${
                        activeCategory === cat
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
              {availableProducts.map((p) => {
                const isSelected = selectedProductId === p.id;
                const inStorage = inventoryStorage[p.id] || 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProduct(p)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{p.name}</div>
                      <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
                        <span>Cost: ₹{p.purchasePrice}</span>
                        <span className="text-amber-400 font-medium">Rec: ₹{p.defaultPrice}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Warehouse Stock: {inStorage} units
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing & Profit Margin Configuration */}
          {selectedProductDef && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Retail Selling Price for {selectedProductDef.name}:
                </span>
                <span className="text-xs text-slate-400">
                  Wholesale Cost: ₹{selectedProductDef.purchasePrice}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={selectedProductDef.purchasePrice}
                    max={selectedProductDef.purchasePrice * 4}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-8 pr-4 font-mono font-bold text-lg text-emerald-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Profit Margin</div>
                  <div
                    className={`text-sm font-bold font-mono ${
                      customPrice >= selectedProductDef.purchasePrice
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    +₹{customPrice - selectedProductDef.purchasePrice} / unit (
                    {Math.round(
                      ((customPrice - selectedProductDef.purchasePrice) /
                        selectedProductDef.purchasePrice) *
                        100
                    )}
                    %)
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomPrice(selectedProductDef.defaultPrice)}
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 transition"
                >
                  Reset Recommended (₹{selectedProductDef.defaultPrice})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomPrice(Math.round(selectedProductDef.purchasePrice * 1.25))
                  }
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 transition"
                >
                  Standard 25% Margin
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomPrice(Math.round(selectedProductDef.purchasePrice * 1.4))
                  }
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 transition"
                >
                  Premium 40% Margin
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-800/80">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyAssignment}
            disabled={!selectedProductId}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-4 h-4" />
            Apply to Shelf
          </button>
        </div>
      </div>
    </div>
  );
};
