import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const zone = searchParams.get('zone') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    let queryText = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      queryText += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(id) LIKE $${params.length})`;
    }
    if (zone) {
      params.push(zone);
      queryText += ` AND zone = $${params.length}`;
    }
    if (category) {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }
    if (status) {
      params.push(status);
      queryText += ` AND status = $${params.length}`;
    }

    queryText += ' ORDER BY id ASC';

    const res = await pool.query(queryText, params);
    
    // Map database fields to frontend camelCase if necessary (date_in -> dateIn)
    const items = res.rows.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      qty: parseFloat(item.qty),
      unit: item.unit,
      location: item.location,
      zone: item.zone,
      dateIn: item.date_in.toISOString().split('T')[0],
      expiry: item.expiry.toISOString().split('T')[0],
      status: item.status,
      image: item.image || null
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  // Require any authenticated user
  const authError = requireAuth(request);
  if (authError) return authError;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const body = await request.json();
    const { id, name, category, qty, unit, location, zone, dateIn, expiry, status, user } = body;

    // 1. Insert into inventory
    await client.query(
      `INSERT INTO inventory (id, name, category, qty, unit, location, zone, date_in, expiry, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, name, category, qty, unit, location, zone, dateIn, expiry, status]
    );

    // 2. Update slot state to occupied (skip if UNASSIGNED)
    if (location && location !== 'UNASSIGNED') {
      await client.query(
        'UPDATE slots SET occupied = true, item_id = $1 WHERE id = $2',
        [id, location]
      );
    }

    // 3. Insert audit log
    const detail = `Menambahkan ${name} (${qty} ${unit}) di Slot ${location}`;
    await client.query(
      `INSERT INTO audit_logs (timestamp, username, role, action, detail, module) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        user?.name || 'Unknown',
        user?.role || 'Operator',
        'Tambah Stok',
        detail,
        'Settings'
      ]
    );

    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding to inventory:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request) {
  // Require QC or Admin role
  const authError = requireRole(request, ['QC', 'Admin']);
  if (authError) return authError;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const body = await request.json();
    const { id, name, category, qty, unit, location, zone, dateIn, expiry, status, user, image } = body;

    // Validate image if provided
    if (image !== undefined && image !== null) {
      const validImagePattern = /^data:image\/(jpeg|png|webp);base64,.+/;
      if (!validImagePattern.test(image)) {
        return NextResponse.json(
          { success: false, error: "Invalid image format. Supported: JPEG, PNG, WebP" },
          { status: 400 }
        );
      }
      if (image.length > 2796202) {
        return NextResponse.json(
          { success: false, error: "Image file size exceeds 2MB limit" },
          { status: 400 }
        );
      }
    }

    // Get old location to check for changes
    const oldRes = await client.query('SELECT location FROM inventory WHERE id = $1', [id]);
    const oldLocation = oldRes.rows[0]?.location;

    // 1. Update inventory
    if (image !== undefined) {
      await client.query(
        `UPDATE inventory 
         SET name = $1, category = $2, qty = $3, unit = $4, location = $5, zone = $6, date_in = $7, expiry = $8, status = $9, image = $10
         WHERE id = $11`,
        [name, category, qty, unit, location, zone, dateIn, expiry, status, image, id]
      );
    } else {
      await client.query(
        `UPDATE inventory 
         SET name = $1, category = $2, qty = $3, unit = $4, location = $5, zone = $6, date_in = $7, expiry = $8, status = $9
         WHERE id = $10`,
        [name, category, qty, unit, location, zone, dateIn, expiry, status, id]
      );
    }

    // 2. Handle slot location changes
    if (oldLocation && oldLocation !== location) {
      // Free old slot
      await client.query('UPDATE slots SET occupied = false, item_id = null WHERE id = $1', [oldLocation]);
      // Occupy new slot
      await client.query('UPDATE slots SET occupied = true, item_id = $1 WHERE id = $2', [id, location]);
    }

    // 3. Insert audit log
    const detail = `Mengubah data bahan baku ${name} (ID: ${id})`;
    await client.query(
      `INSERT INTO audit_logs (timestamp, username, role, action, detail, module) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        user?.name || 'Unknown',
        user?.role || 'Operator',
        'Edit Data',
        detail,
        'Settings'
      ]
    );

    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating inventory:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(request) {
  // Require QC or Admin role
  const authError = requireRole(request, ['QC', 'Admin']);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userName = searchParams.get('userName') || 'Unknown';
  const userRole = searchParams.get('userRole') || 'Operator';

  if (!id) {
    return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get item name and location for log details
    const itemRes = await client.query('SELECT name, location FROM inventory WHERE id = $1', [id]);
    const item = itemRes.rows[0];

    if (!item) {
      throw new Error('Bahan baku tidak ditemukan');
    }

    // 1. Free up the slot in slots table
    await client.query('UPDATE slots SET occupied = false, item_id = null WHERE id = $1', [item.location]);

    // 2. Delete item from inventory table
    await client.query('DELETE FROM inventory WHERE id = $1', [id]);

    // 3. Insert audit log
    const detail = `Menghapus data bahan baku ${item.name} (ID: ${id}) dari database`;
    await client.query(
      `INSERT INTO audit_logs (timestamp, username, role, action, detail, module) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        userName,
        userRole,
        'Hapus Data',
        detail,
        'Settings'
      ]
    );

    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting from inventory:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
