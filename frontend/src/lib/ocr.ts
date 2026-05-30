/**
 * OCR Data Ingestion types and utilities
 * Used by the Data Ingestion page for OCR extraction, duplicate detection,
 * and upload history management.
 */

// --- Interfaces ---

export interface OcrItem {
  name: string;
  category: string;
  qty: number;
  unit: string;
  expiry: string;
  confidence: number;
  lotNumber: string;
  location?: string;
  zone?: string;
}

export interface UploadRecord {
  id: string;
  fileName: string;
  fileSize: string;
  category: string;
  recordCount: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Validated' | 'Processing' | 'Failed';
  notes: string;
}

// --- Inventory item shape for duplicate detection ---

export interface InventoryItem {
  name: string;
  lotNumber?: string;
  [key: string]: unknown;
}

// --- Utility Functions ---

/**
 * Detects whether an OCR-extracted item is a duplicate of an existing inventory item.
 * A duplicate is defined as having both the same name (case-insensitive) AND the same lot number.
 *
 * Property 12: the duplicate detector SHALL flag the item as a duplicate if and only if
 * there exists an inventory item with both the same name (case-insensitive) AND the same lot number.
 *
 * @param item - The OCR-extracted item to check
 * @param existingInventory - Array of existing inventory items to check against
 * @returns true if a duplicate exists, false otherwise
 */
export function isDuplicate(item: OcrItem, existingInventory: InventoryItem[]): boolean {
  const itemNameLower = item.name.toLowerCase();
  const itemLot = item.lotNumber;

  return existingInventory.some(
    (existing) =>
      existing.name.toLowerCase() === itemNameLower &&
      existing.lotNumber === itemLot
  );
}

/**
 * Creates an UploadRecord for a processed file.
 * Generates a unique ID, sets the current timestamp, and defaults status to 'Validated'.
 *
 * Property 11: the created UploadRecord SHALL contain non-empty values for all required fields:
 * id, fileName, fileSize, category, recordCount, uploadedBy, uploadedAt, and status.
 *
 * @param fileName - Name of the uploaded file
 * @param fileSize - Human-readable file size string (e.g., "1.2 MB")
 * @param recordCount - Number of items extracted from the file
 * @param category - Category classification for the upload (defaults to 'OCR Scan')
 * @param uploadedBy - Username of the uploader (defaults to 'System')
 * @returns A complete UploadRecord with all required fields populated
 */
export function createUploadRecord(
  fileName: string,
  fileSize: string,
  recordCount: number,
  category: string = 'OCR Scan',
  uploadedBy: string = 'System'
): UploadRecord {
  return {
    id: generateId(),
    fileName,
    fileSize,
    category,
    recordCount,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
    status: 'Validated',
    notes: `Extracted ${recordCount} item${recordCount !== 1 ? 's' : ''} from ${fileName}`,
  };
}

/**
 * Generates a unique ID string for upload records.
 */
function generateId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
