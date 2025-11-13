const express = require('express');
const router = express.Router();
const svc = require('../services/pedidos.service');

router.get('/', async (_req, res, next) => { try { res.json(await svc.list()); } catch(e){ next(e); }});
router.get('/:id', async (req, res, next) => { try {
  const row = await svc.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  res.json(row);
} catch(e){ next(e); }});
router.get('/:id/items', async (req, res, next) => { try {
  res.json(await svc.items(req.params.id));
} catch(e){ next(e); }});

module.exports = router;
