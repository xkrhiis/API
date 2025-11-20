// services/productos.service.js
const { pool } = require('./db.service');

// Obtener solo productos activos
async function list() {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      nombre,
      lote,
      color,
      fecha_ingreso,
      fecha_limite,
      precio,
      stock,
      min,
      activo,
      creado_en
    FROM productos
    WHERE activo = 1
    ORDER BY id
    `
  );
  return rows;
}

// Obtener un producto por id
async function getById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      nombre,
      lote,
      color,
      fecha_ingreso,
      fecha_limite,
      precio,
      stock,
      min,
      activo,
      creado_en
    FROM productos
    WHERE id = ?
    `,
    [id]
  );
  return rows[0] || null;
}

// Crear producto
async function create(data) {
  const {
    nombre,
    lote,
    color,
    fecha_ingreso,
    fecha_limite,
    precio,
    stock,
    min,
    activo,
  } = data;

  // si no viene "activo" desde el front, lo damos por activo (1)
  const activoFlag = (activo === 0 || activo === false) ? 0 : 1;

  const [result] = await pool.query(
    `
    INSERT INTO productos
      (nombre, lote, color, fecha_ingreso, fecha_limite, precio, stock, min, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      nombre,
      lote || null,
      color || null,
      fecha_ingreso,
      fecha_limite || null,
      precio,
      stock,
      min ?? 0,
      activoFlag,
    ]
  );

  return result.insertId;
}

// Actualizar producto (para PATCH /api/productos/:id)
async function update(id, data) {
  const {
    nombre,
    lote,
    color,
    fecha_ingreso,
    fecha_limite,
    precio,
    stock,
    min,
    activo,
  } = data;

  const activoFlag = (activo === 0 || activo === false) ? 0 : 1;

  const [result] = await pool.query(
    `
    UPDATE productos
    SET
      nombre        = ?,
      lote          = ?,
      color         = ?,
      fecha_ingreso = ?,
      fecha_limite  = ?,
      precio        = ?,
      stock         = ?,
      min           = ?,
      activo        = ?
    WHERE id = ?
    `,
    [
      nombre,
      lote || null,
      color || null,
      fecha_ingreso,
      fecha_limite || null,
      precio,
      stock,
      min ?? 0,
      activoFlag,
      id,
    ]
  );

  // true si se actualizó al menos 1 fila
  return result.affectedRows > 0;
}

/**
 * Eliminar producto:
 *  - Borra primero los registros de historial (registros_inventario)
 *  - Luego borra el producto de la tabla productos
 * Devuelve cantidad de filas afectadas en productos.
 */
async function remove(id) {
  // 1) Borrar historial de ese producto
  await pool.query(
    `DELETE FROM registros_inventario WHERE producto_id = ?`,
    [id]
  );

  // 2) Borrar el producto
  const [result] = await pool.query(
    `DELETE FROM productos WHERE id = ?`,
    [id]
  );

  return result.affectedRows; // 0 si no existía, 1 si se borró
}

module.exports = {
  list,
  getById,
  create,
  update,   // <-- importante exportar
  remove,
};
