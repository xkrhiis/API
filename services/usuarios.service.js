// services/usuarios.service.js
const { pool } = require('./db.service');

// OJO: aquí usamos "rol" y "creado_en" pero los exponemos como "role" y "created_at"
const BASE_SELECT =
  'SELECT id, username, rol AS role, creado_en AS created_at FROM usuarios';

// =============== FUNCIONES INTERNAS ===============

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

// data: { username, password, role }
async function create({ username, password, role = 'user' }) {
  // En la tabla la columna es "rol"
  const [result] = await pool.query(
    'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)',
    [username, password, role]
  );
  // devolvemos el id del nuevo usuario
  return result.insertId;
}

// data puede traer solo algunos campos: username, password, role
async function update(id, data) {
  const sets = [];
  const vals = [];

  if (data.username !== undefined) {
    sets.push('username = ?');
    vals.push(data.username);
  }
  if (data.password !== undefined) {
    sets.push('password = ?');
    vals.push(data.password);
  }
  if (data.role !== undefined) {
    // En BD es "rol"
    sets.push('rol = ?');
    vals.push(data.role);
  }

  // Si no hay nada que actualizar
  if (!sets.length) return false;

  vals.push(id);

  const [result] = await pool.query(
    `UPDATE usuarios SET ${sets.join(', ')} WHERE id = ?`,
    vals
  );

  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query(
    'DELETE FROM usuarios WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

// =============== ALIAS QUE ESPERAN LAS RUTAS ===============

// Las rutas llaman a getAll y getById, así que creamos alias
async function getAll() {
  return list();
}

async function getById(id) {
  return get(id);
}

// Exportamos TODO con los nombres que usan las rutas
module.exports = {
  // nombres originales
  list,
  get,
  create,
  update,
  remove,
  // alias usados en routes/usuarios.routes.js
  getAll,
  getById,
};
