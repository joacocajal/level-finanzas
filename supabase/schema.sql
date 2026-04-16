-- ============================================================
-- LEVEL Finanzas — Schema PostgreSQL para Supabase
-- ============================================================

-- Tipos enum
CREATE TYPE categoria_tx AS ENUM (
  'inversion_producto',
  'inversion_packaging',
  'inversion_marketing',
  'venta',
  'regalo',
  'gasto_operativo'
);

CREATE TYPE tipo_tx AS ENUM ('ingreso', 'egreso');

CREATE TYPE moneda_tx AS ENUM ('ARS', 'USD');

-- ─── TRANSACCIONES ──────────────────────────────────────────────────────────
CREATE TABLE transacciones (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha             date        NOT NULL,
  concepto          text        NOT NULL,
  categoria         categoria_tx NOT NULL,
  subcategoria      text,
  tipo              tipo_tx     NOT NULL,
  monto             numeric(12,2) NOT NULL CHECK (monto > 0),
  moneda            moneda_tx   NOT NULL DEFAULT 'ARS',
  metodo_pago       text,
  cantidad_unidades integer,
  notas             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tx_fecha     ON transacciones (fecha DESC);
CREATE INDEX idx_tx_categoria ON transacciones (categoria);
CREATE INDEX idx_tx_tipo      ON transacciones (tipo);

-- ─── INVENTARIO ─────────────────────────────────────────────────────────────
CREATE TABLE inventario (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  producto            text        NOT NULL,
  cantidad_total      integer     NOT NULL DEFAULT 0,
  cantidad_disponible integer     NOT NULL DEFAULT 0,
  cantidad_vendida    integer     NOT NULL DEFAULT 0,
  cantidad_regalada   integer     NOT NULL DEFAULT 0,
  costo_unitario      numeric(10,2) NOT NULL DEFAULT 0,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ─── CONFIGURACIÓN ──────────────────────────────────────────────────────────
CREATE TABLE config (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  clave      text        NOT NULL UNIQUE,
  valor      numeric(12,2) NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── SEED: TRANSACCIONES ────────────────────────────────────────────────────
INSERT INTO transacciones (fecha, concepto, categoria, subcategoria, tipo, monto, moneda, metodo_pago, cantidad_unidades, notas) VALUES
  ('2025-10-01', 'Compra remeras base negras',      'inversion_producto',  'remeras_base', 'egreso',  75866, 'ARS', 'transferencia', 8,   '8 remeras over negras'),
  ('2025-12-11', 'Compra tarjetas LEVEL',            'inversion_packaging', 'tarjetas',     'egreso',  9800,  'ARS', 'transferencia', 20,  '20 tarjetas LEVEL'),
  ('2025-12-12', 'Compra stickers',                  'inversion_packaging', 'stickers',     'egreso',  25590, 'ARS', 'transferencia', 100, '50 S.N y 50 S.B'),
  ('2026-01-06', 'Compra remeras base blancas',      'inversion_producto',  'remeras_base', 'egreso',  72505, 'ARS', 'transferencia', 8,   '8 remeras over blancas'),
  ('2026-01-08', 'Compra bolsas con diseño',         'inversion_packaging', 'bolsas',       'egreso',  103733,'ARS', 'transferencia', 200, '200 bolsas negras con diseño'),
  ('2026-01-13', 'Serigrafía 5 remeras negras',      'inversion_producto',  'serigrafia',   'egreso',  31875, 'ARS', 'transferencia', 5,   'Estampa 5 remeras negras'),
  ('2026-01-14', 'Serigrafía 3 remeras + relieve',   'inversion_producto',  'serigrafia',   'egreso',  33125, 'ARS', 'transferencia', 3,   'Estampa 3 remeras + relieve en las 8'),
  ('2026-04-14', 'Serigrafía 8 remeras blancas',     'inversion_producto',  'serigrafia',   'egreso',  98220, 'ARS', 'transferencia', 8,   'Estampa 8 remeras blancas'),
  ('2026-04-16', 'Venta remera negra',               'venta',              NULL,            'ingreso', 25000, 'ARS', 'efectivo',      1,   '1 negra con bolsa y 2 stickers');

-- ─── SEED: INVENTARIO ───────────────────────────────────────────────────────
INSERT INTO inventario (producto, cantidad_total, cantidad_disponible, cantidad_vendida, cantidad_regalada, costo_unitario) VALUES
  ('Remera negra estampada', 8,   5,   1, 2, 17608),
  ('Remera blanca estampada', 8,  8,   0, 0, 21341),
  ('Bolsa con diseño',        200, 199, 0, 1, 519),
  ('Tarjeta LEVEL',           20,  20,  0, 0, 490),
  ('Sticker',                 100, 98,  0, 2, 256);

-- ─── SEED: CONFIG ───────────────────────────────────────────────────────────
INSERT INTO config (clave, valor) VALUES
  ('tipo_cambio_usd',      1400),
  ('precio_venta_negra',   40000),
  ('precio_venta_blanca',  40000),
  ('costo_runway_mensual', 0),
  ('costo_flux_api',       0),
  ('costo_gemini_api',     0);

-- ─── RLS (Row Level Security) ────────────────────────────────────────────────
-- Habilitá RLS y agregá políticas según tu setup de auth en Supabase.
-- Por ahora, acceso público (para desarrollo):

ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario     ENABLE ROW LEVEL SECURITY;
ALTER TABLE config         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acceso_publico_transacciones" ON transacciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico_inventario"    ON inventario     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico_config"        ON config         FOR ALL USING (true) WITH CHECK (true);
