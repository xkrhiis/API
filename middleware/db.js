// middleware/db.js
const mysql = require('mysql2/promise');

class DB {
  constructor(config) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  // Selects / DML que devuelven filas
  async query(sql, params = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  // Inserts/Updates/Deletes (para revisar affectedRows, insertId)
  async exec(sql, params = []) {
    const [result] = await this.pool.execute(sql, params);
    return result; // { affectedRows, insertId, warningStatus, ... }
  }
}

module.exports = DB;
