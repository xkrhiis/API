// services/usuarios.service.js
const { pool } = require('./db.service');

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

const BASE_SELECT =
  'SELECT id, username, rol AS role, creado_en AS created_at FROM usuarios';

function normalizeUserInput(data = {}, { partial = false } = {}) {
  const out = {};

  if (!partial || data.username !== undefined) {
    const username = String(data.username ?? '').trim();
    if (!username) throw httpError(400, 'username es requerido');
    if (username.length > 50) throw httpError(400, 'username demasiado largo');
    out.username = username;
  }

  if (!partial || data.password !== undefined) {
    const password = String(data.password ?? '').trim();
    if (!password) throw httpError(400, 'password es requerido');
    if (password.length > 200) throw httpError(400, 'password demasiado largo');
    out.password = password;
  }

  if (!partial || data.role !== undefined || data.rol !== undefined) {
    const roleRaw = String(data.role ?? data.rol ?? 'user').trim();
    const allowed = new Set(['admin', 'user']);
    out.role = allowed.has(roleRaw) ? roleRaw : 'user';
  }

  return out;
}

// Devuelve todos los usuarios
async function list() {
  const [rows] = await pool.query(`${BASE_SELECT} ORDER BY id ASC`);
  return rows;
}

// Devuelve un usuario por ID
async function get(id) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE id = ?`, [id]);
  return rows[0] || null;
}

// Crear usuario
async function create(data) {
  const u = normalizeUserInput(data, { partial: false });

  const [result] = await pool.query(
    'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)',
    [u.username, u.password, u.role]
  );

  return result.insertId;
}

// Actualizar usuario
async function update(id, data) {
  const u = normalizeUserInput(data, { partial: true });

  const sets = [];
  const vals = [];

  if (u.username !== undefined) {
    sets.push('username = ?');
    vals.push(u.username);
  }

  if (u.password !== undefined) {
    sets.push('password = ?');
    vals.push(u.password);
  }

  if (u.role !== undefined) {
    sets.push('rol = ?');
    vals.push(u.role);
  }

  if (!sets.length) throw httpError(400, 'No hay campos para actualizar');

  vals.push(Number(id));

  const [result] = await pool.query(
    `UPDATE usuarios SET ${sets.join(', ')} WHERE id = ?`,
    vals
  );

  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Alias que esperan las rutas
async function getAll() {
  return list();
}

async function getById(id) {
  return get(Number(id));
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  getAll,
  getById,
};
