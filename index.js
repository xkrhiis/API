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
const mermasRouter = require('./routes/mermas.routes'); // 🔹 NUEVO

const APP_PORT = Number(process.env.APP_PORT || 3000);

function initServer() {
  const app = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // Ruta raíz (para ver algo en http://localhost:3000)
  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      message: 'API Floricoop funcionando',
    });
  });

  // 🔹 Rutas de negocio
  app.use('/api/productos', productosRouter);
  app.use('/api/usuarios', usuariosRouter);
  app.use('/api/registros', registrosRouter);
  app.use('/api/mermas', mermasRouter); // <-- ruta de mermas

  // 404 - cualquier ruta que no exista (debe ir después de las rutas)
  app.use((_req, res) => {
    return res.status(404).json({ error: 'No encontrado' });
  });

  // Middleware de manejo de errores (debe ir al final)
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Error interno' });
  });

  const server = http.createServer(app);

  server.listen(APP_PORT, () => {
    console.log(`✅ API levantada: http://localhost:${APP_PORT}`);
    console.log(
      `➡️  Productos: GET http://localhost:${APP_PORT}/api/productos`
    );
    console.log(
      `➡️  Usuarios : GET http://localhost:${APP_PORT}/api/usuarios`
    );
    console.log(
      `➡️  Registros: GET http://localhost:${APP_PORT}/api/registros`
    );
    console.log(
      `➡️  Mermas   : GET http://localhost:${APP_PORT}/api/mermas`
    );
  });
}

initServer();
