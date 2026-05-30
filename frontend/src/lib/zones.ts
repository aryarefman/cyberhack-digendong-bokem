// Zone management utility and types for AromaSys floor plan

// --- Interfaces ---

export interface ZonePosition {
  x: number;      // left offset as % of canvas width (0-100)
  y: number;      // top offset as % of canvas height (0-100)
  width: number;  // zone width as % of canvas width (min: 5)
  height: number; // zone height as % of canvas height (min: 5)
}

export interface Material {
  id: string;
  name: string;
  qty: number;
  unit: string;
  maxCapacity?: number;
}

export interface InteractiveZone {
  id: string;
  name: string;
  position: ZonePosition;
  hasTempSensor: boolean;
  tempApiUrl?: string;
  hasHumidSensor: boolean;
  humidApiUrl?: string;
  isSetup?: boolean;
  materials?: Material[];
  theme?: string;
  zone?: string;
  iconType?: string;
  hasStatusDot?: boolean;
  color?: string;
}

// --- Constants ---

export const STORAGE_KEYS = {
  INTERACTIVE_ZONES: 'aromasys_interactive_zones',
  FLOOR_PLAN: 'aromasys_floor_plan',
  FLOOR_PLAN_IMAGE: 'aromasys_floor_plan_image',
  DELETED_DEFAULT_ZONES: 'aromasys_deleted_default_zones',
  INGESTION_HISTORY: 'aromasys_ingestion_history',
} as const;

export const CATEGORY_ZONE_MAP: Record<string, string> = {
  'Kimia': 'E',      // Hazard Storage
  'Pengawet': 'E',   // Hazard Storage
  'Susu': 'D',       // Cold Storage
  'Cokelat': 'D',    // Cold Storage
  'Tepung': 'A',     // Dry Storage
  'Gula': 'A',       // Dry Storage
  'Minyak': 'B',     // Liquid Storage
  'Pewarna': 'B',    // Liquid Storage
  'Essence': 'B',    // Liquid Storage
  'Rempah': 'C',     // General Storage
};

export const MAX_ZONES = 30;
export const MIN_ZONE_SIZE = 5; // minimum 5% width/height

// --- Drag & Resize Calculation Functions ---

/**
 * Calculate new zone position after a drag operation.
 * Clamps the position so the zone never extends beyond canvas boundaries (0-100%).
 */
export function calculateDragPosition(
  startPos: ZonePosition,
  dragDelta: { dx: number; dy: number }
): ZonePosition {
  return {
    ...startPos,
    x: Math.max(0, Math.min(100 - startPos.width, startPos.x + dragDelta.dx)),
    y: Math.max(0, Math.min(100 - startPos.height, startPos.y + dragDelta.dy)),
  };
}

/**
 * Calculate new zone position after resizing from the right edge.
 * Enforces minimum 5% width and prevents extending beyond canvas right boundary.
 */
export function calculateResizeRight(
  startPos: ZonePosition,
  widthDelta: number
): ZonePosition {
  return {
    ...startPos,
    width: Math.max(MIN_ZONE_SIZE, Math.min(100 - startPos.x, startPos.width + widthDelta)),
  };
}

/**
 * Calculate new zone position after resizing from the left edge.
 * Adjusts both x position and width. Enforces minimum 5% width
 * and prevents extending beyond canvas left boundary.
 */
export function calculateResizeLeft(
  startPos: ZonePosition,
  widthDelta: number
): ZonePosition {
  // widthDelta is positive when dragging left (expanding), negative when dragging right (shrinking)
  const maxExpand = startPos.x; // can't go past left edge
  const maxShrink = startPos.width - MIN_ZONE_SIZE; // can't shrink below minimum

  // Clamp the delta: positive means expand left, negative means shrink
  const clampedDelta = Math.max(-maxShrink, Math.min(maxExpand, widthDelta));

  return {
    ...startPos,
    x: startPos.x - clampedDelta,
    width: startPos.width + clampedDelta,
  };
}

/**
 * Calculate new zone position after resizing from the top edge.
 * Adjusts both y position and height. Enforces minimum 5% height
 * and prevents extending beyond canvas top boundary.
 */
export function calculateResizeTop(
  startPos: ZonePosition,
  heightDelta: number
): ZonePosition {
  // heightDelta is positive when dragging up (expanding), negative when dragging down (shrinking)
  const maxExpand = startPos.y; // can't go past top edge
  const maxShrink = startPos.height - MIN_ZONE_SIZE; // can't shrink below minimum

  // Clamp the delta: positive means expand up, negative means shrink
  const clampedDelta = Math.max(-maxShrink, Math.min(maxExpand, heightDelta));

  return {
    ...startPos,
    y: startPos.y - clampedDelta,
    height: startPos.height + clampedDelta,
  };
}

/**
 * Calculate new zone position after resizing from the bottom edge.
 * Enforces minimum 5% height and prevents extending beyond canvas bottom boundary.
 */
export function calculateResizeBottom(
  startPos: ZonePosition,
  heightDelta: number
): ZonePosition {
  return {
    ...startPos,
    height: Math.max(MIN_ZONE_SIZE, Math.min(100 - startPos.y, startPos.height + heightDelta)),
  };
}

// --- Zone-Category Mismatch Detection ---

/**
 * Detect whether an item's category is mismatched with its current zone.
 * Returns true if the category has a recommended zone that differs from the current zone.
 * Returns false for unknown categories (no mismatch can be determined).
 */
export function detectZoneMismatch(itemCategory: string, currentZone: string): boolean {
  const recommendedZone = CATEGORY_ZONE_MAP[itemCategory];
  if (!recommendedZone) return false; // Unknown category, no mismatch
  return recommendedZone !== currentZone;
}
