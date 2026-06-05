import { Router } from 'express';
import pool from '../lib/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Ensure 'note' column exists (safe to call multiple times)
(async () => {
  try {
    await pool.query(`ALTER TABLE maintenance_tickets ADD COLUMN IF NOT EXISTS note TEXT DEFAULT NULL`);
  } catch (err) {
    // Column may already exist or table doesn't exist yet — ignore
  }
})();

// GET /api/maintenance
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_tickets ORDER BY created_at DESC');
    return res.json({ success: true, tickets: result.rows });
  } catch (error) {
    console.error('Error fetching maintenance tickets:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/maintenance
router.post('/', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { zone, description, priority, createdBy } = req.body;

    if (!zone || !description || !priority || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required (zone, description, priority, createdBy)'
      });
    }

    const ticketRes = await client.query(
      `INSERT INTO maintenance_tickets (zone, description, priority, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [zone, description, priority, createdBy]
    );

    const ticket = ticketRes.rows[0];

    const userRole = req.user?.role || 'Operator';
    await client.query(
      `INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        createdBy, userRole, 'Tiket Maintenance',
        `Buat tiket maintenance untuk Zona ${zone} — ${description.substring(0, 80)}`,
        'Cold Chain'
      ]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      ticket: {
        id: ticket.id, zone, description, priority,
        createdBy, createdAt: ticket.created_at, status: 'open'
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating maintenance ticket:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// PUT /api/maintenance/:id/note — add keterangan/note to ticket
router.put('/:id/note', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const username = req.user?.name || 'User';
  const role = req.user?.role || 'Operator';

  if (!note || !note.trim()) {
    return res.status(400).json({ success: false, error: 'Note is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ticketRes = await client.query('SELECT * FROM maintenance_tickets WHERE id = $1', [id]);
    if (ticketRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    await client.query('UPDATE maintenance_tickets SET note = $1 WHERE id = $2', [note.trim(), id]);

    await client.query(
      `INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        username, role, 'Keterangan Tiket',
        `Menambahkan keterangan pada tiket #${id}: ${note.trim().substring(0, 80)}`,
        'Cold Chain'
      ]
    );

    await client.query('COMMIT');
    return res.json({ success: true, message: `Note added to ticket #${id}` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding note to ticket:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// DELETE /api/maintenance/:id — delete a ticket
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const username = req.user?.name || 'User';
  const role = req.user?.role || 'Operator';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ticketRes = await client.query('SELECT * FROM maintenance_tickets WHERE id = $1', [id]);
    if (ticketRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    const ticket = ticketRes.rows[0];

    await client.query('DELETE FROM maintenance_tickets WHERE id = $1', [id]);

    await client.query(
      `INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        username, role, 'Hapus Tiket Maintenance',
        `Menghapus tiket maintenance #${id} di Zona ${ticket.zone}`,
        'Cold Chain'
      ]
    );

    await client.query('COMMIT');
    return res.json({ success: true, message: `Ticket #${id} deleted successfully.` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting maintenance ticket:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// PUT /api/maintenance/:id/toggle-status — toggle between open/resolved
router.put('/:id/toggle-status', requireAuth, async (req, res) => {
  const { id } = req.params;
  const username = req.user?.name || 'User';
  const role = req.user?.role || 'Operator';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ticketRes = await client.query('SELECT * FROM maintenance_tickets WHERE id = $1', [id]);
    if (ticketRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    const ticket = ticketRes.rows[0];
    const newStatus = ticket.status === 'resolved' ? 'open' : 'resolved';

    await client.query('UPDATE maintenance_tickets SET status = $1 WHERE id = $2', [newStatus, id]);

    await client.query(
      `INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        username, role,
        newStatus === 'resolved' ? 'Resolusi Tiket' : 'Buka Kembali Tiket',
        `${newStatus === 'resolved' ? 'Menyelesaikan' : 'Membuka kembali'} tiket #${id} di Zona ${ticket.zone}`,
        'Cold Chain'
      ]
    );

    await client.query('COMMIT');
    return res.json({ success: true, status: newStatus, message: `Ticket #${id} status changed to ${newStatus}` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error toggling ticket status:', error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

export default router;
