// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');

const productosRouter = require('./routes/productos.routes');

const APP_PORT = Number(process.env.APP_PORT || 3000);

async function initServer() {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // 3) Endpoints de salud  (debe ir antes del 404)
app.get('/health/db', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    return res.json({ db: rows?.[0]?.ok === 1 });
  } catch (e) {
    return res.status(500).json({ db: false, error: e.message });
  }
});

// ...luego montas las rutas de negocio...
app.use('/api/productos', productosRouter);

// 404 y manejo de errores al final
app.use((_req, res) => res.status(404).json({ error: 'No encontrado' }));

  // Errores
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Error interno' });
  });

  const server = http.createServer(app);
  server.listen(APP_PORT, () => {
    console.log(`✅ API levantada: http://localhost:${APP_PORT}`);
    console.log(`➡️  Productos:   GET http://localhost:${APP_PORT}/api/productos`);
  });
}

initServer();
