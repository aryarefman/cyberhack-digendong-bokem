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
    max: 5,
  });
}

pool = global.pgPool;

export default pool;
