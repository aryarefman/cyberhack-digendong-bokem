import { describe, it, expect } from 'vitest';
import { isDuplicate, createUploadRecord, OcrItem, InventoryItem } from './ocr';

describe('isDuplicate', () => {
  const baseItem: OcrItem = {
    name: 'Vanilla Extract',
    category: 'Essence',
    qty: 10,
    unit: 'L',
    expiry: '2025-12-31',
    confidence: 0.95,
    lotNumber: 'LOT-001',
  };

  it('returns true when name (case-insensitive) and lot number both match', () => {
    const inventory: InventoryItem[] = [
      { name: 'vanilla extract', lotNumber: 'LOT-001' },
    ];
    expect(isDuplicate(baseItem, inventory)).toBe(true);
  });

  it('returns true for uppercase name match', () => {
    const inventory: InventoryItem[] = [
      { name: 'VANILLA EXTRACT', lotNumber: 'LOT-001' },
    ];
    expect(isDuplicate(baseItem, inventory)).toBe(true);
  });

  it('returns false when name matches but lot number differs', () => {
    const inventory: InventoryItem[] = [
      { name: 'Vanilla Extract', lotNumber: 'LOT-002' },
    ];
    expect(isDuplicate(baseItem, inventory)).toBe(false);
  });

  it('returns false when lot number matches but name differs', () => {
    const inventory: InventoryItem[] = [
      { name: 'Chocolate Powder', lotNumber: 'LOT-001' },
    ];
    expect(isDuplicate(baseItem, inventory)).toBe(false);
  });

  it('returns false for empty inventory', () => {
    expect(isDuplicate(baseItem, [])).toBe(false);
  });

  it('returns false when no items match at all', () => {
    const inventory: InventoryItem[] = [
      { name: 'Sugar', lotNumber: 'LOT-999' },
      { name: 'Flour', lotNumber: 'LOT-888' },
    ];
    expect(isDuplicate(baseItem, inventory)).toBe(false);
  });

  it('handles inventory items without lotNumber', () => {
    const inventory: InventoryItem[] = [
      { name: 'Vanilla Extract' },
    ];
    expect(isDuplicate(baseItem, inventory)).toBe(false);
  });
});

describe('createUploadRecord', () => {
  it('creates a record with all required fields non-empty', () => {
    const record = createUploadRecord('invoice.pdf', '1.2 MB', 5);

    expect(record.id).toBeTruthy();
    expect(record.fileName).toBe('invoice.pdf');
    expect(record.fileSize).toBe('1.2 MB');
    expect(record.category).toBe('OCR Scan');
    expect(record.recordCount).toBe(5);
    expect(record.uploadedBy).toBe('System');
    expect(record.uploadedAt).toBeTruthy();
    expect(record.status).toBe('Validated');
    expect(record.notes).toBeTruthy();
  });

  it('generates unique IDs for different records', () => {
    const record1 = createUploadRecord('file1.pdf', '1 MB', 3);
    const record2 = createUploadRecord('file2.pdf', '2 MB', 7);
    expect(record1.id).not.toBe(record2.id);
  });

  it('uses custom category and uploadedBy when provided', () => {
    const record = createUploadRecord('doc.png', '500 KB', 2, 'Invoice', 'admin');
    expect(record.category).toBe('Invoice');
    expect(record.uploadedBy).toBe('admin');
  });

  it('sets uploadedAt to a valid ISO timestamp', () => {
    const before = new Date().toISOString();
    const record = createUploadRecord('test.jpg', '100 KB', 1);
    const after = new Date().toISOString();

    expect(record.uploadedAt >= before).toBe(true);
    expect(record.uploadedAt <= after).toBe(true);
  });

  it('generates correct notes with plural items', () => {
    const record = createUploadRecord('batch.pdf', '3 MB', 10);
    expect(record.notes).toBe('Extracted 10 items from batch.pdf');
  });

  it('generates correct notes with singular item', () => {
    const record = createUploadRecord('single.png', '200 KB', 1);
    expect(record.notes).toBe('Extracted 1 item from single.png');
  });
});
