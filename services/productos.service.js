// services/productos.service.js
const { pool } = require('./db.service');

// Helpers
function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

function toIntOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function toNumberOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeProductoInput(data = {}, { partial = false } = {}) {
  const out = {};

  if (!partial || data.nombre !== undefined) {
    const nombre = String(data.nombre ?? '').trim();
    if (!nombre) throw httpError(400, 'nombre es requerido');
    out.nombre = nombre;
  }

  if (!partial || data.lote !== undefined) {
    out.lote = data.lote ? String(data.lote).trim() : null;
  }

  if (!partial || data.color !== undefined) {
    out.color = data.color ? String(data.color).trim() : null;
  }

  if (!partial || data.fecha_ingreso !== undefined) {
    out.fecha_ingreso = data.fecha_ingreso || null; // ideal validar ISO
  }

  if (!partial || data.fecha_limite !== undefined) {
    out.fecha_limite = data.fecha_limite || null;
  }

  if (!partial || data.precio !== undefined) {
    const precio = toNumberOrNull(data.precio);
    if (precio === null || precio < 0) throw httpError(400, 'precio inválido');
    out.precio = precio;
  }

  if (!partial || data.stock !== undefined) {
    const stock = toIntOrNull(data.stock);
    if (data.stock !== null && data.stock !== undefined && data.stock !== '' && stock === null)
      throw httpError(400, 'stock inválido');
    out.stock = stock;
  }

  if (!partial || data.min !== undefined) {
    const min = toIntOrNull(data.min);
    if (data.min !== null && data.min !== undefined && data.min !== '' && min === null)
      throw httpError(400, 'min inválido');
    out.min = min ?? 0;
  }

  if (!partial || data.activo !== undefined) {
    out.activo = (data.activo === 0 || data.activo === false || data.activo === '0') ? 0 : 1;
  } else if (!partial) {
    out.activo = 1;
  }

  return out;
}

// Obtener solo productos activos
async function list() {
  const [rows] = await pool.query(
    `
    SELECT
      id, nombre, lote, color, fecha_ingreso, fecha_limite,
      precio, stock, min, activo, creado_en
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
      id, nombre, lote, color, fecha_ingreso, fecha_limite,
      precio, stock, min, activo, creado_en
    FROM productos
    WHERE id = ?
    `,
    [id]
  );
  return rows[0] || null;
}

// Crear producto
async function create(data) {
  const p = normalizeProductoInput(data, { partial: false });

  const [result] = await pool.query(
    `
    INSERT INTO productos
      (nombre, lote, color, fecha_ingreso, fecha_limite, precio, stock, min, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      p.nombre,
      p.lote ?? null,
      p.color ?? null,
      p.fecha_ingreso ?? null,
      p.fecha_limite ?? null,
      p.precio,
      p.stock ?? null,
      p.min ?? 0,
      p.activo ?? 1,
    ]
  );

  return result.insertId;
}

// Actualizar producto (PATCH)
async function update(id, data) {
  const p = normalizeProductoInput(data, { partial: true });

  // No permitir PATCH vacío
  const keys = Object.keys(p);
  if (keys.length === 0) throw httpError(400, 'No hay campos para actualizar');

  // ✅ SET dinámico seguro (valores parametrizados)
  const sets = [];
  const vals = [];

  for (const k of keys) {
    // whitelist de campos actualizables
    if (!['nombre','lote','color','fecha_ingreso','fecha_limite','precio','stock','min','activo'].includes(k)) continue;
    sets.push(`${k} = ?`);
    vals.push(p[k]);
  }

  if (sets.length === 0) throw httpError(400, 'No hay campos válidos para actualizar');

  vals.push(id);

  const [result] = await pool.query(
    `UPDATE productos SET ${sets.join(', ')} WHERE id = ?`,
    vals
  );

  return result.affectedRows > 0;
}

/**
 * Eliminar producto:
 *  - Borra primero registros_inventario (historial)
 *  - Luego borra el producto
 */
async function remove(id) {
  await pool.query(`DELETE FROM registros_inventario WHERE producto_id = ?`, [id]);

  const [result] = await pool.query(`DELETE FROM productos WHERE id = ?`, [id]);
  return result.affectedRows; // 0 si no existía, 1 si se borró
}

module.exports = { list, getById, create, update, remove };
