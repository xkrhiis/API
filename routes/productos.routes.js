// routes/productos.routes.js
const express = require('express');
const router = express.Router();
const svc = require('../services/productos.service');

router.get('/', async (_req, res, next) => { try { res.json(await svc.list()); } catch(e){ next(e); }});
router.get('/:id', async (req, res, next) => { try {
  const item = await svc.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'No encontrado' });
  res.json(item);
} catch(e){ next(e); }});
router.post('/', async (req, res, next) => { try {
  const id = await svc.create(req.body);
  res.status(201).json({ id });
} catch(e){ next(e); }});
router.patch('/:id', async (req, res, next) => { try {
  const ok = await svc.update(req.params.id, req.body);
  res.json({ updated: !!ok });
} catch(e){ next(e); }});
router.delete('/:id', async (req, res, next) => { try {
  const ok = await svc.remove(req.params.id);
  res.json({ deleted: !!ok });
} catch(e){ next(e); }});

module.exports = router;
