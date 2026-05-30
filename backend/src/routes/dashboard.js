import { Router } from 'express';
import pool from '../lib/db.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    // Weekly Trend
    const weeklyTrendRes = await pool.query(`
      SELECT 
        d.date::date AS date,
        COUNT(i.id)::int AS count
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::interval
      ) AS d(date)
      LEFT JOIN inventory i ON i.date_in <= d.date AND i.status != 'Expired'
      GROUP BY d.date
      ORDER BY d.date ASC
    `);

    const weeklyTrend = weeklyTrendRes.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      count: row.count
    }));

    // Zone Summary
    const itemCountRes = await pool.query(`
      SELECT zone, COUNT(*)::int AS item_count FROM inventory GROUP BY zone ORDER BY zone ASC
    `);
    const slotCountRes = await pool.query(`
      SELECT zone, COUNT(*)::int AS total_slots FROM slots GROUP BY zone ORDER BY zone ASC
    `);

    const slotMap = {};
    for (const row of slotCountRes.rows) {
      slotMap[row.zone] = row.total_slots;
    }

    const zoneSummary = itemCountRes.rows.map(row => {
      const totalSlots = slotMap[row.zone] || 1;
      return {
        zone: row.zone,
        itemCount: row.item_count,
        totalSlots,
        capacityPercent: Math.round((row.item_count / totalSlots) * 100)
      };
    });

    // Expiry Alerts
    const expiryRes = await pool.query(`
      SELECT id, name, zone, (expiry - CURRENT_DATE) AS days_left
      FROM inventory
      WHERE status != 'Expired'
      ORDER BY (expiry - CURRENT_DATE) ASC
      LIMIT 5
    `);

    const expiryAlerts = expiryRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      zone: row.zone,
      daysLeft: parseInt(row.days_left, 10)
    }));

    // Quick Stats
    const catRes = await pool.query(`SELECT COUNT(DISTINCT category)::int AS total FROM inventory`);
    const totalCategories = catRes.rows[0].total;

    const avgRes = await pool.query(`
      SELECT COALESCE(ROUND(AVG(expiry - CURRENT_DATE))::int, 0) AS avg_days
      FROM inventory
      WHERE status != 'Expired'
    `);
    const avgDaysToExpiry = avgRes.rows[0].avg_days;

    const expiredRes = await pool.query(`SELECT COUNT(*)::int AS count FROM inventory WHERE status = 'Expired'`);
    const expiredCount = expiredRes.rows[0].count;

    const quickStats = { totalCategories, avgDaysToExpiry, expiredCount };

    return res.json({
      success: true,
      weeklyTrend,
      zoneSummary,
      expiryAlerts,
      quickStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
