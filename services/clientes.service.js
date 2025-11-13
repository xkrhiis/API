// services/clientes.service.js
const { pool } = require('./db.service'); // o usa tu wrapper DB

module.exports = {
  list: async () => (await pool.query('SELECT * FROM clientes'))[0],
  get:  async (id) => (await pool.query('SELECT * FROM clientes WHERE id=?',[id]))[0][0],
};
