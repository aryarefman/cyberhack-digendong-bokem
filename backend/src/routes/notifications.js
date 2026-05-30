import { Router } from 'express';
import { body } from 'express-validator';
import pool from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Validation rules
const markReadValidation = [
  body('notificationIds').isArray({ min: 1 }).withMessage('notificationIds must be a non-empty array'),
  body('notificationIds.*').isString().withMessage('Each notification ID must be a string'),
];

// GET /api/notifications/read-state
// Returns array of read notification IDs for the authenticated user
router.get('/read-state', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT notification_id FROM notification_reads WHERE user_id = $1',
      [userId]
    );

    const readIds = result.rows.map(row => row.notification_id);
    return res.json({ success: true, readIds });
  } catch (error) {
    // If table doesn't exist, create it and return empty
    if (error.code === '42P01') {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS notification_reads (
            user_id INTEGER NOT NULL,
            notification_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (user_id, notification_id)
          )
        `);
        return res.json({ success: true, readIds: [] });
      } catch (createErr) {
        console.error('Error creating notification_reads table:', createErr);
      }
    }
    console.error('Error fetching notification read state:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch notification read state' });
  }
});

// POST /api/notifications/mark-read
// Body: { notificationIds: string[] }
// Marks specific notifications as read for the authenticated user
router.post('/mark-read', requireAuth, validate(markReadValidation), async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ success: false, error: 'notificationIds must be a non-empty array' });
    }

    // Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_reads (
        user_id INTEGER NOT NULL,
        notification_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, notification_id)
      )
    `);

    // Use INSERT ... ON CONFLICT to handle duplicates gracefully
    const values = notificationIds.map((id, idx) => `($1, $${idx + 2})`).join(', ');
    const params = [userId, ...notificationIds];

    await pool.query(
      `INSERT INTO notification_reads (user_id, notification_id) VALUES ${values} ON CONFLICT (user_id, notification_id) DO NOTHING`,
      params
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
  }
});

// POST /api/notifications/mark-all-read
// Marks all current notifications as read for the authenticated user
// Body: { notificationIds: string[] } - all notification IDs to mark as read
router.post('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.json({ success: true });
    }

    // Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_reads (
        user_id INTEGER NOT NULL,
        notification_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, notification_id)
      )
    `);

    const values = notificationIds.map((id, idx) => `($1, $${idx + 2})`).join(', ');
    const params = [userId, ...notificationIds];

    await pool.query(
      `INSERT INTO notification_reads (user_id, notification_id) VALUES ${values} ON CONFLICT (user_id, notification_id) DO NOTHING`,
      params
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
  }
});

export default router;
