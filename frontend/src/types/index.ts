export type UserRole = 'Operator' | 'QC' | 'PPIC' | 'Admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
}

export type InventoryStatus = 'Aman' | 'Warning' | 'Kritis' | 'Expired';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  location: string;
  zone: string;
  dateIn: string;
  expiry: string;
  status: InventoryStatus;
  image?: string | null;
}

export interface Slot {
  id: string;
  zone: string;
  row: string;
  col: number;
  occupied: boolean;
  itemId: string | null;
}

export interface Zone {
  id: string;
  name: string;
  color: string;
  type: string;
  tempMin: number | null;
  tempMax: number | null;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  username?: string;
  role: string;
  action: string;
  detail: string;
  module: string;
}

export interface TemperatureReading {
  zone: string;
  hour: string;
  temperature: number;
  timestamp: string;
}

export type NotificationType = 'alert' | 'coldchain' | 'inventory' | 'upload' | 'audit' | 'system';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

export interface ChatMessage {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export interface MaintenanceTicket {
  id: number;
  zone: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface ColdChainAlert {
  zone: string;
  zoneName: string;
  count: number;
  maxTemp: number;
  threshold: number;
}

export interface DashboardStats {
  capacity: number;
  totalSlots: number;
  occupiedSlots: number;
  emptySlots: number;
  expired: number;
  critical: number;
  warning: number;
  safe: number;
  totalItems: number;
  coldChainAlerts: ColdChainAlert[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}
