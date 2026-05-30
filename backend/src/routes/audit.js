import { Router } from 'express';
import pool from '../lib/db.js';

const router = Router();

// GET /api/audit
router.get('/', async (req, res) => {
  try {
    const { user = '', dateFrom = '', dateTo = '' } = req.query;

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

    queryText += ' ORDER BY audit_logs.id DESC';

    const result = await pool.query(queryText, params);

    const logs = result.rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      user: row.username,
      role: row.role,
      action: row.action,
      detail: row.detail,
      module: row.module,
      avatar: row.avatar || null
    }));

    return res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/audit
router.post('/', async (req, res) => {
  try {
    const { username, role, action, detail, module } = req.body;

    if (!username || !action || !detail) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await pool.query(
      'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
      [new Date().toISOString().replace('T', ' ').substring(0, 16), username, role || 'Unknown', action, detail, module || 'System']
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
