const { pool } = require('./db.service');
module.exports = {
  list: async () => (await pool.query('SELECT * FROM pedidos'))[0],
  get:  async (id) => (await pool.query('SELECT * FROM pedidos WHERE id=?',[id]))[0][0],
  items: async (id) => (await pool.query(`
    SELECT i.*, p.nombre
    FROM pedido_items i
    JOIN productos p ON p.id = i.producto_id
    WHERE i.pedido_id=?`, [id]))[0],
};
