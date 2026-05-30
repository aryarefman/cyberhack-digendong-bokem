import { Router } from 'express';
import { body, query } from 'express-validator';
import bcrypt from 'bcryptjs';
import pool from '../lib/db.js';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const AVATAR_MAX_LENGTH = 2796202;
const AVATAR_FORMAT_REGEX = /^data:image\/(png|jpeg|webp);base64,/;

// Validation rules
const getProfileValidation = [
  query('userId').notEmpty().withMessage('userId parameter is required'),
];

const updateProfileValidation = [
  body('userId').notEmpty().withMessage('userId is required'),
];

const adminEditValidation = [
  body('targetUserId').notEmpty().withMessage('targetUserId is required'),
];

// GET /api/profile?userId=...
router.get('/', validate(getProfileValidation), async (req, res) => {
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
router.put('/', validate(updateProfileValidation), async (req, res) => {
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

// PUT /api/profile/admin-edit — Admin edits another user's profile
router.put('/admin-edit', requireRole(['ADMIN']), validate(adminEditValidation), async (req, res) => {
  try {
    const { targetUserId, name, email, role, avatar } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'targetUserId is required' });
    }

    // Fetch target user
    const targetRes = await pool.query('SELECT id, name, email, role, avatar FROM users WHERE id = $1', [targetUserId]);
    if (targetRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Target user not found' });
    }

    const targetUser = targetRes.rows[0];

    // Build dynamic update
    const updates = [];
    const values = [];
    let paramIdx = 1;
    const changedFields = [];

    if (name !== undefined && name !== targetUser.name) {
      updates.push(`name = $${paramIdx++}`);
      values.push(name);
      changedFields.push('name');
    }
    if (email !== undefined && email !== targetUser.email) {
      updates.push(`email = $${paramIdx++}`);
      values.push(email);
      changedFields.push('email');
    }
    if (role !== undefined && role !== targetUser.role) {
      updates.push(`role = $${paramIdx++}`);
      values.push(role);
      changedFields.push('role');
    }
    if (avatar !== undefined && avatar !== targetUser.avatar) {
      updates.push(`avatar = $${paramIdx++}`);
      values.push(avatar);
      changedFields.push('avatar');
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: 'No changes detected' });
    }

    // Execute update
    values.push(targetUserId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
      values
    );

    // Get admin name from the authenticated user
    const adminName = req.user.name || req.user.username || 'Admin';
    const employeeName = name || targetUser.name || 'Employee';
    const fieldsStr = changedFields.join(', ');

    // Create audit log entry
    await pool.query(
      'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        adminName,
        'Admin',
        'Admin Edit Profile',
        `Admin updated ${fieldsStr} for ${employeeName}`,
        'User Management'
      ]
    );

    return res.json({ success: true, updatedFields: changedFields });
  } catch (error) {
    console.error('Error in admin profile edit:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
