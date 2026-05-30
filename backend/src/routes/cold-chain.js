import { Router } from 'express';
import pool from '../lib/db.js';

const router = Router();

// GET /api/cold-chain
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM temperature_readings ORDER BY timestamp ASC');

    const grouped = { A: [], B: [], C: [], D: [], E: [] };

    result.rows.forEach(row => {
      if (grouped[row.zone]) {
        grouped[row.zone].push({
          zone: row.zone,
          hour: row.hour,
          temperature: parseFloat(row.temperature),
          timestamp: row.timestamp.toISOString()
        });
      }
    });

    return res.json({ success: true, temperatures: grouped });
  } catch (error) {
    console.error('Error fetching cold chain data:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
