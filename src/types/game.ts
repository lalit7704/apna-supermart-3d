import { ProductCategory, ProductDefinition } from '../data/products';

export interface CarriedBox {
  productId: string;
  productName: string;
  quantity: number;
  color: string;
  category: ProductCategory;
}

export interface ShelfSlot {
  id: string;
  shelfName?: string;
  category: ProductCategory;
  productId: string | null;
  x: number;
  z: number;
  rotationY: number;
  capacity: number;
  currentStock: number;
  level: number; // Shelf upgrade level
  modelType: 'gondola' | 'cooler' | 'freezer';
}

export interface DeliveryBox {
  id: string;
  productId: string;
  quantity: number;
  x: number;
  z: number;
  deliveredAt: number;
}

export interface TrashItem {
  id: string;
  x: number;
  z: number;
  type: 'paper' | 'spill' | 'cup';
}

export interface CustomerItemGoal {
  productId: string;
  quantity: number;
  picked: boolean;
}

export type CustomerState =
  | 'entering'
  | 'getting_cart'
  | 'walking_to_shelf'
  | 'browsing'
  | 'picking'
  | 'walking_to_checkout'
  | 'queuing'
  | 'waiting_for_scan'
  | 'paying'
  | 'exiting';

export interface CustomerData {
  id: string;
  name: string;
  customerType: 'quick' | 'regular' | 'family' | 'budget';
  color: string;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  rotationY: number;
  speed: number;
  state: CustomerState;
  hasCart: boolean;
  shoppingList: CustomerItemGoal[];
  currentGoalIndex: number;
  browseTimer: number;
  patience: number;
  maxPatience: number;
  satisfaction: number;
  totalBill: number;
  paymentMethod: 'cash' | 'card';
  cashOffered?: number;
  thought?: string;
}

export interface EmployeeData {
  id: string;
  name: string;
  role: 'cashier' | 'stocker' | 'cleaner';
  salary: number; // Daily salary deducted at end of day
  hired: boolean;
  level: number;
  speed: number;
  currentTask?: string;
  avatarColor?: string;
  x?: number;
  z?: number;
}

export interface DailyReport {
  day: number;
  revenue: number;
  stockExpenses: number;
  wagesExpenses: number;
  rentExpenses: number;
  netProfit: number;
  customersServed: number;
  itemsSold: number;
  averageSatisfaction: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface StoreExpansion {
  level: number;
  name: string;
  cost: number;
  width: number;
  depth: number;
  unlocked: boolean;
  description: string;
}

export interface GameSaveData {
  id?: string;
  user_id: string;
  display_name: string;
  store_name?: string;
  avatar_id?: string;
  money: number;
  store_level: number;
  store_xp: number;
  store_rating: number;
  cleanliness: number;
  current_day: number;
  day_time_seconds: number;
  is_store_open: boolean;
  inventory_prices: Record<string, number>;
  inventory_storage: Record<string, number>;
  shelf_stocks: Record<string, number>;
  shelf_layout?: ShelfSlot[];
  checkout_position?: { x: number; z: number };
  customers?: CustomerData[];
  delivery_boxes?: DeliveryBox[];
  trash_items?: TrashItem[];
  carried_box?: CarriedBox | null;
  camera_mode?: CameraMode;
  expansion_level: number;
  employees: EmployeeData[];
  missions: Mission[];
  achievements: Achievement[];
  daily_streak: number;
  last_daily_reward_claim: number;
  last_saved_at: string;
}

export type RestaurantSaveData = GameSaveData;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error';
export type CameraMode = 'first_person' | 'third_person' | 'isometric';
