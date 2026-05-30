import { Router } from 'express';
import pool from '../lib/db.js';

const router = Router();

// Helper: build slots response
async function getSlotsResponse() {
  const resSlots = await pool.query('SELECT id, zone, row, col, occupied FROM slots ORDER BY id ASC');
  const resInventory = await pool.query('SELECT id, name, qty, unit, category, expiry, status, location FROM inventory WHERE location IS NOT NULL');

  const inventoryByLocation = {};
  resInventory.rows.forEach(inv => {
    if (!inventoryByLocation[inv.location]) inventoryByLocation[inv.location] = [];
    inventoryByLocation[inv.location].push({
      id: inv.id,
      name: inv.name,
      qty: parseFloat(inv.qty),
      unit: inv.unit,
      category: inv.category,
      expiry: inv.expiry ? inv.expiry.toISOString().split('T')[0] : null,
      status: inv.status
    });
  });

  const slots = resSlots.rows.map(row => {
    const items = inventoryByLocation[row.id] || [];
    return {
      id: row.id,
      zone: row.zone,
      row: row.row,
      col: parseInt(row.col),
      occupied: items.length > 0,
      materials: items,
      itemId: items.length > 0 ? items[0].id : null,
      item: items.length > 0 ? items[0] : null
    };
  });

  return { success: true, slots };
}

// GET /api/slots
router.get('/', async (req, res) => {
  try {
    const data = await getSlotsResponse();
    return res.json(data);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/slots
router.post('/', async (req, res) => {
  try {
    const { id, item } = req.body;
    if (!id || !item || !item.id) {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    await pool.query('UPDATE inventory SET location = $1, zone = (SELECT zone FROM slots WHERE id = $1) WHERE id = $2', [id, item.id]);
    await pool.query('UPDATE slots SET occupied = true WHERE id = $1', [id]);

    const data = await getSlotsResponse();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
