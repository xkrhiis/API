// services/mermas.service.js
const { pool } = require('./db.service');

// Listar mermas (con joins a productos y usuarios)
async function list() {
  const [rows] = await pool.query(
    `
    SELECT
      m.id,
      m.producto_id,
      p.nombre AS producto_nombre,
      m.lote,
      m.cantidad,
      m.causa       AS motivo,   -- 👈 columna REAL 'causa', expuesta como 'motivo'
      m.detalle,
      m.fecha_merma,
      m.registrado_por,
      u.username    AS registrado_por_nombre,
      m.creado_en
    FROM mermas m
    LEFT JOIN productos p ON p.id = m.producto_id
    LEFT JOIN usuarios  u ON u.id = m.registrado_por
    ORDER BY m.fecha_merma DESC, m.id DESC
    `
  );
  return rows;
}

// Obtener una merma por id
async function getById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      m.id,
      m.producto_id,
      p.nombre AS producto_nombre,
      m.lote,
      m.cantidad,
      m.causa       AS motivo,
      m.detalle,
      m.fecha_merma,
      m.registrado_por,
      u.username    AS registrado_por_nombre,
      m.creado_en
    FROM mermas m
    LEFT JOIN productos p ON p.id = m.producto_id
    LEFT JOIN usuarios  u ON u.id = m.registrado_por
    WHERE m.id = ?
    `,
    [id]
  );
  return rows[0] || null;
}

// Crear una nueva merma
async function create(data) {
  const {
    producto_id,
    lote,
    cantidad,
    motivo,          // 👈 viene del frontend
    detalle,
    fecha_merma,
    registrado_por,
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO mermas
      (producto_id, lote, cantidad, causa, detalle, fecha_merma, registrado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      producto_id,
      lote || null,
      cantidad,
      motivo,        // 👈 se guarda en la columna 'causa'
      detalle || null,
      fecha_merma,
      registrado_por,
    ]
  );

  return result.insertId;
}

// Eliminar una merma
async function remove(id) {
  const [result] = await pool.query(
    `DELETE FROM mermas WHERE id = ?`,
    [id]
  );
  return result.affectedRows; // 0 si no existía, 1 si se borró
}

module.exports = {
  list,
  getById,
  create,
  remove,
};
