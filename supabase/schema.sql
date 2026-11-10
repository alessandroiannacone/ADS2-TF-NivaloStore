-- ==============================================================================
-- NIVALO STORE v2 — Esquema de Base de Datos para Supabase (PostgreSQL)
-- Metodología: AUP & SDD (ICONIX Iteración 2)
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Limpieza previa (si se desea reiniciar)
DROP TABLE IF EXISTS historial_estados CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS intentos_cobro CASCADE;
DROP TABLE IF EXISTS reservas_stock CASCADE;
DROP TABLE IF EXISTS detalles_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;

-- ==============================================================================
-- TABLA: productos
-- ==============================================================================
CREATE TABLE productos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    marca TEXT,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    puntos INTEGER DEFAULT 0,
    medidas TEXT,
    badge TEXT,
    color TEXT,
    talla TEXT,
    stock_disponible INTEGER NOT NULL DEFAULT 0 CHECK (stock_disponible >= 0),
    stock_reservado INTEGER NOT NULL DEFAULT 0 CHECK (stock_reservado >= 0),
    stock_total_fisico INTEGER NOT NULL DEFAULT 0 CHECK (stock_total_fisico >= 0),
    imagen TEXT NOT NULL,
    descripcion TEXT,
    es_oferta BOOLEAN DEFAULT FALSE,
    es_favorito BOOLEAN DEFAULT FALSE,
    es_recomendado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ==============================================================================
-- TABLA: clientes
-- ==============================================================================
CREATE TABLE clientes (
    id TEXT PRIMARY KEY,
    nombre_o_identificador TEXT NOT NULL,
    telefono TEXT NOT NULL,
    canal TEXT NOT NULL CHECK (canal IN ('WhatsApp', 'Instagram')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ==============================================================================
-- TABLA: pedidos
-- ==============================================================================
CREATE TABLE pedidos (
    id TEXT PRIMARY KEY,
    cliente_id TEXT REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_data JSONB NOT NULL,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'PENDIENTE_PAGO' CHECK (estado IN ('PENDIENTE_PAGO', 'PAGADO', 'CANCELADO')),
    motivo_cancelacion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    fecha_vencimiento_reserva TIMESTAMPTZ NOT NULL,
    enlace_pago_activo TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ==============================================================================
-- TABLA: detalles_pedido
-- ==============================================================================
CREATE TABLE detalles_pedido (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id TEXT REFERENCES productos(id) ON DELETE SET NULL,
    producto_nombre TEXT NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    subtotal NUMERIC(10, 2) NOT NULL
);

-- ==============================================================================
-- TABLA: reservas_stock
-- ==============================================================================
CREATE TABLE reservas_stock (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id TEXT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha_creacion TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    fecha_vencimiento TIMESTAMPTZ NOT NULL,
    estado TEXT NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'CONFIRMADA', 'LIBERADA'))
);

-- ==============================================================================
-- TABLA: intentos_cobro
-- ==============================================================================
CREATE TABLE intentos_cobro (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    numero_intento INTEGER NOT NULL,
    fecha_hora TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    resultado TEXT NOT NULL CHECK (resultado IN ('Generado', 'Error', 'Sin respuesta')),
    enlace_generado TEXT,
    mensaje_error TEXT
);

-- ==============================================================================
-- TABLA: pagos
-- ==============================================================================
CREATE TABLE pagos (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    referencia_externa TEXT UNIQUE NOT NULL,
    fecha_pago TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    total_pedido NUMERIC(10, 2) NOT NULL,
    monto_recibido NUMERIC(10, 2) NOT NULL,
    diferencia NUMERIC(10, 2) NOT NULL DEFAULT 0,
    estado_pago TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_pago IN ('PENDIENTE', 'APROBADO', 'POR_REVISAR', 'RECHAZADO', 'REEMBOLSADO')),
    motivo_observacion TEXT,
    motivo_rechazo TEXT,
    resultado_reembolso TEXT
);

-- ==============================================================================
-- TABLA: historial_estados
-- ==============================================================================
CREATE TABLE historial_estados (
    id TEXT PRIMARY KEY,
    pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    estado_anterior TEXT NOT NULL,
    estado_nuevo TEXT NOT NULL,
    origen TEXT NOT NULL CHECK (origen IN ('Vendedor', 'Servicio de Pago', 'Temporizador')),
    observaciones TEXT
);

-- ==============================================================================
-- POLÍTICAS DE ACCESO PÚBLICO (ROW LEVEL SECURITY - RLS)
-- Permite lectura y escritura con la clave anónima (anon public) para la tienda web
-- ==============================================================================
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentos_cobro ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados ENABLE ROW LEVEL SECURITY;

-- Políticas para productos (Lectura pública, actualización de stock)
CREATE POLICY "Lectura publica de productos" ON productos FOR SELECT USING (true);
CREATE POLICY "Actualizacion de stock en productos" ON productos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Insercion de productos" ON productos FOR INSERT WITH CHECK (true);

-- Políticas para clientes
CREATE POLICY "Acceso publico clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);

-- Políticas para pedidos
CREATE POLICY "Acceso publico pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico detalles" ON detalles_pedido FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico reservas" ON reservas_stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico cobros" ON intentos_cobro FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico pagos" ON pagos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso publico historial" ON historial_estados FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- CARGA INICIAL DE PRODUCTOS (SEED DATA)
-- ==============================================================================
INSERT INTO productos (id, nombre, categoria, marca, precio, puntos, medidas, badge, color, talla, stock_disponible, stock_reservado, stock_total_fisico, imagen, descripcion, es_oferta, es_favorito, es_recomendado) VALUES
('PROD-12', 'Sanrio Memopads', 'Sanrio', 'SANRIO', 5.00, 25, '7 cm x 10 cm', 'ÚLTIMAS', 'Degradado', 'Única', 35, 0, 35, './prod_memopads.jpg', 'Bloc de notas Sanrio pastel de edición limitada.', false, true, true),
('PROD-13', 'Paleta de sombras de ojos Glitter', 'Maquillaje', 'MCL', 23.00, 115, '8.5cm x 8.5cm', 'ÚLTIMAS', 'Degradado', 'Única', 18, 0, 18, './prod_paleta.jpg', 'Paleta 9 tonos con glitter prensado ultrabrillante.', false, true, true),
('PROD-14', 'Set de portaminas Sanrio', 'Papelería', 'SANRIO', 14.00, 70, '0.5 mm', 'NUEVO', 'Degradado', 'Única', 40, 0, 40, './prod_portaminas.jpg', 'Set de 4 portaminas temáticos Sanrio.', false, true, true),
('PROD-15', 'Llavero de Peluche Tostada Kawaii', 'Accesorios', 'NIVALO STUDIO', 15.00, 75, '8 cm', 'ÚLTIMAS', 'Cream White', 'Única', 15, 0, 15, './prod_tostada.jpg', 'Llavero peluche suave de pancito tostado.', false, true, true),
('PROD-19', 'Vestido de encaje Sweet Fairycore', 'Ropa', 'K-FASHION', 55.00, 275, 'Largo 82 cm', 'ÚLTIMAS', 'Blanco', 'S', 9, 0, 9, './prod_vestido.jpg', 'Vestido coreano blanco de gasa y encaje.', false, true, true),
('PROD-20', 'Lazo decorativo rojo y encaje Harajuku', 'Accesorios', 'HARAJUKU', 12.00, 60, '13cm x 24cm', 'ÚLTIMAS', '06#', 'Única', 20, 0, 20, './prod_lazo.jpg', 'Lazo maxi en satén rojo vino con puntilla.', false, true, true),
('PROD-38', 'Trebol Good Luck Keychain', 'Accesorios', 'KAWAII LIFE', 14.00, 70, 'Largo 10 cm', 'NUEVO', 'Azul claro', 'Única', 22, 0, 22, './llavero_trebol.jpg', 'Phone charm de trébol de cuatro hojas.', false, true, true),
('PROD-39', 'Cartuchera Su Zai Zai (WIFTY)', 'Papelería', 'WIFTY', 24.00, 120, '20cm x 10cm x 6cm', 'NUEVO', 'Cream White', 'Única', 16, 0, 16, './wifty.jpg', 'Estuche espacioso de tela acolchada bicolor estilo drama WIFTY.', false, true, true),
('PROD-40', 'Holder de Estrella Plush Photocard', 'K-pop', 'K-POP WORLD', 18.00, 90, '14cm x 14cm', 'NUEVO', 'Azul claro', 'Única', 25, 0, 25, './prod_holder_estrella.jpg', 'Portafotos de felpa en forma de estrella con ventana.', false, true, true);
