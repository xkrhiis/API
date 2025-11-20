// routes/productos.routes.js
const express = require('express');
const router = express.Router();
const productosService = require('../services/productos.service');

// Por compatibilidad: usar getById si existe, si no usar get
const getProductoById =
  productosService.getById || productosService.get;

// GET /api/productos
router.get('/', async (_req, res, next) => {
  try {
    const rows = await productosService.list();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const prod = await getProductoById(id);
    if (!prod) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(prod);
  } catch (e) {
    next(e);
  }
});

// POST /api/productos
router.post('/', async (req, res, next) => {
  try {
    const id = await productosService.create(req.body);
    res.status(201).json({ id });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/productos/:id  ← NECESARIO PARA EDITAR
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // debe devolver true si actualizó al menos 1 fila
    const updated = await productosService.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // El front no usa el cuerpo, pero por claridad devolvemos esto
    res.json({ updated: true });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/productos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const deleted = await productosService.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ deleted: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
