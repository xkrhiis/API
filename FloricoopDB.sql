-- schema_floricoop.sql
CREATE DATABASE IF NOT EXISTS floricoop
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE floricoop;

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  password VARCHAR(120) NOT NULL,
  rol ENUM('admin','user') NOT NULL DEFAULT 'user',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

USE floricoop;

CREATE TABLE IF NOT EXISTS registros_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lote VARCHAR(50) NOT NULL,
  producto_id INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  usuario_id INT NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;



-- Tablas
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE,
  telefono VARCHAR(40),
  direccion VARCHAR(200),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('PENDIENTE','PAGADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_pedidos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) AS (cantidad * precio_unitario) STORED,
  CONSTRAINT fk_items_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_items_producto
    FOREIGN KEY (producto_id) REFERENCES productos(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Vista de apoyo
CREATE OR REPLACE VIEW vw_pedidos_resumen AS
SELECT p.id AS pedido_id, c.nombre AS cliente, p.fecha, p.estado, p.total
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id;

-- Usuario administrador por defecto
INSERT INTO usuarios (username, password, rol) VALUES
('admin', 'admin', 'admin')
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  rol      = VALUES(rol);

-- Usuario "user" de ejemplo
INSERT INTO usuarios (username, password, rol) VALUES
('user', 'user', 'user')
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  rol      = VALUES(rol);

-- Semillas
INSERT INTO productos (nombre, precio, stock, activo) VALUES
('Rosa bouquet', 3500.00, 50, 1),
('Lilium blanco', 4200.00, 30, 1),
('Girasol', 1800.00, 100, 1)
ON DUPLICATE KEY UPDATE precio=VALUES(precio), stock=VALUES(stock), activo=VALUES(activo);

INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
('Ana Torres','ana@example.com','+56 9 1111 2222','Santiago'),
('Carlos Pérez','carlos@example.com','+56 9 3333 4444','Coquimbo')
ON DUPLICATE KEY UPDATE telefono=VALUES(telefono), direccion=VALUES(direccion);

-- Pedido de ejemplo
SET @cliente := (SELECT id FROM clientes ORDER BY id LIMIT 1);
INSERT INTO pedidos (cliente_id, estado, total) VALUES (@cliente, 'PENDIENTE', 0);

SET @pedido := LAST_INSERT_ID();
SET @prod1 := (SELECT id FROM productos WHERE nombre='Rosa bouquet' LIMIT 1);
SET @prod2 := (SELECT id FROM productos WHERE nombre='Girasol' LIMIT 1);

INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES
(@pedido, @prod1, 2, (SELECT precio FROM productos WHERE id=@prod1)),
(@pedido, @prod2, 3, (SELECT precio FROM productos WHERE id=@prod2));

-- Recalcular total
UPDATE pedidos p
JOIN (SELECT pedido_id, SUM(subtotal) AS suma
      FROM pedido_items GROUP BY pedido_id) s
  ON s.pedido_id = p.id
SET p.total = s.suma
WHERE p.id = @pedido;

-- Índices útiles
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_items_pedido ON pedido_items(pedido_id);
CREATE INDEX idx_items_producto ON pedido_items(producto_id);

ALTER TABLE registros_inventario
  ADD COLUMN tipo_movimiento ENUM('ENTRADA','SALIDA','MERMA','AJUSTE') NOT NULL DEFAULT 'ENTRADA',
  ADD COLUMN motivo_merma VARCHAR(255) NULL;
