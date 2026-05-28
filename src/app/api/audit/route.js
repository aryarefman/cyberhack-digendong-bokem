import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, role, action, detail, module } = body;
    
    if (!username || !action || !detail) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
      [new Date().toISOString().replace('T', ' ').substring(0, 16), username, role || 'Unknown', action, detail, module || 'System']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    let queryText = `
      SELECT audit_logs.*, users.avatar 
      FROM audit_logs 
      LEFT JOIN users ON audit_logs.username = users.name 
      WHERE 1=1
    `;
    const params = [];

    if (user) {
      params.push(user);
      queryText += ` AND audit_logs.username = $${params.length}`;
    }
    if (dateFrom) {
      params.push(dateFrom);
      queryText += ` AND SUBSTRING(audit_logs.timestamp FROM 1 FOR 10) >= $${params.length}`;
    }
    if (dateTo) {
      params.push(dateTo);
      queryText += ` AND SUBSTRING(audit_logs.timestamp FROM 1 FOR 10) <= $${params.length}`;
    }

    queryText += ' ORDER BY audit_logs.id DESC'; // Newest logs first

    const res = await pool.query(queryText, params);
    
    const logs = res.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      user: row.username,
      role: row.role,
      action: row.action,
      detail: row.detail,
      module: row.module,
      avatar: row.avatar || null
    }));

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
