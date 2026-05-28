export type UserRole = "ADMIN" | "QUALITY_CONTROL" | "WAREHOUSE_STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export type AromaCategory = "Essential Oil" | "Spices & Herbs" | "Resin & Balsam" | "Synthetic Extract";

export type AromaStatus = "Excellent" | "Aged" | "Testing" | "Low Stock";

export interface AromaItem {
  id: string;
  name: string;
  batchCode: string;
  category: AromaCategory;
  stockQuantity: number;
  unit: string;
  storageLocation: string;
  status: AromaStatus;
  temperature: number;
  humidity: number;
  lastUpdated: string;
}

export interface IngestionRecord {
  id: string;
  itemName: string;
  batchCode: string;
  category: AromaCategory;
  quantity: number;
  unit: string;
  receivedDate: string;
  inspectorName: string;
  status: "Passed" | "Testing" | "Rejected";
  notes?: string;
}

export interface WarehouseZone {
  id: string;
  name: string;
  description: string;
  capacityUsed: number;
  maxCapacity: number;
  temperature: number;
  humidity: number;
  alertLevel: "Normal" | "Warning" | "Critical";
}
