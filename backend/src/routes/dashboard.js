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
    const zoneSummaryRes = await pool.query(`
      SELECT 
        s.zone,
        COUNT(DISTINCT s.id)::int AS num_slots,
        COALESCE(SUM(i.qty), 0)::float AS total_qty
      FROM slots s
      LEFT JOIN inventory i ON s.id = i.location
      WHERE s.zone IS NOT NULL AND s.zone != ''
      GROUP BY s.zone
      ORDER BY s.zone ASC
    `);

    const zoneSummary = zoneSummaryRes.rows.map(row => {
      const totalQty = row.total_qty || 0;
      const numSlots = row.num_slots || 1;
      const maxCapacity = numSlots * 500; // 500 kg/L capacity per slot
      return {
        zone: row.zone,
        itemCount: totalQty,
        totalSlots: maxCapacity,
        capacityPercent: Math.round((totalQty / maxCapacity) * 100)
      };
    });

    // Expiry Alerts
    const expiryRes = await pool.query(`
      SELECT i.id, i.name, COALESCE(s.zone, i.zone) AS zone, (i.expiry - CURRENT_DATE) AS days_left
      FROM inventory i
      LEFT JOIN slots s ON i.location = s.id
      WHERE i.status != 'Expired'
      ORDER BY (i.expiry - CURRENT_DATE) ASC
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
