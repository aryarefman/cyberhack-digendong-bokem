import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM temperature_readings ORDER BY timestamp ASC');
    
    const grouped = { A: [], B: [], C: [], D: [], E: [] };
    
    res.rows.forEach(row => {
      if (grouped[row.zone]) {
        grouped[row.zone].push({
          zone: row.zone,
          hour: row.hour,
          temperature: parseFloat(row.temperature),
          timestamp: row.timestamp.toISOString()
        });
      }
    });

    return NextResponse.json({ success: true, temperatures: grouped });
  } catch (error) {
    console.error('Error fetching cold chain data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
