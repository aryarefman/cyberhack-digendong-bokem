import { Router } from 'express';
import pool from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Ensure app_settings table exists (safe to run on every startup)
pool.query(`
  CREATE TABLE IF NOT EXISTS app_settings (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings_key VARCHAR(100) NOT NULL,
    settings_value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, settings_key)
  )
`).catch(err => console.error('app_settings table init error:', err));

// GET /api/zones — fetch saved floor plan zones for the current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT settings_value FROM app_settings WHERE user_id = $1 AND settings_key = $2',
      [userId, 'floor_plan_zones']
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: result.rows[0].settings_value });
  } catch (err) {
    console.error('GET /api/zones error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/zones — save floor plan zones for the current user
router.put('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { floors } = req.body;

    if (!floors) {
      return res.status(400).json({ success: false, error: 'Missing floors data' });
    }

    await pool.query(
      `INSERT INTO app_settings (user_id, settings_key, settings_value, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, settings_key)
       DO UPDATE SET settings_value = $3, updated_at = NOW()`,
      [userId, 'floor_plan_zones', JSON.stringify(floors)]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/zones error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
