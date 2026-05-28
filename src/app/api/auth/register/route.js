import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const checkUser = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with hashed password
    const res = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    const user = res.rows[0];

    // Audit log: successful registration
    await pool.query(
      'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
      [new Date().toISOString().replace('T', ' ').substring(0, 16), user.name, user.role, 'Register', `New user ${user.name} (${user.role}) registered`, 'Auth']
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in register API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
