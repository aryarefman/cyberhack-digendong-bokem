import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const body = await request.json();
    const { zone, description, priority, createdBy } = body;

    if (!zone || !description || !priority || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'All fields are required (zone, description, priority, createdBy)' },
        { status: 400 }
      );
    }

    // Insert maintenance ticket
    const ticketRes = await client.query(
      `INSERT INTO maintenance_tickets (zone, description, priority, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [zone, description, priority, createdBy]
    );

    const ticket = ticketRes.rows[0];

    // Insert audit log entry for the ticket creation
    await client.query(
      `INSERT INTO audit_logs (timestamp, username, role, action, detail, module) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        createdBy,
        'Operator',
        'Tiket Maintenance',
        `Buat tiket maintenance untuk Cold Storage Zona ${zone} — ${description.substring(0, 80)}`,
        'Digital Twin'
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        zone,
        description,
        priority,
        createdBy,
        createdAt: ticket.created_at,
        status: 'open'
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating maintenance ticket:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    const res = await pool.query(
      'SELECT * FROM maintenance_tickets ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, tickets: res.rows });
  } catch (error) {
    console.error('Error fetching maintenance tickets:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
