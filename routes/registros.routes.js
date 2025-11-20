// routes/registros.routes.js
const express = require('express');
const router = express.Router();
const registrosService = require('../services/registros.service');

// GET /api/registros → lista historial
router.get('/', async (_req, res, next) => {
  try {
    const rows = await registrosService.list();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// POST /api/registros → crear un nuevo registro
router.post('/', async (req, res, next) => {
  try {
    const id = await registrosService.create(req.body);
    res.status(201).json({ id });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
