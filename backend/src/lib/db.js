import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

let pool;

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20,
  });
}

pool = global.pgPool;

/**
 * Health check query to verify database connectivity.
 * Returns true if the database is reachable, false otherwise.
 */
export async function healthCheck() {
  try {
    const result = await pool.query('SELECT 1 AS ok');
    return result.rows[0]?.ok === 1;
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return false;
  }
}

export default pool;
