import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PRODUCT_CATALOG } from '../../data/products';
import { sound } from '../../utils/audio';
import { X, Barcode, CreditCard, Banknote, CheckCircle2, User, Sparkles } from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  targetCustomerId?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, targetCustomerId }) => {
  const { customers, inventoryPrices, processCustomerCheckout } = useGame();

  // Pick the customer who is waiting at checkout, or the specified one
  const activeCustomer =
    customers.find((c) => (targetCustomerId ? c.id === targetCustomerId : c.state === 'waiting_for_scan')) ||
    customers.find((c) => c.state === 'walking_to_checkout');

  const [scannedItemIds, setScannedItemIds] = useState<Set<number>>(new Set());
  const [cashGivenInput, setCashGivenInput] = useState<number>(0);
  const [isProcessingCard, setIsProcessingCard] = useState<boolean>(false);
  const [checkoutComplete, setCheckoutComplete] = useState<boolean>(false);
  const [changeReturned, setChangeReturned] = useState<number>(0);

  if (!activeCustomer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl text-white">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🛒
          </div>
          <h3 className="text-xl font-bold mb-2">No Customer at Register</h3>
          <p className="text-slate-400 text-sm mb-6">
            There are currently no customers waiting at the checkout counter. Keep the store open and restock shelves to attract shoppers!
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl transition"
          >
            Back to Supermarket
          </button>
        </div>
      </div>
    );
  }

  // Items picked by customer
  const pickedItems = activeCustomer.shoppingList.filter((it) => it.picked);
  const allScanned = pickedItems.length === 0 || scannedItemIds.size === pickedItems.length;

  const totalBill = pickedItems.reduce((sum, it) => {
    const unitPrice = inventoryPrices[it.productId] || 40;
    return sum + unitPrice * it.quantity;
  }, 0);

  const customerCashOffered = activeCustomer.cashOffered || (totalBill <= 100 ? 100 : Math.ceil(totalBill / 100) * 100);

  const handleScanItem = (index: number) => {
    if (scannedItemIds.has(index)) return;
    sound.playBarcodeBeep();
    setScannedItemIds((prev) => new Set(prev).add(index));
  };

  const handleScanAll = () => {
    pickedItems.forEach((_, idx) => {
      setTimeout(() => {
        sound.playBarcodeBeep();
        setScannedItemIds((prev) => new Set(prev).add(idx));
      }, idx * 140);
    });
  };

  const handleCashCheckout = (exactReturn: boolean = true) => {
    const cashReceived = customerCashOffered;
    const change = exactReturn ? cashReceived - totalBill : Math.max(0, cashGivenInput - totalBill);

    const result = processCustomerCheckout(activeCustomer.id, 'cash', cashReceived);
    if (result.success) {
      setChangeReturned(result.change);
      setCheckoutComplete(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleCardCheckout = () => {
    setIsProcessingCard(true);
    sound.playClick();
    setTimeout(() => {
      setIsProcessingCard(false);
      const result = processCustomerCheckout(activeCustomer.id, 'card');
      if (result.success) {
        setCheckoutComplete(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="bg-slate-800/80 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                POS Checkout Register #1
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                  Live Scanner
                </span>
              </h2>
              <p className="text-xs text-slate-400">Scan customer items and collect payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/60 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Conveyor Belt & Items */}
          <div className="flex flex-col bg-slate-800/50 border border-slate-700/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <User className="w-4 h-4 text-emerald-400" />
                <span>{activeCustomer.name}</span>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                {pickedItems.length} items
              </span>
            </div>

            {/* Conveyor Belt List */}
            <div className="flex-1 max-h-56 overflow-y-auto space-y-2 pr-1">
              {pickedItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Customer cart is empty
                </div>
              ) : (
                pickedItems.map((item, idx) => {
                  const pDef = PRODUCT_CATALOG.find((p) => p.id === item.productId);
                  const isScanned = scannedItemIds.has(idx);
                  const unitPrice = inventoryPrices[item.productId] || 40;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleScanItem(idx)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                        isScanned
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{pDef?.emoji || '📦'}</span>
                        <div>
                          <p className="text-sm font-semibold leading-tight">{pDef?.name || item.productId}</p>
                          <p className="text-xs text-slate-400">
                            Qty: {item.quantity} × ₹{unitPrice}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">₹{unitPrice * item.quantity}</span>
                        {isScanned ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScanItem(idx);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition"
                          >
                            Scan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {!allScanned && (
              <button
                onClick={handleScanAll}
                className="mt-3 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Barcode className="w-4 h-4 text-emerald-400" />
                Quick Scan All Items
              </button>
            )}
          </div>

          {/* Right Column: Bill Total & Payment Terminal */}
          <div className="flex flex-col justify-between bg-slate-800/50 border border-slate-700/80 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Order Summary
              </h3>

              <div className="space-y-1.5 text-sm mb-4">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({pickedItems.length} items):</span>
                  <span className="font-semibold text-slate-200">₹{totalBill}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Store GST & Tax:</span>
                  <span className="font-semibold text-slate-200">₹0</span>
                </div>
                <div className="h-px bg-slate-700 my-2" />
                <div className="flex justify-between text-base font-extrabold text-emerald-400">
                  <span>TOTAL BILL:</span>
                  <span className="text-xl">₹{totalBill}</span>
                </div>
              </div>

              {checkoutComplete ? (
                <div className="bg-emerald-900/40 border border-emerald-500 rounded-xl p-4 text-center animate-in zoom-in-95">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white text-base">Payment Complete!</h4>
                  <p className="text-emerald-300 text-xs">
                    {changeReturned > 0 ? `Change Returned: ₹${changeReturned}` : 'Exact Payment Received'}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">Receipt Printed. Customer leaving.</p>
                </div>
              ) : !allScanned ? (
                <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-4 text-center text-amber-200 text-xs">
                  Please scan all items on the conveyor belt before collecting payment.
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Customer Payment Method:
                  </p>

                  {activeCustomer.paymentMethod === 'cash' ? (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <Banknote className="w-4 h-4" /> Customer Hands:
                        </span>
                        <span className="font-mono text-base font-bold text-white">
                          ₹{customerCashOffered}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3 text-slate-300">
                        <span>Change to return:</span>
                        <span className="font-mono text-sm font-bold text-emerald-400">
                          ₹{customerCashOffered - totalBill}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCashCheckout(true)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition"
                      >
                        <Banknote className="w-4 h-4" />
                        Accept Cash & Return Change
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs text-blue-400 font-bold mb-2">
                        <CreditCard className="w-4 h-4" /> Card Terminal POS
                      </div>

                      {isProcessingCard ? (
                        <div className="py-4 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mb-2" />
                          <p className="text-xs text-blue-300">Contacting Bank... Processing Chip</p>
                        </div>
                      ) : (
                        <button
                          onClick={handleCardCheckout}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition"
                        >
                          <CreditCard className="w-4 h-4" />
                          Swipe / Tap Customer Card (₹{totalBill})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
