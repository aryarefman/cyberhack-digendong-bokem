import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../lib/db.js';
import { signJwt } from '../utils/jwt.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email dan password wajib diisi' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password, role, avatar FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, error: 'Kredensial tidak valid' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Kredensial tidak valid' });
    }

    // Audit log: successful login
    await pool.query(
      'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
      [new Date().toISOString().replace('T', ' ').substring(0, 16), user.name, user.role, 'Login', `User ${user.name} logged in successfully`, 'Auth']
    );

    // Sign JWT
    const token = await signJwt({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }, '2h');

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null
      }
    });
  } catch (error) {
    console.error('Error in login API:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Semua field wajib diisi' });
    }

    const checkUser = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    const user = result.rows[0];

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
      [new Date().toISOString().replace('T', ' ').substring(0, 16), user.name, user.role, 'Register', `New user ${user.name} (${user.role}) registered`, 'Auth']
    );

    // Sign JWT for auto-login after register
    const token = await signJwt({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }, '2h');

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in register API:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;
