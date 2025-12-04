// routes/productos.routes.js
const express = require('express');
const router = express.Router();
const productosService = require('../services/productos.service');

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
    const rows = await productosService.list();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseId(req, res);
    if (!id) return;

    const prod = await productosService.getById(id);
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(prod);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const id = await productosService.create(req.body);
    res.status(201).json({ id });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseId(req, res);
    if (!id) return;

    const updated = await productosService.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ updated: true });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseId(req, res);
    if (!id) return;

    const deleted = await productosService.remove(id);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ deleted: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
