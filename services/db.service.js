// services/db.service.js
const mysql = require('mysql2/promise');

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno ${name}`);
  return v;
}

const pool = mysql.createPool({
  host: required('DB_HOST'),
  port: Number(process.env.DB_PORT || 3306),
  user: required('DB_USER'),
  password: process.env.DB_PASS || '',
  database: required('DB_NAME'),

  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0,

  // robustez en servidores
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 10000), // 10s
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // ayuda con fechas
  timezone: 'Z',
  dateStrings: true,
});

// (Opcional pero MUY útil) test al levantar el backend
async function testDbConnection() {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 AS ok');
    conn.release();
    console.log('✅ DB conectada:', rows[0]);
  } catch (err) {
    console.error('❌ DB NO conectada:', err.message);
  }
}

module.exports = { pool, testDbConnection };
