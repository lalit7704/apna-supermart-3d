import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  CarriedBox,
  ShelfSlot,
  DeliveryBox,
  TrashItem,
  CustomerData,
  CustomerItemGoal,
  EmployeeData,
  DailyReport,
  Mission,
  Achievement,
  StoreExpansion,
  GameSaveData,
  SaveStatus,
  CameraMode,
} from '../types/game';
import { PRODUCT_CATALOG, ProductDefinition } from '../data/products';
import { sound } from '../utils/audio';
import { useAuth } from './AuthContext';
import { saveUserGameProfile, fetchUserGameProfile } from '../lib/supabase';

interface GameContextType {
  money: number;
  storeLevel: number;
  storeXp: number;
  maxXpForCurrentLevel: number;
  cleanliness: number;
  storeRating: number;
  currentDay: number;
  dayTimeSeconds: number; // 8:00 AM (28800) to 10:00 PM (79200)
  isStoreOpen: boolean;
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;

  inventoryPrices: Record<string, number>;
  inventoryStorage: Record<string, number>;
  shelfSlots: ShelfSlot[];
  checkoutPosition: { x: number; z: number };
  carriedBox: CarriedBox | null;
  deliveryBoxes: DeliveryBox[];
  trashItems: TrashItem[];
  customers: CustomerData[];
  employees: EmployeeData[];
  expansionLevel: number;
  missions: Mission[];
  achievements: Achievement[];
  dailyReport: DailyReport | null;
  showDaySummary: boolean;
  saveStatus: SaveStatus;
  isDeliveryIncoming: boolean;

  // Profile & Identity
  storeName: string;
  setStoreName: (name: string) => void;
  avatarId: string;
  setAvatarId: (avatar: string) => void;

  // Actions
  openSupermarket: () => void;
  closeSupermarket: () => void;
  advanceToNextDay: () => void;
  orderWholesaleProducts: (items: { productId: string; quantity: number }[]) => boolean;
  pickupDeliveryBox: (boxId: string) => boolean;
  dropCarriedBox: () => void;
  restockShelfWithCarriedBox: (shelfId: string) => boolean;
  cleanTrashItem: (trashId: string) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  processCustomerCheckout: (customerId: string, paymentMethod: 'cash' | 'card', cashReceived?: number) => { success: boolean; change: number };
  assignShelfProduct: (shelfId: string, productId: string | null) => void;
  clearShelf: (shelfId: string) => void;
  moveShelf: (shelfId: string, deltaX: number, deltaZ: number) => void;
  moveEmployee: (employeeId: string, deltaX: number, deltaZ: number) => void;
  moveCheckout: (deltaX: number, deltaZ: number) => void;
  hireEmployee: (empId: string) => boolean;
  fireEmployee: (empId: string) => void;
  upgradeEmployee: (empId: string) => boolean;
  purchaseStoreExpansion: (level: number) => boolean;
  claimMissionReward: (missionId: string) => void;
  saveGame: () => Promise<void>;
  resetGame: () => void;
  closeDaySummaryModal: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Initial Shelves layout in Supermarket - Stocked with starter goods so shoppers can immediately browse and buy!
const INITIAL_SHELVES: ShelfSlot[] = [
  // Aisle 1 (Grocery Staples)
  { id: 'shelf_g1', shelfName: 'Aisle 1 - Bay 1', category: 'grocery', productId: 'india_gate_rice', x: -4.5, z: -2.5, rotationY: 0, capacity: 14, currentStock: 8, level: 1, modelType: 'gondola' },
  { id: 'shelf_g2', shelfName: 'Aisle 1 - Bay 2', category: 'grocery', productId: null, x: -4.5, z: -0.5, rotationY: 0, capacity: 14, currentStock: 0, level: 1, modelType: 'gondola' },
  { id: 'shelf_g3', shelfName: 'Aisle 1 - Bay 3', category: 'grocery', productId: null, x: -4.5, z: 1.5, rotationY: 0, capacity: 14, currentStock: 0, level: 1, modelType: 'gondola' },
  { id: 'shelf_g4', shelfName: 'Aisle 1 - Bay 4', category: 'grocery', productId: null, x: -4.5, z: 3.5, rotationY: 0, capacity: 16, currentStock: 0, level: 1, modelType: 'gondola' },

  // Aisle 2 (Snacks)
  { id: 'shelf_s1', shelfName: 'Aisle 2 - Bay 1', category: 'snacks', productId: 'lays_magic_masala', x: -1.5, z: -2.5, rotationY: 0, capacity: 16, currentStock: 10, level: 1, modelType: 'gondola' },
  { id: 'shelf_s2', shelfName: 'Aisle 2 - Bay 2', category: 'snacks', productId: null, x: -1.5, z: -0.5, rotationY: 0, capacity: 16, currentStock: 0, level: 1, modelType: 'gondola' },
  { id: 'shelf_s3', shelfName: 'Aisle 2 - Bay 3', category: 'snacks', productId: null, x: -1.5, z: 1.5, rotationY: 0, capacity: 20, currentStock: 0, level: 1, modelType: 'gondola' },

  // Aisle 3 (Drinks & Household)
  { id: 'shelf_d1', shelfName: 'Aisle 3 - Bay 1', category: 'drinks', productId: 'coca_cola_can', x: 2.0, z: -2.5, rotationY: 0, capacity: 16, currentStock: 10, level: 1, modelType: 'gondola' },
  { id: 'shelf_d2', shelfName: 'Aisle 3 - Bay 2', category: 'drinks', productId: null, x: 2.0, z: -0.5, rotationY: 0, capacity: 16, currentStock: 0, level: 1, modelType: 'gondola' },
  { id: 'shelf_h1', shelfName: 'Aisle 3 - Bay 3', category: 'household', productId: null, x: 2.0, z: 1.5, rotationY: 0, capacity: 14, currentStock: 0, level: 1, modelType: 'gondola' },

  // Wall Dairy Coolers & Freezers
  { id: 'cooler_dairy', shelfName: 'Chiller Fridge', category: 'dairy', productId: null, x: 5.5, z: -2.5, rotationY: -Math.PI / 2, capacity: 14, currentStock: 0, level: 1, modelType: 'cooler' },
  { id: 'freezer_frozen', shelfName: 'Deep Freezer', category: 'frozen', productId: null, x: 5.5, z: 1.0, rotationY: -Math.PI / 2, capacity: 12, currentStock: 0, level: 1, modelType: 'freezer' },
];

const INITIAL_EMPLOYEES: EmployeeData[] = [
  { id: 'emp_cashier', name: 'Aarav (Cashier)', role: 'cashier', salary: 600, hired: false, level: 1, speed: 1.0 },
  { id: 'emp_stocker', name: 'Rohan (Stocker)', role: 'stocker', salary: 500, hired: false, level: 1, speed: 1.0 },
  { id: 'emp_cleaner', name: 'Sunil (Cleaner)', role: 'cleaner', salary: 400, hired: false, level: 1, speed: 1.0 },
];

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'First Steps', description: 'Restock shelves with 15 products', target: 15, current: 0, rewardCoins: 1500, rewardXp: 150, completed: false, claimed: false },
  { id: 'm2', title: 'Happy Shoppers', description: 'Serve 10 customers at checkout', target: 10, current: 0, rewardCoins: 2500, rewardXp: 250, completed: false, claimed: false },
  { id: 'm3', title: 'Spotless Floor', description: 'Keep cleanliness above 90%', target: 1, current: 0, rewardCoins: 1000, rewardXp: 100, completed: false, claimed: false },
  { id: 'm4', title: 'Smart Supplier', description: 'Place a wholesale stock delivery order', target: 1, current: 0, rewardCoins: 1200, rewardXp: 120, completed: false, claimed: false },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_first_sale', title: 'First Sale', description: 'Complete your first customer checkout', icon: '🛒', unlocked: false, progress: 0, maxProgress: 1 },
  { id: 'ach_25_customers', title: 'Retail Buzz', description: 'Serve 25 satisfied customers', icon: '⭐', unlocked: false, progress: 0, maxProgress: 25 },
  { id: 'ach_restock_master', title: 'Shelf Master', description: 'Restock 50 items onto shelves', icon: '📦', unlocked: false, progress: 0, maxProgress: 50 },
  { id: 'ach_100k_earned', title: 'Supermarket Tycoon', description: 'Earn a total of ₹1,00,000 in revenue', icon: '💰', unlocked: false, progress: 0, maxProgress: 100000 },
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();

  // Core Game State (Starting Money: ₹50,000 as per Requirement 27)
  const [money, setMoney] = useState<number>(50000);
  const [storeLevel, setStoreLevel] = useState<number>(1);
  const [storeXp, setStoreXp] = useState<number>(0);
  const [cleanliness, setCleanliness] = useState<number>(100);
  const [storeRating, setStoreRating] = useState<number>(5.0);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [dayTimeSeconds, setDayTimeSeconds] = useState<number>(28800); // 8:00 AM (8 * 3600)
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<CameraMode>('first_person');

  // Store & Manager Profile Customization
  const [storeName, setStoreNameState] = useState<string>(() => {
    return localStorage.getItem('supermart_store_name') || 'SuperMart 3D';
  });
  const [avatarId, setAvatarIdState] = useState<string>(() => {
    return localStorage.getItem('supermart_avatar_id') || '👔';
  });

  const setStoreName = useCallback((name: string) => {
    const clean = name.trim() || 'SuperMart 3D';
    setStoreNameState(clean);
    localStorage.setItem('supermart_store_name', clean);
  }, []);

  const setAvatarId = useCallback((av: string) => {
    setAvatarIdState(av);
    localStorage.setItem('supermart_avatar_id', av);
  }, []);

  // Inventory & Pricing
  const [inventoryPrices, setInventoryPrices] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    PRODUCT_CATALOG.forEach((p) => {
      init[p.id] = p.defaultPrice;
    });
    return init;
  });

  const [inventoryStorage, setInventoryStorage] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    PRODUCT_CATALOG.forEach((p) => {
      init[p.id] = p.unlockLevel <= 1 ? 20 : 0; // Starting storage stock
    });
    return init;
  });

  const [shelfSlots, setShelfSlots] = useState<ShelfSlot[]>(INITIAL_SHELVES);
  const [checkoutPosition, setCheckoutPosition] = useState({ x: 0, z: 1.8 });
  const [carriedBox, setCarriedBox] = useState<CarriedBox | null>(null);

  // Delivery Boxes in storage room with real products ready to be organized
  const [deliveryBoxes, setDeliveryBoxes] = useState<DeliveryBox[]>([
    { id: 'dbox_init_1', productId: 'india_gate_rice', quantity: 10, x: -5.5, z: -5.0, deliveredAt: Date.now() },
    { id: 'dbox_init_2', productId: 'lays_magic_masala', quantity: 12, x: -4.5, z: -5.0, deliveredAt: Date.now() },
    { id: 'dbox_init_3', productId: 'coca_cola_can', quantity: 12, x: -3.5, z: -5.0, deliveredAt: Date.now() },
  ]);

  const [isDeliveryIncoming, setIsDeliveryIncoming] = useState<boolean>(false);

  // Trash & Cleanliness
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);

  // Customers & Employees
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>(INITIAL_EMPLOYEES);
  const [expansionLevel, setExpansionLevel] = useState<number>(1);

  // Missions & Achievements
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  // Daily report & End-of-day
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [showDaySummary, setShowDaySummary] = useState<boolean>(false);
  const dayStatsRef = useRef({
    revenue: 0,
    stockExpenses: 0,
    customersServed: 0,
    itemsSold: 0,
    satisfactionSum: 0,
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const hasHydratedSaveRef = useRef(false);

  // Max XP formula: Level 1 = 800, Level 2 = 1400, Level 3 = 2200...
  const maxXpForCurrentLevel = Math.round(800 * Math.pow(1.35, storeLevel - 1));

  // --- XP & Level Up Logic ---
  const addXp = useCallback((amount: number) => {
    setStoreXp((prevXp) => {
      let nextXp = prevXp + amount;
      let nextLevel = storeLevel;
      let threshold = Math.round(800 * Math.pow(1.35, nextLevel - 1));

      if (nextXp >= threshold) {
        nextXp -= threshold;
        setStoreLevel((lvl) => {
          const updatedLvl = lvl + 1;
          sound.playLevelUp();
          return updatedLvl;
        });
      }
      return nextXp;
    });
  }, [storeLevel]);

  // --- Track Missions & Achievements Progress ---
  const incrementMissionProgress = useCallback((missionId: string, amount: number = 1) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && !m.completed) {
          const nextVal = m.current + amount;
          return {
            ...m,
            current: nextVal,
            completed: nextVal >= m.target,
          };
        }
        return m;
      })
    );
  }, []);

  const incrementAchievementProgress = useCallback((achId: string, amount: number = 1) => {
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === achId && !a.unlocked) {
          const nextVal = a.progress + amount;
          const unlocked = nextVal >= a.maxProgress;
          if (unlocked) {
            sound.playLevelUp();
          }
          return {
            ...a,
            progress: nextVal,
            unlocked,
          };
        }
        return a;
      })
    );
  }, []);

  // --- Day / Night Clock Cycle (8:00 AM to 10:00 PM) ---
  useEffect(() => {
    if (!isStoreOpen) return;

    const timer = setInterval(() => {
      setDayTimeSeconds((prevTime) => {
        // 1 real second = ~90 in-game seconds (A full day takes ~150 seconds of action)
        const nextTime = prevTime + 90;
        // 10:00 PM is 22:00 = 79200 seconds
        if (nextTime >= 79200) {
          // Day Finished! Automatically close store and generate daily report
          closeSupermarket();
          return 79200;
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStoreOpen]);

  // --- Open Supermarket ---
  const openSupermarket = () => {
    if (isStoreOpen) return;
    setIsStoreOpen(true);
    sound.playDoorChime();
  };

  // --- Close Supermarket & Daily Report ---
  const closeSupermarket = useCallback(() => {
    setIsStoreOpen(false);

    // Calculate wages & rent expenses
    const hiredEmployees = employees.filter((e) => e.hired);
    const totalWages = hiredEmployees.reduce((sum, e) => sum + e.salary, 0);
    const dailyRent = 1200 + expansionLevel * 600;

    const stats = dayStatsRef.current;
    const netProfit = stats.revenue - (stats.stockExpenses + totalWages + dailyRent);

    // Deduct fixed daily operating expenses from money
    setMoney((prev) => prev - (totalWages + dailyRent));

    const avgSat = stats.customersServed > 0 ? Math.round(stats.satisfactionSum / stats.customersServed) : 100;

    const report: DailyReport = {
      day: currentDay,
      revenue: stats.revenue,
      stockExpenses: stats.stockExpenses,
      wagesExpenses: totalWages,
      rentExpenses: dailyRent,
      netProfit,
      customersServed: stats.customersServed,
      itemsSold: stats.itemsSold,
      averageSatisfaction: avgSat,
    };

    setDailyReport(report);
    setShowDaySummary(true);
  }, [employees, expansionLevel, currentDay]);

  // --- Advance to Next Day ---
  const advanceToNextDay = () => {
    setShowDaySummary(false);
    setCurrentDay((d) => d + 1);
    setDayTimeSeconds(28800); // Reset to 8:00 AM
    // Reset day stats ref
    dayStatsRef.current = {
      revenue: 0,
      stockExpenses: 0,
      customersServed: 0,
      itemsSold: 0,
      satisfactionSum: 0,
    };
    // Clear leaving customers
    setCustomers([]);
    sound.playClick();
  };

  // --- Ordering Wholesale Stock via Computer ---
  const orderWholesaleProducts = (items: { productId: string; quantity: number }[]): boolean => {
    const totalCost = items.reduce((sum, it) => {
      const p = PRODUCT_CATALOG.find((prod) => prod.id === it.productId);
      return sum + (p ? p.purchasePrice * it.quantity : 0);
    }, 0);

    if (money < totalCost) {
      return false;
    }

    // Deduct cost
    setMoney((prev) => prev - totalCost);
    dayStatsRef.current.stockExpenses += totalCost;

    sound.playDeliveryTruck();
    setIsDeliveryIncoming(true);

    // Delivery truck arrives and drops boxes in storage area after 2.5s
    setTimeout(() => {
      setIsDeliveryIncoming(false);
      const newBoxes: DeliveryBox[] = items.map((it, idx) => ({
        id: `box_${Date.now()}_${idx}`,
        productId: it.productId,
        quantity: it.quantity,
        x: -6.0 + (idx % 4) * 0.85,
        z: -5.2 + Math.floor(idx / 4) * 0.85,
        deliveredAt: Date.now(),
      }));

      setDeliveryBoxes((prev) => [...prev, ...newBoxes]);
      sound.playBoxPickup();
      incrementMissionProgress('m4', 1);
    }, 2500);

    return true;
  };

  // --- Box Carrying & Physical Restocking ---
  const pickupDeliveryBox = (boxId: string): boolean => {
    if (carriedBox) return false; // Can only carry one box at a time

    const box = deliveryBoxes.find((b) => b.id === boxId);
    if (!box) return false;

    const prodDef = PRODUCT_CATALOG.find((p) => p.id === box.productId);
    if (!prodDef) return false;

    setCarriedBox({
      productId: box.productId,
      productName: prodDef.name,
      quantity: box.quantity,
      color: prodDef.color,
      category: prodDef.category,
    });

    setDeliveryBoxes((prev) => prev.filter((b) => b.id !== boxId));
    sound.playBoxPickup();
    return true;
  };

  const dropCarriedBox = () => {
    if (!carriedBox) return;

    // Drop box at default storage bay location
    const newBox: DeliveryBox = {
      id: `box_dropped_${Date.now()}`,
      productId: carriedBox.productId,
      quantity: carriedBox.quantity,
      x: -4.5,
      z: -4.5,
      deliveredAt: Date.now(),
    };

    setDeliveryBoxes((prev) => [...prev, newBox]);
    setCarriedBox(null);
    sound.playBoxPickup();
  };

  const restockShelfWithCarriedBox = (shelfId: string): boolean => {
    if (!carriedBox) return false;

    const shelf = shelfSlots.find((s) => s.id === shelfId);
    if (!shelf) return false;

    // Check category match or empty shelf
    if (shelf.productId && shelf.productId !== carriedBox.productId) {
      return false; // Wrong product for this shelf
    }

    const spaceAvailable = shelf.capacity - shelf.currentStock;
    if (spaceAvailable <= 0) return false; // Shelf is full

    const amountToAdd = Math.min(spaceAvailable, carriedBox.quantity);
    const remainingInBox = carriedBox.quantity - amountToAdd;

    setShelfSlots((prev) =>
      prev.map((s) => {
        if (s.id === shelfId) {
          return {
            ...s,
            productId: carriedBox.productId,
            currentStock: s.currentStock + amountToAdd,
          };
        }
        return s;
      })
    );

    sound.playRestock();
    addXp(amountToAdd * 5);
    incrementMissionProgress('m1', amountToAdd);
    incrementAchievementProgress('ach_restock_master', amountToAdd);

    if (remainingInBox <= 0) {
      setCarriedBox(null);
    } else {
      setCarriedBox({
        ...carriedBox,
        quantity: remainingInBox,
      });
    }

    return true;
  };

  // --- Trash & Cleanliness System ---
  const cleanTrashItem = (trashId: string) => {
    setTrashItems((prev) => prev.filter((t) => t.id !== trashId));
    setCleanliness((prev) => Math.min(100, prev + 8));
    sound.playSweep();
    addXp(15);
    if (cleanliness >= 90) {
      incrementMissionProgress('m3', 1);
    }
  };

  // --- Pricing System ---
  const updateProductPrice = (productId: string, newPrice: number) => {
    const validPrice = Math.max(1, Math.round(newPrice));
    setInventoryPrices((prev) => ({
      ...prev,
      [productId]: validPrice,
    }));
    sound.playClick();
  };

  // --- Customer Arrival AI Loop ---
  useEffect(() => {
    if (!isStoreOpen) return;

    const currentHalfD = (16 + expansionLevel * 4) / 2;

    const spawnCustomer = () => {
      const maxCustomers = 4 + expansionLevel * 2;
      setCustomers((prev) => {
        if (prev.length >= maxCustomers) return prev;

        // Check which products are currently stocked on shelves
        const stockedProducts = shelfSlots
          .filter((s) => s.productId && s.currentStock > 0)
          .map((s) => s.productId as string);

        const unlocked = PRODUCT_CATALOG.filter((p) => p.unlockLevel <= storeLevel);
        if (unlocked.length === 0) return prev;

        let selectedItems: ProductDefinition[] = [];

        // If shelves have stock, 85% chance shoppers want stocked products
        if (stockedProducts.length > 0 && Math.random() < 0.85) {
          const stockedDefs = PRODUCT_CATALOG.filter((p) => stockedProducts.includes(p.id));
          const num = Math.min(stockedDefs.length, 1 + Math.floor(Math.random() * 2));
          selectedItems = [...stockedDefs].sort(() => 0.5 - Math.random()).slice(0, num);
        } else {
          // Default popular products
          const num = Math.min(unlocked.length, 1 + Math.floor(Math.random() * 2));
          selectedItems = [...unlocked].sort(() => 0.5 - Math.random()).slice(0, num);
        }

        const list: CustomerItemGoal[] = selectedItems.map((p) => ({
          productId: p.id,
          quantity: 1 + Math.floor(Math.random() * 2),
          picked: false,
        }));

        const customerNames = [
          'Aarav Sharma',
          'Pooja Verma',
          'Vikram Singh',
          'Neha Patel',
          'Rohan Gupta',
          'Simran Kaur',
          'Arjun Reddy',
          'Ananya Joshi',
          'Kabir Mehta',
          'Deepika Rao',
        ];
        const randomName = customerNames[Math.floor(Math.random() * customerNames.length)];
        const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#38bdf8'];

        // Spawn customer outside in front of the supermarket on the city sidewalk/plaza
        const spawnX = (Math.random() - 0.5) * 2.4;
        const spawnZ = currentHalfD + 4.8;

        const newCust: CustomerData = {
          id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: randomName,
          customerType: Math.random() > 0.5 ? 'quick' : 'regular',
          color: colors[Math.floor(Math.random() * colors.length)],
          x: spawnX,
          z: spawnZ,
          targetX: (Math.random() - 0.5) * 0.8,
          targetZ: currentHalfD - 0.8, // First target: walk through automatic glass sliding doors into welcome mat!
          rotationY: Math.PI,
          speed: 1.85,
          state: 'entering',
          hasCart: Math.random() > 0.4,
          shoppingList: list,
          currentGoalIndex: 0,
          browseTimer: 2.2,
          patience: 60,
          maxPatience: 60,
          satisfaction: 100,
          totalBill: 0,
          paymentMethod: Math.random() > 0.45 ? 'card' : 'cash',
          thought: 'Entering SuperMart to shop...',
        };

        return [...prev, newCust];
      });
    };

    // Prompt spawn on open
    const promptTimeout = setTimeout(spawnCustomer, 300);
    const arrivalInterval = setInterval(spawnCustomer, 3200);

    return () => {
      clearTimeout(promptTimeout);
      clearInterval(arrivalInterval);
    };
  }, [isStoreOpen, storeLevel, expansionLevel, shelfSlots]);

  // --- Customer Shopping & Picking Loop ---
  useEffect(() => {
    if (!isStoreOpen) return;

    const currentHalfD = (16 + expansionLevel * 4) / 2;

    const shoppingLoop = setInterval(() => {
      setCustomers((prevCustomers) => {
        if (prevCustomers.length === 0) return prevCustomers;

        // Customers form a single-file line from the counter back into the aisle.
        // The first person is the only one ready for scanning; everyone else advances as it clears.
        const queueIds = prevCustomers
          .filter((c) => c.state === 'walking_to_checkout' || c.state === 'queuing' || c.state === 'waiting_for_scan')
          .map((c) => c.id);

        const updated = prevCustomers.map((cust) => {
          // Keep customer state position progressing towards target coordinates
          const dx = cust.targetX - cust.x;
          const dz = cust.targetZ - cust.z;
          const distToTarget = Math.hypot(dx, dz);
          if (distToTarget > 0.05) {
            const step = Math.min(distToTarget, cust.speed * 0.7);
            cust.x += (dx / distToTarget) * step;
            cust.z += (dz / distToTarget) * step;
            cust.rotationY = Math.atan2(dx, dz);
          }

          // 1. Entering -> Walking in from sidewalk through automatic sliding doors
          if (cust.state === 'entering') {
            // Once through the doorway threshold, sound chime and move into central shopping aisle
            if (cust.z <= currentHalfD - 0.2 && cust.targetZ > currentHalfD - 1.5) {
              sound.playDoorChime();
              return {
                ...cust,
                targetX: 0,
                targetZ: currentHalfD - 3.5,
                thought: 'Looking around the supermarket aisles...',
              };
            }

            // Once inside central aisle, locate matching shelf or browse
            if (cust.z <= currentHalfD - 2.8 || distToTarget < 0.8) {
              const goal = cust.shoppingList[cust.currentGoalIndex];
              if (goal) {
                const matchingShelf = shelfSlots.find(
                  (s) => s.productId === goal.productId && s.currentStock > 0
                );
                if (matchingShelf) {
                  return {
                    ...cust,
                    state: 'walking_to_shelf' as const,
                    targetX: matchingShelf.x + (matchingShelf.x < 0 ? 1.2 : -1.2),
                    targetZ: matchingShelf.z,
                    thought: 'Walking to product shelf...',
                  };
                }
              }

              // Look for any stocked shelf to browse
              const anyStocked = shelfSlots.find((s) => s.productId && s.currentStock > 0);
              if (anyStocked) {
                return {
                  ...cust,
                  state: 'walking_to_shelf' as const,
                  targetX: anyStocked.x + (anyStocked.x < 0 ? 1.2 : -1.2),
                  targetZ: anyStocked.z,
                  thought: 'Browsing stocked aisles...',
                };
              }

              // If shelves are temporarily empty, customer browses aisles for a short time
              return {
                ...cust,
                state: 'browsing' as const,
                browseTimer: 8.0,
                targetX: -1.5,
                targetZ: 0.0,
                thought: 'Checking shelves in Aisle 1...',
              };
            }
            return cust;
          }

          // 2. Walking to Shelf
          if (cust.state === 'walking_to_shelf') {
            if (distToTarget < 0.85) {
              return {
                ...cust,
                state: 'browsing' as const,
                browseTimer: 2.2,
                thought: 'Inspecting shelf items...',
              };
            }
            return cust;
          }

          // 3. Browsing Shelf & Picking items
          if (cust.state === 'browsing') {
            const nextTimer = cust.browseTimer - 0.8;
            if (nextTimer > 0) {
              return { ...cust, browseTimer: nextTimer };
            }

            const goal = cust.shoppingList[cust.currentGoalIndex];
            if (goal) {
              const matchingShelf = shelfSlots.find((s) => s.productId === goal.productId);
              if (matchingShelf && matchingShelf.currentStock > 0) {
                const pickAmt = Math.min(goal.quantity, matchingShelf.currentStock);
                setShelfSlots((prevShelves) =>
                  prevShelves.map((s) =>
                    s.id === matchingShelf.id
                      ? { ...s, currentStock: Math.max(0, s.currentStock - pickAmt) }
                      : s
                  )
                );
                goal.picked = true;
                goal.quantity = pickAmt;
              }
            }

            // Check if there are more items to buy
            const nextIdx = cust.currentGoalIndex + 1;
            if (nextIdx < cust.shoppingList.length) {
              const nextGoal = cust.shoppingList[nextIdx];
              const nextShelf = shelfSlots.find(
                (s) => s.productId === nextGoal.productId && s.currentStock > 0
              );
              if (nextShelf) {
                return {
                  ...cust,
                  currentGoalIndex: nextIdx,
                  state: 'walking_to_shelf' as const,
                  targetX: nextShelf.x + (nextShelf.x < 0 ? 1.2 : -1.2),
                  targetZ: nextShelf.z,
                  thought: 'Finding next item...',
                };
              }
            }

            // Finished shopping: Check if picked anything
            const pickedAny = cust.shoppingList.some((it) => it.picked);
            if (pickedAny) {
              return {
                ...cust,
                state: 'walking_to_checkout' as const,
                targetX: checkoutPosition.x,
                targetZ: checkoutPosition.z - 1.05,
                thought: 'Heading to checkout counter...',
              };
            } else {
              return {
                ...cust,
                state: 'exiting' as const,
                targetX: 0,
                targetZ: currentHalfD + 5.0,
                thought: 'Items out of stock! Leaving...',
              };
            }
          }

          // 4. Walking to Checkout Counter
          if (cust.state === 'walking_to_checkout') {
            if (distToTarget < 0.8) {
              const bill = cust.shoppingList
                .filter((it) => it.picked)
                .reduce((sum, it) => {
                  const price = inventoryPrices[it.productId] || 40;
                  return sum + price * it.quantity;
                }, 0);

              let offered = bill;
              if (cust.paymentMethod === 'cash') {
                if (bill <= 100) offered = 100;
                else if (bill <= 200) offered = 200;
                else if (bill <= 500) offered = 500;
                else offered = Math.ceil(bill / 500) * 500;
              }

              return {
                ...cust,
                state: 'queuing' as const,
                targetX: checkoutPosition.x,
                targetZ: checkoutPosition.z - 1.05,
                totalBill: bill,
                cashOffered: offered,
                thought: 'Joining the checkout line...',
              };
            }
            return cust;
          }

          if (cust.state === 'queuing' || cust.state === 'waiting_for_scan') {
            const queueIndex = Math.max(0, queueIds.indexOf(cust.id));
            const isAtFront = queueIndex === 0;
            return {
              ...cust,
              state: isAtFront ? 'waiting_for_scan' as const : 'queuing' as const,
              targetX: checkoutPosition.x,
              targetZ: checkoutPosition.z - 1.05 - queueIndex * 1.05,
              thought: isAtFront ? 'Your turn at the register...' : `Queue position ${queueIndex + 1} — waiting to pay...`,
            };
          }

          // 5. Exiting: Despawn only when customer has completely walked outside onto the sidewalk
          if (cust.state === 'exiting' || cust.state === 'paying') {
            if (cust.z >= currentHalfD + 4.2) {
              return null;
            }
            return cust;
          }

          return cust;
        });

        return updated.filter(Boolean) as CustomerData[];
      });
    }, 700);

    return () => clearInterval(shoppingLoop);
  }, [isStoreOpen, shelfSlots, inventoryPrices, expansionLevel, checkoutPosition]);

  // --- Autonomous Employee Automation Loop (Cashier, Stocker, Cleaner) ---
  useEffect(() => {
    if (!isStoreOpen) return;

    const defaultPosition = (role: EmployeeData['role']) => (
      role === 'cashier' ? { x: checkoutPosition.x - 0.7, z: checkoutPosition.z }
        : role === 'stocker' ? { x: -4.5, z: -3.8 }
          : { x: 2, z: 0 }
    );

    const walkEmployee = (employee: EmployeeData, targetX: number, targetZ: number, task: string) => {
      const start = defaultPosition(employee.role);
      const x = employee.x ?? start.x;
      const z = employee.z ?? start.z;
      const dx = targetX - x;
      const dz = targetZ - z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.38) return true;

      const step = Math.min(distance, Math.max(0.28, employee.speed * 0.48));
      setEmployees((prev) => prev.map((emp) => emp.id === employee.id
        ? { ...emp, x: x + (dx / distance) * step, z: z + (dz / distance) * step, currentTask: task }
        : emp));
      return false;
    };

    const employeeInterval = setInterval(() => {
      // 1. Stocker walks to the delivery box, then to the matching shelf before restocking it.
      const stocker = employees.find((e) => e.role === 'stocker' && e.hired);
      if (stocker && deliveryBoxes.length > 0) {
        const boxToRestock = deliveryBoxes[0];
        const matchingShelf = shelfSlots.find(
          (s) => s.productId === boxToRestock.productId && s.currentStock < s.capacity
        );

        if (matchingShelf) {
          const carryingThisBox = stocker.currentTask === `Carrying ${boxToRestock.id}`;
          if (!carryingThisBox) {
            if (walkEmployee(stocker, boxToRestock.x, boxToRestock.z, 'Walking to stock room')) {
              setEmployees((prev) => prev.map((emp) => emp.id === stocker.id ? { ...emp, currentTask: `Carrying ${boxToRestock.id}` } : emp));
            }
          } else if (walkEmployee(stocker, matchingShelf.x, matchingShelf.z, `Restocking ${matchingShelf.shelfName || 'shelf'}`)) {
            const qty = Math.min(matchingShelf.capacity - matchingShelf.currentStock, boxToRestock.quantity);
            setShelfSlots((prev) => prev.map((s) => s.id === matchingShelf.id ? { ...s, currentStock: s.currentStock + qty } : s));
            setDeliveryBoxes((prev) => prev.filter((b) => b.id !== boxToRestock.id));
            setEmployees((prev) => prev.map((emp) => emp.id === stocker.id ? { ...emp, currentTask: 'Looking for next shelf' } : emp));
            sound.playRestock();
          }
        }
      }

      // 2. Cleaner walks across the store to every spill or piece of trash before removing it.
      const cleaner = employees.find((e) => e.role === 'cleaner' && e.hired);
      if (cleaner && trashItems.length > 0) {
        const mess = trashItems[0];
        if (walkEmployee(cleaner, mess.x, mess.z, 'Walking to clean a spill')) {
          setTrashItems((prev) => prev.filter((item) => item.id !== mess.id));
          setCleanliness((prev) => Math.min(100, prev + 10));
          setEmployees((prev) => prev.map((emp) => emp.id === cleaner.id ? { ...emp, currentTask: 'Cleaning store floor' } : emp));
          sound.playSweep();
        }
      }

      // 3. Cashier returns to the register, then scans the customer at the front of the queue.
      const cashier = employees.find((e) => e.role === 'cashier' && e.hired);
      if (cashier) {
        const atCounter = walkEmployee(cashier, checkoutPosition.x - 0.7, checkoutPosition.z, 'Walking to cash counter');
        const waiting = customers.find((c) => c.state === 'waiting_for_scan');
        if (atCounter && waiting) {
          setEmployees((prev) => prev.map((emp) => emp.id === cashier.id ? { ...emp, currentTask: `Billing ${waiting.name}` } : emp));
          processCustomerCheckout(waiting.id, waiting.paymentMethod, waiting.cashOffered);
        } else {
          setEmployees((prev) => prev.map((emp) => emp.id === cashier.id && emp.currentTask !== 'Ready at checkout' ? { ...emp, currentTask: 'Ready at checkout' } : emp));
        }
      }
    }, 450);

    return () => clearInterval(employeeInterval);
  }, [isStoreOpen, employees, deliveryBoxes, shelfSlots, trashItems, customers, checkoutPosition]);

  // --- Random Trash/Spill Dropping ---
  useEffect(() => {
    if (!isStoreOpen) return;

    const trashInterval = setInterval(() => {
      if (Math.random() > 0.65 && trashItems.length < 5) {
        const types: ('paper' | 'spill' | 'cup')[] = ['paper', 'spill', 'cup'];
        const newTrash: TrashItem = {
          id: `trash_${Date.now()}`,
          x: (Math.random() - 0.5) * 6.0,
          z: (Math.random() - 0.5) * 6.0,
          type: types[Math.floor(Math.random() * types.length)],
        };
        setTrashItems((prev) => [...prev, newTrash]);
        setCleanliness((prev) => Math.max(40, prev - 6));
      }
    }, 12000);

    return () => clearInterval(trashInterval);
  }, [isStoreOpen, trashItems.length]);

  // --- Checkout Processing ---
  const processCustomerCheckout = (
    customerId: string,
    paymentMethod: 'cash' | 'card',
    cashReceived?: number
  ): { success: boolean; change: number } => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, change: 0 };

    const total = customer.totalBill;
    const change = cashReceived !== undefined ? Math.max(0, cashReceived - total) : 0;

    // Add money to store register
    setMoney((prev) => prev + total);

    if (paymentMethod === 'cash') {
      sound.playCashRegister();
    } else {
      sound.playCardApproved();
    }

    // Award XP
    const itemsCount = customer.shoppingList.filter((it) => it.picked).length;
    addXp(total > 0 ? 30 + itemsCount * 5 : 10);

    // Track daily stats
    dayStatsRef.current.revenue += total;
    dayStatsRef.current.customersServed += 1;
    dayStatsRef.current.itemsSold += itemsCount;
    dayStatsRef.current.satisfactionSum += customer.satisfaction;

    // Update missions and achievements
    incrementMissionProgress('m2', 1);
    incrementAchievementProgress('ach_first_sale', 1);
    incrementAchievementProgress('ach_25_customers', 1);
    incrementAchievementProgress('ach_100k_earned', total);

    // Transition customer to paying & exiting
    const currentHalfD = (16 + expansionLevel * 4) / 2;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            state: 'paying',
            targetX: 0,
            targetZ: currentHalfD + 5.0, // Walk out the sliding doors onto the sidewalk
            thought: 'Thank you! Walking home with groceries...',
          };
        }
        return c;
      })
    );

    // Remove customer after walking out
    setTimeout(() => {
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    }, 4500);

    return { success: true, change };
  };

  // --- Shelf Organization & Product Assignment ---
  const assignShelfProduct = (shelfId: string, productId: string | null) => {
    setShelfSlots((prev) =>
      prev.map((s) => {
        if (s.id === shelfId) {
          return {
            ...s,
            productId,
            currentStock: productId === null ? 0 : s.productId === productId ? s.currentStock : 0,
          };
        }
        return s;
      })
    );
    sound.playClick();
  };

  const clearShelf = (shelfId: string) => {
    const target = shelfSlots.find((s) => s.id === shelfId);
    if (!target || !target.productId) return;

    // Pack remaining stock into a delivery box placed in the warehouse/back room
    if (target.currentStock > 0) {
      const returnBox: DeliveryBox = {
        id: `box_packed_${Date.now()}`,
        productId: target.productId,
        quantity: target.currentStock,
        x: -4.5,
        z: -4.5,
        deliveredAt: Date.now(),
      };
      setDeliveryBoxes((prev) => [...prev, returnBox]);
    }

    setShelfSlots((prev) =>
      prev.map((s) => (s.id === shelfId ? { ...s, productId: null, currentStock: 0 } : s))
    );
    sound.playBoxPickup();
  };

  const moveShelf = (shelfId: string, deltaX: number, deltaZ: number) => {
    setShelfSlots((prev) => prev.map((s) => s.id === shelfId
      ? { ...s, x: Math.max(-7, Math.min(7, s.x + deltaX)), z: Math.max(-5.5, Math.min(5, s.z + deltaZ)) }
      : s));
  };

  const moveEmployee = (employeeId: string, deltaX: number, deltaZ: number) => {
    setEmployees((prev) => prev.map((emp) => {
      if (emp.id !== employeeId) return emp;
      const defaults = emp.role === 'cashier' ? { x: -0.7, z: 1.8 } : emp.role === 'stocker' ? { x: -4.5, z: -3.8 } : { x: 2, z: 0 };
      return { ...emp, x: Math.max(-7, Math.min(7, (emp.x ?? defaults.x) + deltaX)), z: Math.max(-5.5, Math.min(5, (emp.z ?? defaults.z) + deltaZ)) };
    }));
  };

  const moveCheckout = (deltaX: number, deltaZ: number) => {
    setCheckoutPosition((pos) => ({ x: Math.max(-4, Math.min(4, pos.x + deltaX)), z: Math.max(-3, Math.min(4, pos.z + deltaZ)) }));
  };

  // --- Employees Management ---
  const hireEmployee = (empId: string): boolean => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp || emp.hired) return false;

    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, hired: true } : e))
    );
    sound.playClick();
    return true;
  };

  const fireEmployee = (empId: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, hired: false } : e))
    );
    sound.playClick();
  };

  const upgradeEmployee = (empId: string): boolean => {
    const cost = 2000;
    if (money < cost) return false;

    setMoney((m) => m - cost);
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === empId ? { ...e, level: e.level + 1, speed: e.speed + 0.3 } : e
      )
    );
    sound.playLevelUp();
    return true;
  };

  // --- Store Expansion ---
  const purchaseStoreExpansion = (level: number): boolean => {
    const costs: Record<number, number> = {
      2: 25000,
      3: 50000,
      4: 100000,
    };
    const cost = costs[level] || 50000;
    if (money < cost || level <= expansionLevel) return false;

    setMoney((m) => m - cost);
    setExpansionLevel(level);

    // Add more shelves for the new expansion area!
    if (level === 2) {
      setShelfSlots((prev) => [
        ...prev,
        { id: 'shelf_cereal', category: 'grocery', productId: 'corn_flakes', x: -1.5, z: 3.5, rotationY: 0, capacity: 16, currentStock: 10, level: 1, modelType: 'gondola' },
        { id: 'shelf_juice', category: 'drinks', productId: 'orange_juice', x: 2.0, z: 3.5, rotationY: 0, capacity: 14, currentStock: 10, level: 1, modelType: 'gondola' },
        { id: 'shelf_butter', category: 'dairy', productId: 'dairy_butter', x: 5.5, z: -0.5, rotationY: -Math.PI / 2, capacity: 14, currentStock: 10, level: 1, modelType: 'cooler' },
      ]);
    }

    sound.playLevelUp();
    return true;
  };

  // --- Claim Mission Reward ---
  const claimMissionReward = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    setMoney((m) => m + mission.rewardCoins);
    addXp(mission.rewardXp);
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
    );
    sound.playCashRegister();
  };

  // --- Save / Load System (localStorage + Supabase) ---
  const saveGame = async () => {
    setSaveStatus('saving');
    const saveData: GameSaveData = {
      user_id: user?.id || 'guest',
      display_name: user?.user_metadata?.display_name || 'Store Manager',
      store_name: storeName,
      avatar_id: avatarId,
      money,
      store_level: storeLevel,
      store_xp: storeXp,
      store_rating: storeRating,
      cleanliness,
      current_day: currentDay,
      day_time_seconds: dayTimeSeconds,
      is_store_open: isStoreOpen,
      inventory_prices: inventoryPrices,
      inventory_storage: inventoryStorage,
      shelf_stocks: shelfSlots.reduce((acc, s) => ({ ...acc, [s.id]: s.currentStock }), {}),
      shelf_layout: shelfSlots,
      checkout_position: checkoutPosition,
      customers,
      delivery_boxes: deliveryBoxes,
      trash_items: trashItems,
      carried_box: carriedBox,
      camera_mode: cameraMode,
      expansion_level: expansionLevel,
      employees,
      missions,
      achievements,
      daily_streak: 1,
      last_daily_reward_claim: Date.now(),
      last_saved_at: new Date().toISOString(),
    };

    // Save to local storage for guest & offline resilience
    localStorage.setItem('supermart_3d_save', JSON.stringify(saveData));

    // If logged in, save to cloud Supabase
    if (user && !isGuest) {
      try {
        await saveUserGameProfile(saveData);
      } catch (err) {
        console.warn('Supabase cloud save sync error:', err);
      }
    }

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  // Load game on start
  useEffect(() => {
    const local = localStorage.getItem('supermart_3d_save');
    if (local) {
      try {
        const parsed: GameSaveData = JSON.parse(local);
        if (parsed.money !== undefined) setMoney(parsed.money);
        if (parsed.store_level) setStoreLevel(parsed.store_level);
        if (parsed.store_xp !== undefined) setStoreXp(parsed.store_xp);
        if (parsed.current_day) setCurrentDay(parsed.current_day);
        if (parsed.expansion_level) setExpansionLevel(parsed.expansion_level);
        if (parsed.inventory_prices) setInventoryPrices(parsed.inventory_prices);
        if (parsed.inventory_storage) setInventoryStorage(parsed.inventory_storage);
        if (parsed.shelf_layout) setShelfSlots(parsed.shelf_layout);
        if (parsed.checkout_position) setCheckoutPosition(parsed.checkout_position);
        if (parsed.employees) setEmployees(parsed.employees);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.delivery_boxes) setDeliveryBoxes(parsed.delivery_boxes);
        if (parsed.trash_items) setTrashItems(parsed.trash_items);
        if (parsed.carried_box) setCarriedBox(parsed.carried_box);
        if (parsed.camera_mode) setCameraMode(parsed.camera_mode);
        if (parsed.day_time_seconds !== undefined) setDayTimeSeconds(parsed.day_time_seconds);
        if (parsed.is_store_open !== undefined) setIsStoreOpen(parsed.is_store_open);
        if (parsed.cleanliness !== undefined) setCleanliness(parsed.cleanliness);
        if (parsed.store_rating !== undefined) setStoreRating(parsed.store_rating);
        if (parsed.missions) setMissions(parsed.missions);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.store_name) setStoreNameState(parsed.store_name);
        if (parsed.avatar_id) setAvatarIdState(parsed.avatar_id);
      } catch (e) {
        console.error('Failed to parse local save', e);
      }
    }
    hasHydratedSaveRef.current = true;
  }, []);

  // Keep a resumable local snapshot while the store is running. This is deliberately
  // local-only: cloud writes remain on the explicit Save action, avoiding a network call every second.
  useEffect(() => {
    if (!hasHydratedSaveRef.current) return;

    const timer = window.setTimeout(() => {
      const snapshot: GameSaveData = {
        user_id: user?.id || 'guest',
        display_name: user?.user_metadata?.display_name || 'Store Manager',
        store_name: storeName,
        avatar_id: avatarId,
        money,
        store_level: storeLevel,
        store_xp: storeXp,
        store_rating: storeRating,
        cleanliness,
        current_day: currentDay,
        day_time_seconds: dayTimeSeconds,
        is_store_open: isStoreOpen,
        inventory_prices: inventoryPrices,
        inventory_storage: inventoryStorage,
        shelf_stocks: shelfSlots.reduce((acc, shelf) => ({ ...acc, [shelf.id]: shelf.currentStock }), {}),
        shelf_layout: shelfSlots,
        checkout_position: checkoutPosition,
        customers,
        delivery_boxes: deliveryBoxes,
        trash_items: trashItems,
        carried_box: carriedBox,
        camera_mode: cameraMode,
        expansion_level: expansionLevel,
        employees,
        missions,
        achievements,
        daily_streak: 1,
        last_daily_reward_claim: Date.now(),
        last_saved_at: new Date().toISOString(),
      };
      localStorage.setItem('supermart_3d_save', JSON.stringify(snapshot));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [user, storeName, avatarId, money, storeLevel, storeXp, storeRating, cleanliness, currentDay, dayTimeSeconds, isStoreOpen, inventoryPrices, inventoryStorage, shelfSlots, checkoutPosition, customers, deliveryBoxes, trashItems, carriedBox, cameraMode, expansionLevel, employees, missions, achievements]);

  const resetGame = () => {
    localStorage.removeItem('supermart_3d_save');
    setMoney(50000);
    setStoreLevel(1);
    setStoreXp(0);
    setCurrentDay(1);
    setExpansionLevel(1);
    setShelfSlots(INITIAL_SHELVES);
    setCheckoutPosition({ x: 0, z: 1.8 });
    setEmployees(INITIAL_EMPLOYEES);
    sound.playClick();
  };

  const closeDaySummaryModal = () => {
    setShowDaySummary(false);
  };

  return (
    <GameContext.Provider
      value={{
        money,
        storeLevel,
        storeXp,
        maxXpForCurrentLevel,
        cleanliness,
        storeRating,
        currentDay,
        dayTimeSeconds,
        isStoreOpen,
        cameraMode,
        setCameraMode,
        inventoryPrices,
        inventoryStorage,
        shelfSlots,
        checkoutPosition,
        carriedBox,
        deliveryBoxes,
        trashItems,
        customers,
        employees,
        expansionLevel,
        missions,
        achievements,
        dailyReport,
        showDaySummary,
        saveStatus,
        isDeliveryIncoming,
        storeName,
        setStoreName,
        avatarId,
        setAvatarId,
        openSupermarket,
        closeSupermarket,
        advanceToNextDay,
        orderWholesaleProducts,
        pickupDeliveryBox,
        dropCarriedBox,
        restockShelfWithCarriedBox,
        cleanTrashItem,
        updateProductPrice,
        processCustomerCheckout,
        assignShelfProduct,
        clearShelf,
        moveShelf,
        moveEmployee,
        moveCheckout,
        hireEmployee,
        fireEmployee,
        upgradeEmployee,
        purchaseStoreExpansion,
        claimMissionReward,
        saveGame,
        resetGame,
        closeDaySummaryModal,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
