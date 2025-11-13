// services/productos.service.js
const { pool } = require('./db.service');

module.exports = {
  list: async () => (await pool.query('SELECT * FROM productos'))[0],
  get:  async (id) => (await pool.query('SELECT * FROM productos WHERE id=?',[id]))[0][0],
  create: async ({ nombre, precio, stock = 0, activo = 1 }) =>
    (await pool.query(
      'INSERT INTO productos (nombre, precio, stock, activo) VALUES (?,?,?,?)',
      [nombre, precio, stock, activo]
    ))[0].insertId,
  update: async (id, data) => {
    const sets = [], vals = [];
    if (data.nombre !== undefined) { sets.push('nombre=?'); vals.push(data.nombre); }
    if (data.precio !== undefined) { sets.push('precio=?'); vals.push(data.precio); }
    if (data.stock  !== undefined) { sets.push('stock=?');  vals.push(data.stock); }
    if (data.activo !== undefined) { sets.push('activo=?'); vals.push(data.activo ? 1 : 0); }
    if (!sets.length) return 0;
    vals.push(id);
    const [r] = await pool.query(`UPDATE productos SET ${sets.join(', ')} WHERE id=?`, vals);
    return r.affectedRows;
  },
  remove: async (id) => (await pool.query('DELETE FROM productos WHERE id=?',[id]))[0].affectedRows
};
