const { Pool } = require('pg');
require('dotenv').config();

// Professional Database Pooling Configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Best practices for ERP scalability:
  max: 20, // max number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Preliminary connection test
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err.message);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
