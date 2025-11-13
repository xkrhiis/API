// routes/tenants.router.js
const express = require('express');

function tenantsRouterFactory(service) {
  const router = express.Router();

  // GET /tenants
  router.get('/', async (_req, res) => {
    try {
      const result = await service.findAll();
      res.status(result.status).json(result.body);
    } catch (e) {
      res.status(500).json({ ok: false, message: 'Error interno', error: e.message });
    }
  });

  // GET /tenants/:id
  router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'id inválido' });
    }
    try {
      const result = await service.findById(id);
      res.status(result.status).json(result.body);
    } catch (e) {
      res.status(500).json({ ok: false, message: 'Error interno', error: e.message });
    }
  });

  // POST /tenants
  router.post('/', async (req, res) => {
    try {
      const result = await service.create(req.body);
      res.status(result.status).json(result.body);
    } catch (e) {
      res.status(500).json({ ok: false, message: 'Error interno', error: e.message });
    }
  });

  // PUT /tenants/:id
  router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'id inválido' });
    }
    try {
      const result = await service.update(id, req.body);
      res.status(result.status).json(result.body);
    } catch (e) {
      res.status(500).json({ ok: false, message: 'Error interno', error: e.message });
    }
  });

  // DELETE /tenants/:id
  router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'id inválido' });
    }
    try {
      const result = await service.remove(id);
      res.status(result.status).json(result.body);
    } catch (e) {
      res.status(500).json({ ok: false, message: 'Error interno', error: e.message });
    }
  });

  return router;
}

module.exports = tenantsRouterFactory;
