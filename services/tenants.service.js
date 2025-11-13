// services/tenants.service.js
class TenantsService {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    const sql = 'SELECT id, name, email, created_at FROM tenants ORDER BY id DESC';
    const data = await this.db.query(sql);
    const total = data.length;
    if (total === 0) {
      return { status: 404, body: { ok: false, message: 'Sin datos', total, data: [] } };
    }
    return { status: 200, body: { ok: true, total, data } };
  }

  async findById(id) {
    const sql = 'SELECT id, name, email, created_at FROM tenants WHERE id = ? LIMIT 1';
    const data = await this.db.query(sql, [id]);
    if (data.length === 0) {
      return { status: 404, body: { ok: false, message: 'No encontrado' } };
    }
    return { status: 200, body: { ok: true, data: data[0] } };
  }

  async create(payload) {
    const { name, email } = payload || {};
    if (!name) {
      return { status: 400, body: { ok: false, message: 'name es requerido' } };
    }
    const sql = 'INSERT INTO tenants (name, email) VALUES (?, ?)';
    const result = await this.db.exec(sql, [name, email ?? null]);
    if (result.affectedRows === 1) {
      return {
        status: 201,
        body: { ok: true, message: 'Creado', id: result.insertId }
      };
    }
    return { status: 500, body: { ok: false, message: 'Error creando registro' } };
  }

  async update(id, payload) {
    const { name, email } = payload || {};
    const sql = 'UPDATE tenants SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?';
    const result = await this.db.exec(sql, [name ?? null, email ?? null, id]);
    if (result.affectedRows === 0) {
      return { status: 404, body: { ok: false, message: 'ID inexistente' } };
    }
    return { status: 200, body: { ok: true, message: 'Actualizado' } };
  }

  async remove(id) {
    const sql = 'DELETE FROM tenants WHERE id = ?';
    const result = await this.db.exec(sql, [id]);
    if (result.affectedRows === 0) {
      return { status: 404, body: { ok: false, message: 'ID inexistente' } };
    }
    return { status: 200, body: { ok: true, message: 'Eliminado' } };
  }
}

module.exports = TenantsService;
