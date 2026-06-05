import { Router } from 'express';
import pool from '../lib/db.js';

const router = Router();

const ZONE_BASES = {
  A: { base: 24.5, min: 20, max: 28, anomalyTarget: 30.5 },
  B: { base: 20.0, min: 15, max: 25, anomalyTarget: 27.5 },
  C: { base: 22.0, min: 18, max: 24, anomalyTarget: 26.5 },
  D: { base: -2.0, min: -5, max: 5, anomalyTarget: 7.2 },
  E: { base: 19.5, min: 15, max: 25, anomalyTarget: 27.5 }
};

const zoneStates = {
  A: { anomalyActive: false, anomalyDuration: 0 },
  B: { anomalyActive: false, anomalyDuration: 0 },
  C: { anomalyActive: false, anomalyDuration: 0 },
  D: { anomalyActive: false, anomalyDuration: 0 },
  E: { anomalyActive: false, anomalyDuration: 0 }
};

// GET /api/cold-chain
router.get('/', async (req, res) => {
  try {
    // 1. Get the latest reading to check elapsed time
    const lastReadingsRes = await pool.query(
      'SELECT DISTINCT ON (zone) zone, temperature, timestamp FROM temperature_readings ORDER BY zone, timestamp DESC'
    );

    const lastTemps = {};
    let maxTimestamp = 0;

    lastReadingsRes.rows.forEach(r => {
      lastTemps[r.zone] = parseFloat(r.temperature);
      const ts = new Date(r.timestamp).getTime();
      if (ts > maxTimestamp) maxTimestamp = ts;
    });

    const now = new Date();
    const timeDiff = now.getTime() - maxTimestamp;

    // Simulate new reading if more than 5 seconds have passed or no readings exist
    if (timeDiff >= 5000 || lastReadingsRes.rowCount === 0) {
      for (const zone of ['A', 'B', 'C', 'D', 'E']) {
        const config = ZONE_BASES[zone];
        let state = zoneStates[zone];

        // Anomaly duration and state management
        if (state.anomalyActive) {
          state.anomalyDuration -= 1;
          if (state.anomalyDuration <= 0) {
            state.anomalyActive = false;
          }
        } else {
          // 3% chance to trigger an anomaly
          if (Math.random() < 0.03) {
            state.anomalyActive = true;
            state.anomalyDuration = Math.floor(Math.random() * 12) + 8; // 8 to 20 steps
          }
        }

        const target = state.anomalyActive ? config.anomalyTarget : config.base;
        const lastTemp = lastTemps[zone] ?? config.base;

        let newTemp;
        const diff = target - lastTemp;
        if (Math.abs(diff) < 0.25) {
          // Fluctuate around target
          newTemp = target + (Math.random() * 0.4 - 0.2);
        } else {
          // Drifts towards target
          newTemp = lastTemp + Math.sign(diff) * (Math.random() * 0.3 + 0.1);
        }
        newTemp = parseFloat(newTemp.toFixed(1));

        const hourStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        // Insert new reading
        await pool.query(
          'INSERT INTO temperature_readings (zone, hour, temperature, timestamp) VALUES ($1, $2, $3, $4)',
          [zone, hourStr, newTemp, now]
        );

        // Prune older readings for this zone to keep only the last 30
        await pool.query(
          `DELETE FROM temperature_readings 
           WHERE id NOT IN (
             SELECT id FROM temperature_readings 
             WHERE zone = $1 
             ORDER BY timestamp DESC 
             LIMIT 30
           ) AND zone = $1`,
          [zone]
        );
      }
    }

    // 2. Fetch the latest 30 readings for each zone to return to frontend
    const result = await pool.query('SELECT * FROM temperature_readings ORDER BY timestamp ASC');

    const grouped = { A: [], B: [], C: [], D: [], E: [] };

    result.rows.forEach(row => {
      if (grouped[row.zone]) {
        grouped[row.zone].push({
          zone: row.zone,
          hour: row.hour,
          temperature: parseFloat(row.temperature),
          timestamp: row.timestamp.toISOString()
        });
      }
    });

    return res.json({ success: true, temperatures: grouped });
  } catch (error) {
    console.error('Error fetching cold chain data:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
