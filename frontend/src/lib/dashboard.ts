/**
 * Dashboard utility functions for zone capacity indicators.
 */

export type CapacityColor = "green" | "yellow" | "red";

/**
 * Returns a color indicator based on zone utilization percentage.
 * - green: utilization < 50%
 * - yellow: 50% <= utilization <= 80%
 * - red: utilization > 80%
 */
export function getCapacityColor(utilization: number): CapacityColor {
  if (utilization < 50) return "green";
  if (utilization <= 80) return "yellow";
  return "red";
}

/**
 * Calculates utilization percentage from occupied and total slot counts.
 * Returns 0 if total is 0 to avoid division by zero.
 */
export function calculateUtilization(occupied: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((occupied / total) * 100);
}
