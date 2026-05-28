import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // --- Weekly Trend (optimized single query instead of 7 sequential queries) ---
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

    // --- Zone Summary ---
    // Count items per zone from inventory, get total slots per zone from slots table
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

    // --- Expiry Alerts ---
    // Top 5 non-expired items sorted by ascending days-to-expiry (expiry - today)
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

    // --- Quick Stats ---
    // totalCategories: count of unique categories
    const catRes = await pool.query(`SELECT COUNT(DISTINCT category)::int AS total FROM inventory`);
    const totalCategories = catRes.rows[0].total;

    // avgDaysToExpiry: average days to expiry for non-expired items
    const avgRes = await pool.query(`
      SELECT COALESCE(ROUND(AVG(expiry - CURRENT_DATE))::int, 0) AS avg_days
      FROM inventory
      WHERE status != 'Expired'
    `);
    const avgDaysToExpiry = avgRes.rows[0].avg_days;

    // expiredCount: count of items with status 'Expired'
    const expiredRes = await pool.query(`SELECT COUNT(*)::int AS count FROM inventory WHERE status = 'Expired'`);
    const expiredCount = expiredRes.rows[0].count;

    const quickStats = {
      totalCategories,
      avgDaysToExpiry,
      expiredCount
    };

    return NextResponse.json({
      success: true,
      weeklyTrend,
      zoneSummary,
      expiryAlerts,
      quickStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
