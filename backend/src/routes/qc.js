import { Router } from 'express';
import { body } from 'express-validator';
import pool from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Validation rules
const inspectValidation = [
  body('materialId').notEmpty().withMessage('materialId is required'),
  body('materialType').notEmpty().withMessage('materialType is required')
    .isIn(['fruit', 'raw-material', 'extract', 'powder']).withMessage('materialType must be one of: fruit, raw-material, extract, powder'),
  body('result').notEmpty().withMessage('result is required')
    .isIn(['pass', 'fail']).withMessage('result must be "pass" or "fail"'),
  body('confidence').notEmpty().withMessage('confidence is required')
    .isFloat({ min: 0, max: 100 }).withMessage('confidence must be between 0 and 100'),
];

// POST /api/qc/inspect — Submit a QC inspection
router.post('/inspect', requireAuth, validate(inspectValidation), async (req, res) => {
  try {
    const { imageBase64, materialType, materialId, result, confidence, notes } = req.body;

    if (!materialId || !materialType || !result || confidence === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: materialId, materialType, result, confidence'
      });
    }

    if (!['pass', 'fail'].includes(result)) {
      return res.status(400).json({
        success: false,
        error: 'Result must be "pass" or "fail"'
      });
    }

    if (confidence < 0 || confidence > 100) {
      return res.status(400).json({
        success: false,
        error: 'Confidence must be between 0 and 100'
      });
    }

    const inspectedBy = req.user?.id || null;

    const insertResult = await pool.query(
      `INSERT INTO qc_inspections (material_id, material_type, result, confidence, notes, image, inspected_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [materialId, materialType, result, confidence, notes || null, imageBase64 || null, inspectedBy]
    );

    const inspection = insertResult.rows[0];

    // Create audit trail entry
    const username = req.user?.name || 'System';
    const role = req.user?.role || 'Unknown';
    await pool.query(
      'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        new Date().toISOString().replace('T', ' ').substring(0, 16),
        username,
        role,
        'QC Inspection',
        `QC inspection for ${materialType} (${materialId}): ${result.toUpperCase()} (${confidence}% confidence)`,
        'QC'
      ]
    );

    return res.json({
      success: true,
      inspection: {
        id: inspection.id,
        materialId: inspection.material_id,
        materialType: inspection.material_type,
        result: inspection.result,
        confidence: parseFloat(inspection.confidence),
        notes: inspection.notes,
        inspectedBy: inspection.inspected_by,
        inspectedAt: inspection.inspected_at
      }
    });
  } catch (error) {
    console.error('Error creating QC inspection:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/qc/history — Get inspection history, optionally filtered by materialId
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { materialId } = req.query;

    let queryText = 'SELECT * FROM qc_inspections';
    const params = [];

    if (materialId) {
      params.push(materialId);
      queryText += ` WHERE material_id = $${params.length}`;
    }

    queryText += ' ORDER BY inspected_at DESC';

    const result = await pool.query(queryText, params);

    const inspections = result.rows.map(row => ({
      id: row.id,
      materialId: row.material_id,
      materialType: row.material_type,
      result: row.result,
      confidence: parseFloat(row.confidence),
      notes: row.notes,
      image: row.image,
      inspectedBy: row.inspected_by,
      inspectedAt: row.inspected_at
    }));

    return res.json({ success: true, inspections });
  } catch (error) {
    console.error('Error fetching QC history:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
