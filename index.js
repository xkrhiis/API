require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');

// Routers
const productosRouter = require('./routes/productos.routes');
const usuariosRouter = require('./routes/usuarios.routes');
const registrosRouter = require('./routes/registros.routes');
const mermasRouter = require('./routes/mermas.routes');

const APP_PORT = Number(process.env.APP_PORT || 3000);

// 👉 Cambia este string cada vez que subas (para ver si realmente se actualizó)
const BUILD_TAG = 'floricoop-api-build-2025-12-04-01';

function initServer() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  // Healthcheck
  app.get(['/', '/api'], (_req, res) => {
    res.json({ ok: true, message: 'API Floricoop funcionando', build: BUILD_TAG });
  });

  // ✅ Verifica si el deploy se aplicó
  app.get(['/version', '/api/version'], (_req, res) => {
    res.json({
      ok: true,
      build: BUILD_TAG,
      node: process.version,
      env_port: process.env.APP_PORT || null,
      time: new Date().toISOString(),
    });
  });

  // ✅ Lista rutas montadas (debug)
  app.get(['/routes', '/api/routes'], (_req, res) => {
    const routes = [];
    app._router?.stack?.forEach((layer) => {
      if (layer.route?.path) {
        const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());
        routes.push({ path: layer.route.path, methods });
      } else if (layer.name === 'router' && layer.regexp) {
        // routers montados (no muestra todo, pero ayuda)
        routes.push({ mounted_router: String(layer.regexp) });
      }
    });
    res.json({ ok: true, build: BUILD_TAG, routes_count: routes.length, routes });
  });

  // ✅ Montaje doble de rutas
  const mountRoutes = (base) => {
    const prefix = base || '';
    app.use(`${prefix}/productos`, productosRouter);
    app.use(`${prefix}/usuarios`, usuariosRouter);
    app.use(`${prefix}/registros`, registrosRouter);
    app.use(`${prefix}/mermas`, mermasRouter);
  };

  mountRoutes('/api');
  mountRoutes('');

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'No encontrado', path: req.originalUrl, build: BUILD_TAG });
  });

  // error handler
  app.use((err, _req, res, _next) => {
    console.error('💥 Error:', err);
    res.status(err.status || 500).json({
      error: 'Error interno',
      detail: err?.message || 'Unknown error',
      build: BUILD_TAG,
    });
  });

  const server = http.createServer(app);
  server.listen(APP_PORT, () => console.log(`✅ API levantada en puerto ${APP_PORT}`));
}

initServer();
