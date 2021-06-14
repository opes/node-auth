import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE && { rejectUnauthorized: false },
});

pool.on('connect', () => console.log('Postgres connected'));

export default pool;
