// routes/clientes.routes.js
const express = require('express');
const router = express.Router();
const svc = require('../services/clientes.service');

router.get('/', async (_req, res, next) => {
  try { res.json(await svc.list()); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await svc.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'No encontrado' });
    res.json(item);
  } catch (e) { next(e); }
});

module.exports = router;
