// index.js
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');

// Routers de la API
const productosRouter = require('./routes/productos.routes');
const usuariosRouter = require('./routes/usuarios.routes');
const registrosRouter = require('./routes/registros.routes');
const mermasRouter = require('./routes/mermas.routes');

// DB test (desde services/db.service.js)
const { testDbConnection } = require('./services/db.service');

const APP_PORT = Number(process.env.APP_PORT || 3000);

function initServer() {
  const app = express();

  // Si estás detrás de Apache/Nginx con HTTPS (reverse proxy)
  app.set('trust proxy', 1);

  // Middlewares globales
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  // ✅ Healthcheck: que responda en "/" y también en "/api"
  app.get(['/', '/api'], (_req, res) => {
    res.json({
      ok: true,
      message: 'API Floricoop funcionando',
    });
  });

  // ✅ Montaje de rutas en 2 modos:
  // 1) Normal: /api/productos (local y como espera Angular)
  // 2) Hosting/proxy: /productos (si el proxy quita /api)
  const mountRoutes = (base) => {
    const prefix = base || ''; // '' o '/api'
    app.use(`${prefix}/productos`, productosRouter);
    app.use(`${prefix}/usuarios`, usuariosRouter);
    app.use(`${prefix}/registros`, registrosRouter);
    app.use(`${prefix}/mermas`, mermasRouter);
  };

  mountRoutes('/api');
  mountRoutes('');

  // 404 - cualquier ruta que no exista
  app.use((req, res) => {
    res.status(404).json({ error: 'No encontrado', path: req.originalUrl });
  });

  // Manejo de errores
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('💥 Error:', err);
    res.status(err.status || 500).json({
      error: 'Error interno',
      detail: err?.message || 'Unknown error',
    });
  });

  const server = http.createServer(app);

  // 🔎 Test de conexión a DB (sale en logs del hosting)
  // Nota: no detiene el server si falla, pero te deja el error claro.
  try {
    testDbConnection();
  } catch (e) {
    console.error('❌ Error iniciando test DB:', e?.message || e);
  }

  server.listen(APP_PORT, () => {
    console.log(`✅ API levantada en puerto ${APP_PORT}`);
  });
}

initServer();
