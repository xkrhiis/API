// routes/mermas.routes.js
const express = require('express');
const router = express.Router();
const mermasService = require('../services/mermas.service');

// GET /api/mermas
router.get('/', async (_req, res, next) => {
  try {
    const rows = await mermasService.list();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// GET /api/mermas/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const merma = await mermasService.getById(id);
    if (!merma) return res.status(404).json({ error: 'No encontrado' });
    res.json(merma);
  } catch (e) {
    next(e);
  }
});

// POST /api/mermas
router.post('/', async (req, res, next) => {
  try {
    const id = await mermasService.create(req.body);
    res.status(201).json({ id });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/mermas/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const deleted = await mermasService.remove(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Merma no encontrada' });
    }
    res.json({ deleted: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
