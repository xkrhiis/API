// routes/usuarios.routes.js
const express = require('express');
const router = express.Router();
const usuariosService = require('../services/usuarios.service');

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'ID inválido' });
    return null;
  }
  return id;
}

router.get('/', async (_req, res, next) => {
  try {
    const rows = await usuariosService.getAll();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseId(req, res);
    if (!id) return;

    const item = await usuariosService.getById(id);
    if (!item) return res.status(404).json({ error: 'No encontrado' });

    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const id = await usuariosService.create(req.body);
    res.status(201).json({ id });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseId(req, res);
    if (!id) return;

    const ok = await usuariosService.update(id, req.body);
    if (!ok) return res.status(404).json({ error: 'No encontrado' });

    res.json({ updated: true });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseId(req, res);
    if (!id) return;

    const ok = await usuariosService.remove(id);
    if (!ok) return res.status(404).json({ error: 'No encontrado' });

    res.json({ deleted: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
