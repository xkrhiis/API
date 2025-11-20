// services/registros.service.js
const { pool } = require('./db.service');

const BASE_SELECT = `
  SELECT
    r.id,
    r.fecha_registro,
    r.lote,
    r.precio       AS precio_unitario,
    r.stock        AS cantidad,
    p.id           AS producto_id,
    p.nombre       AS producto,
    p.color        AS color,
    p.fecha_ingreso,
    p.fecha_limite,
    u.id           AS usuario_id,
    u.username     AS usuario
  FROM registros_inventario r
  JOIN productos p ON p.id = r.producto_id
  JOIN usuarios  u ON u.id = r.usuario_id
`;

// Listar todos los registros, del más nuevo al más antiguo
async function list() {
  const [rows] = await pool.query(
    `${BASE_SELECT} ORDER BY r.fecha_registro DESC, r.id DESC`
  );
  return rows;
}

// data: { fecha_registro?, lote, producto_id, precio_unitario, cantidad, usuario_id }
async function create(data) {
  const {
    fecha_registro,
    lote,
    producto_id,
    precio_unitario,
    cantidad,
    usuario_id,
  } = data;

  let sql;
  let params;

  if (fecha_registro) {
    sql = `
      INSERT INTO registros_inventario
        (fecha_registro, lote, producto_id, precio, stock, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    params = [
      fecha_registro,
      lote,
      producto_id,
      precio_unitario,
      cantidad,
      usuario_id,
    ];
  } else {
    sql = `
      INSERT INTO registros_inventario
        (lote, producto_id, precio, stock, usuario_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    params = [lote, producto_id, precio_unitario, cantidad, usuario_id];
  }

  const [result] = await pool.query(sql, params);
  return result.insertId;
}

module.exports = {
  list,
  create,
};
