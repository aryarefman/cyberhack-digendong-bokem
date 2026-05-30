import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../lib/db.js';

const router = Router();

const AVATAR_MAX_LENGTH = 2796202;
const AVATAR_FORMAT_REGEX = /^data:image\/(png|jpeg|webp);base64,/;

// GET /api/profile?userId=...
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId parameter is required' });
    }

    const result = await pool.query(
      'SELECT id, name, email, role, avatar FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/profile
router.put('/', async (req, res) => {
  try {
    const { userId, name, email, currentPassword, newPassword, avatar } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    // Avatar update flow
    if (avatar !== undefined) {
      const isBase64 = AVATAR_FORMAT_REGEX.test(avatar);
      const isUrl = /^https?:\/\/.+/.test(avatar);
      if (!isBase64 && !isUrl) {
        return res.status(400).json({ success: false, error: 'Format gambar tidak didukung atau URL tidak valid.' });
      }

      if (avatar.length > AVATAR_MAX_LENGTH) {
        return res.status(400).json({ success: false, error: 'Avatar file size exceeds 2MB limit' });
      }

      const userRes = await pool.query('SELECT id, name FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatar, userId]);

      const avatarUserName = userRes.rows[0].name || 'User';
      await pool.query(
        'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
        [new Date().toISOString().replace('T', ' ').substring(0, 16), avatarUserName, 'User', 'Upload Avatar', 'Updated profile photo', 'Settings']
      );

      return res.json({ success: true });
    }

    if (newPassword) {
      // Password change flow
      const userRes = await pool.query('SELECT password, name FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, userRes.rows[0].password);
      if (!isValidPassword) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, userId]);

      const pwUserName = userRes.rows[0].name || 'User';
      await pool.query(
        'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
        [new Date().toISOString().replace('T', ' ').substring(0, 16), pwUserName, 'User', 'Change Password', 'Password changed successfully', 'Settings']
      );
    } else {
      // Profile update flow
      const userRes = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, userId]);

      await pool.query(
        'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
        [new Date().toISOString().replace('T', ' ').substring(0, 16), name || 'Unknown', 'User', 'Edit Profile', 'Updated profile information', 'Settings']
      );
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
