import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT s.id, s.zone, s.row, s.col, s.occupied, s.item_id, 
             i.name as item_name, i.qty as item_qty, i.unit as item_unit, 
             i.category as item_category, i.expiry as item_expiry, i.status as item_status
      FROM slots s
      LEFT JOIN inventory i ON s.item_id = i.id
      ORDER BY s.id ASC
    `);

    const slots = res.rows.map(row => ({
      id: row.id,
      zone: row.zone,
      row: row.row,
      col: parseInt(row.col),
      occupied: row.occupied,
      itemId: row.item_id,
      item: row.occupied ? {
        id: row.item_id,
        name: row.item_name,
        qty: parseFloat(row.item_qty),
        unit: row.item_unit,
        category: row.item_category,
        expiry: row.item_expiry ? row.item_expiry.toISOString().split('T')[0] : null,
        status: row.item_status
      } : null
    }));

    return NextResponse.json({ success: true, slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
