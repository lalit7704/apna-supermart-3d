import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PRODUCT_CATALOG, ProductCategory, ProductDefinition } from '../../data/products';
import { sound } from '../../utils/audio';
import {
  X,
  Monitor,
  ShoppingBag,
  Tag,
  Users,
  Building2,
  TrendingUp,
  Truck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';

interface ComputerOrderModalProps {
  onClose: () => void;
  initialTab?: 'supplier' | 'pricing' | 'staff' | 'expansion';
  focusProductId?: string;
}

export const ComputerOrderModal: React.FC<ComputerOrderModalProps> = ({
  onClose,
  initialTab = 'supplier',
  focusProductId,
}) => {
  const {
    money,
    storeLevel,
    inventoryPrices,
    inventoryStorage,
    employees,
    expansionLevel,
    orderWholesaleProducts,
    updateProductPrice,
    hireEmployee,
    fireEmployee,
    upgradeEmployee,
    purchaseStoreExpansion,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'supplier' | 'pricing' | 'staff' | 'expansion'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Supplier cart state: Record<productId, quantity>
  const [supplierCart, setSupplierCart] = useState<Record<string, number>>({});
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  const categories: { id: string; name: string }[] = [
    { id: 'all', name: 'All Categories' },
    { id: 'grocery', name: 'Groceries' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'drinks', name: 'Drinks' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'frozen', name: 'Frozen' },
    { id: 'household', name: 'Household' },
    { id: 'personal_care', name: 'Personal Care' },
  ];

  const filteredProducts = PRODUCT_CATALOG.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  // Cart operations
  const handleQuantityChange = (productId: string, delta: number) => {
    setSupplierCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
    sound.playClick();
  };

  const totalCartCost = Object.entries(supplierCart).reduce((sum, [pid, qty]) => {
    const prod = PRODUCT_CATALOG.find((p) => p.id === pid);
    return sum + (prod ? prod.purchasePrice * qty : 0);
  }, 0);

  const totalItemsCount = Object.values(supplierCart).reduce((sum, q) => sum + q, 0);

  const handlePlaceWholesaleOrder = () => {
    if (totalCartCost === 0 || money < totalCartCost) return;

    const items = Object.entries(supplierCart).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    const success = orderWholesaleProducts(items);
    if (success) {
      setSupplierCart({});
      setOrderSuccessMsg('Delivery Truck is arriving at the back storage bay!');
      setTimeout(() => setOrderSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl max-w-4xl w-full h-[94vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* SuperOS Header Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow shrink-0">
              <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white">SuperOS v3.2</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Manager Desktop
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400">Store Lvl {storeLevel} • Cash: ₹{money.toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-800/60 border-b border-slate-700 px-2 sm:px-6 flex gap-1.5 sm:gap-2 overflow-x-auto py-1">
          {[
            { id: 'supplier', label: 'Wholesale Supplier', icon: Truck },
            { id: 'pricing', label: 'Price Management', icon: Tag },
            { id: 'staff', label: 'Staff & Hiring', icon: Users },
            { id: 'expansion', label: 'Store Expansion', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  sound.playClick();
                }}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs md:text-sm transition whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-slate-800/80'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: WHOLESALE SUPPLIER */}
          {activeTab === 'supplier' && (
            <div className="space-y-6">
              {orderSuccessMsg && (
                <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-4 flex items-center gap-3 text-emerald-200 text-sm animate-in slide-in-from-top">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <span>{orderSuccessMsg}</span>
                </div>
              )}

              {/* Category Filter Chips */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Products Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const isLocked = product.unlockLevel > storeLevel;
                  const inCart = supplierCart[product.id] || 0;

                  return (
                    <div
                      key={product.id}
                      className={`relative bg-slate-800/60 border rounded-2xl p-4 flex flex-col justify-between transition ${
                        isLocked
                          ? 'border-slate-800 opacity-60'
                          : 'border-slate-700 hover:border-emerald-500/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl">{product.emoji}</span>
                            <div>
                              <h4 className="font-bold text-sm text-white leading-tight">{product.name}</h4>
                              <span className="text-[10px] text-slate-400 capitalize">{product.category}</span>
                            </div>
                          </div>
                          {isLocked && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                              Lvl {product.unlockLevel}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{product.description}</p>
                      </div>

                      <div className="border-t border-slate-700/60 pt-3">
                        <div className="flex justify-between items-center text-xs mb-3">
                          <div>
                            <span className="text-slate-400">Wholesale:</span>
                            <span className="ml-1 font-bold text-white">₹{product.purchasePrice}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Retail:</span>
                            <span className="ml-1 font-bold text-emerald-400">
                              ₹{inventoryPrices[product.id] || product.defaultPrice}
                            </span>
                          </div>
                        </div>

                        {isLocked ? (
                          <div className="w-full py-2 text-center text-xs text-slate-500 bg-slate-900/60 rounded-xl">
                            Requires Store Level {product.unlockLevel}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-slate-900/80 rounded-xl p-1 border border-slate-700">
                            <button
                              onClick={() => handleQuantityChange(product.id, -10)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-mono font-bold text-white px-2">
                              {inCart} box{inCart !== 1 ? 'es' : ''}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(product.id, 10)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PRICE MANAGEMENT */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-xs text-slate-300">
                💡 <span className="font-semibold text-white">Pricing Strategy Tip:</span> Customers are happy when prices are fair. If prices are set too high above wholesale cost, shoppers might complain and leave items on shelves.
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-slate-800 border-b border-slate-700 text-slate-400 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Wholesale Cost</th>
                      <th className="p-3">Current Retail Price</th>
                      <th className="p-3">Profit Margin</th>
                      <th className="p-3">Customer Sentiment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {PRODUCT_CATALOG.filter((p) => p.unlockLevel <= storeLevel).map((p) => {
                      const currentPrice = inventoryPrices[p.id] || p.defaultPrice;
                      const margin = Math.round(((currentPrice - p.purchasePrice) / p.purchasePrice) * 100);
                      const isTooHigh = margin > 80;

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 flex items-center gap-2 font-semibold text-white">
                            <span className="text-xl">{p.emoji}</span>
                            <span>{p.name}</span>
                          </td>
                          <td className="p-3 text-slate-300">₹{p.purchasePrice}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateProductPrice(p.id, currentPrice - 2)}
                                className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-200"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-emerald-400 text-sm w-12 text-center">
                                ₹{currentPrice}
                              </span>
                              <button
                                onClick={() => updateProductPrice(p.id, currentPrice + 2)}
                                className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-200"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-200">+{margin}%</td>
                          <td className="p-3">
                            {isTooHigh ? (
                              <span className="text-amber-400 font-semibold flex items-center gap-1">
                                ⚠️ High Price
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                ⭐ Fair & Popular
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STAFF & HIRING */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {employees.map((emp) => {
                  const isHired = emp.hired;
                  const hireCost = emp.role === 'cashier' ? 3000 : emp.role === 'stocker' ? 2500 : 1800;

                  return (
                    <div
                      key={emp.id}
                      className="bg-slate-800/60 border border-slate-700 rounded-3xl p-5 flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-700/80 flex items-center justify-center text-2xl">
                            {emp.role === 'cashier' ? '🧑‍💼' : emp.role === 'stocker' ? '👷' : '🧹'}
                          </div>
                          {isHired ? (
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                              Hired • Lvl {emp.level}
                            </span>
                          ) : (
                            <span className="text-xs bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-full">
                              Available
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white mb-1">{emp.name}</h4>
                        <p className="text-xs text-slate-400 mb-4">
                          {emp.role === 'cashier'
                            ? 'Automatically scans products and checks out waiting shoppers at the POS counter.'
                            : emp.role === 'stocker'
                            ? 'Carries delivery boxes from storage to automatically refill empty shelves.'
                            : 'Sweeps floor spills and picks up customer trash to maintain 100% cleanliness.'}
                        </p>

                        <div className="bg-slate-900/60 rounded-2xl p-3 space-y-1.5 text-xs mb-4">
                          <div className="flex justify-between text-slate-300">
                            <span>Daily Wage:</span>
                            <span className="font-bold text-amber-400">₹{emp.salary}/day</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Efficiency Speed:</span>
                            <span className="font-bold text-emerald-400">{emp.speed.toFixed(1)}x</span>
                          </div>
                        </div>
                      </div>

                      {isHired ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => upgradeEmployee(emp.id)}
                            disabled={money < 2000}
                            className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition"
                          >
                            Upgrade Speed (₹2k)
                          </button>
                          <button
                            onClick={() => fireEmployee(emp.id)}
                            className="py-2.5 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-xl text-xs border border-rose-500/30 transition"
                            title="End employee contract"
                          >
                            End Contract
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => hireEmployee(emp.id)}
                          disabled={money < hireCost}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                        >
                          Hire Employee (₹{hireCost})
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: STORE EXPANSION */}
          {activeTab === 'expansion' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    level: 2,
                    name: 'Supermarket Extension (+20m²)',
                    cost: 25000,
                    features: ['Adds 3 Extra Shelf Aisles', 'Cooler Display for Beverages', 'Accommodates up to 8 Shoppers'],
                  },
                  {
                    level: 3,
                    name: 'Superstore Expansion (+40m²)',
                    cost: 50000,
                    features: ['Deep Island Freezers', 'Double Storage Warehouse Bay', 'Accommodates up to 12 Shoppers'],
                  },
                  {
                    level: 4,
                    name: 'Hypermarket Empire (+80m²)',
                    cost: 100000,
                    features: ['Full Mega Supermarket Wing', 'Second Checkout Counter', 'Maximum Daily Customer Rush'],
                  },
                ].map((exp) => {
                  const isUnlocked = expansionLevel >= exp.level;
                  const canBuy = expansionLevel === exp.level - 1 && money >= exp.cost;

                  return (
                    <div
                      key={exp.level}
                      className="bg-slate-800/60 border border-slate-700 rounded-3xl p-5 flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Building2 className="w-8 h-8 text-emerald-400" />
                          {isUnlocked ? (
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                              Active
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-bold text-amber-400">
                              ₹{exp.cost.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white mb-2">{exp.name}</h4>
                        <ul className="space-y-1.5 text-xs text-slate-300 mb-6">
                          {exp.features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {isUnlocked ? (
                        <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                          Store Expanded ✅
                        </div>
                      ) : (
                        <button
                          onClick={() => purchaseStoreExpansion(exp.level)}
                          disabled={!canBuy}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition"
                        >
                          {expansionLevel < exp.level - 1 ? 'Unlock Previous First' : `Purchase Expansion (₹${exp.cost.toLocaleString()})`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Order Bar (Only shown on Wholesale Supplier tab) */}
        {activeTab === 'supplier' && (
          <div className="bg-slate-800 border-t border-slate-700 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Cart Total ({totalItemsCount} boxes selected)</p>
              <p className="text-xl font-extrabold text-emerald-400">₹{totalCartCost.toLocaleString()}</p>
            </div>

            <button
              onClick={handlePlaceWholesaleOrder}
              disabled={totalCartCost === 0 || money < totalCartCost}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg transition"
            >
              <Truck className="w-5 h-5" />
              Place Wholesale Order (₹{totalCartCost.toLocaleString()})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
