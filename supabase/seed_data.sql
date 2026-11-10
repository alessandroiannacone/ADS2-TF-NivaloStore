-- ==============================================================================
-- NIVALO STORE v2 — DATOS REALISTAS DE CONTENIDO (SEED DATA)
-- Datos coherentes con reglas de negocio (24h reserva, conciliación y stock)
-- ==============================================================================

-- 1. CLIENTES FRECUENTES
INSERT INTO public.clientes (id, nombre_o_identificador, telefono, canal) VALUES
('CLI-001', 'Valeria Mendoza (@valeria_kawaii)', '998167789', 'WhatsApp'),
('CLI-002', 'Luciana Torres (@luciana_kpop)', '992187654', 'Instagram'),
('CLI-003', 'Andrea Castillo (@andreita_otaku)', '976543210', 'WhatsApp'),
('CLI-004', 'Camila Benavides (@camila_style)', '965412890', 'Instagram'),
('CLI-005', 'Mariana Quispe (@mariana_crafts)', '951234876', 'WhatsApp'),
('CLI-006', 'Fabiana Rivas (@fabi_harajuku)', '943216789', 'Instagram')
ON CONFLICT (id) DO UPDATE SET
    nombre_o_identificador = EXCLUDED.nombre_o_identificador,
    telefono = EXCLUDED.telefono,
    canal = EXCLUDED.canal;

-- 2. CATÁLOGO OFICIAL DE PRODUCTOS
-- Regla Invariante: stock_total_fisico = stock_disponible + stock_reservado
INSERT INTO public.productos (id, nombre, categoria, marca, precio, puntos, medidas, badge, color, talla, stock_disponible, stock_reservado, stock_total_fisico, imagen, descripcion, es_oferta, es_favorito, es_recomendado) VALUES
('PROD-12', 'Sanrio Memopads', 'Sanrio', 'SANRIO', 5.00, 25, '7 cm x 10 cm', 'ÚLTIMAS', 'Degradado', 'Única', 33, 2, 35, './prod_memopads.jpg', 'Bloc de notas Sanrio pastel de edición limitada. Hojas decoradas a todo color con Cinnamoroll, My Melody y Kuromi.', false, true, true),
('PROD-13', 'Paleta de sombras de ojos Glitter', 'Maquillaje', 'MCL', 23.00, 115, '8.5cm x 8.5cm', 'ÚLTIMAS', 'Degradado', 'Única', 17, 1, 18, './prod_paleta.jpg', 'Paleta 9 tonos con glitter prensado ultrabrillante y sombras mate suaves de alta pigmentación estilo coreano.', false, true, true),
('PROD-14', 'Set de portaminas Sanrio', 'Papelería', 'SANRIO', 14.00, 70, '0.5 mm', 'NUEVO', 'Degradado', 'Única', 39, 1, 40, './prod_portaminas.jpg', 'Set de 4 portaminas temáticos Sanrio con cabezal 3D y mina suave 0.5 mm con agarre ergonómico.', false, true, true),
('PROD-15', 'Llavero de Peluche Tostada Kawaii', 'Accesorios', 'KAWAII LIFE', 15.00, 75, '8 cm', 'ÚLTIMAS', 'Cream White', 'Única', 13, 2, 15, './prod_tostada.jpg', 'Monedero y llavero de felpa ultra suave en forma de pan tostado con cadenita dorada para cartera.', false, true, true),
('PROD-16', 'Barras de Sombra de Ojos Shimmer', 'Maquillaje', 'LA MEILA', 12.00, 60, '9.7 cm', 'ÚLTIMAS', '01#', 'Única', 22, 0, 22, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80', 'Sombra en barra bicolor para efecto aegyo sal e iluminación instantánea de párpados.', false, false, false),
('PROD-17', 'Papel absorbente facial con estuche', 'Maquillaje', 'BIOAQUA', 10.00, 50, '9.5cm x 7cm', 'ÚLTIMAS', 'Blanco', 'Única', 30, 0, 30, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80', 'Hojas secantes de fibra de lino natural con extracto de té verde y espejo interior incorporado.', false, false, false),
('PROD-18', 'Glossy Mirror Lip Glaze', 'Maquillaje', 'SHAQINUO', 12.00, 60, '8.4cm x 2cm', 'ÚLTIMAS', '02#', 'Única', 28, 0, 28, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80', 'Tinta labial con brillo cristalino tipo espejo no pegajoso, hidratante con ácido hialurónico.', false, true, false),
('PROD-19', 'Vestido de encaje Sweet Fairycore', 'Ropa', 'K-FASHION', 55.00, 275, 'Largo 82 cm', 'ÚLTIMAS', 'Blanco', 'S', 9, 0, 9, './prod_vestido.jpg', 'Vestido coreano blanco de gasa y encaje bordado con mangas abullonadas y cintura entallada.', false, true, true),
('PROD-20', 'Lazo decorativo rojo y encaje Harajuku', 'Accesorios', 'HARAJUKU', 12.00, 60, '13cm x 24cm', 'ÚLTIMAS', '06#', 'Única', 19, 1, 20, './prod_lazo.jpg', 'Lazo maxi en satén rojo vino con puntilla de encaje negro y broche central estilo Lolita.', false, true, true),
('PROD-38', 'Trebol Good Luck Keychain', 'Accesorios', 'KAWAII LIFE', 14.00, 70, 'Largo 10 cm', 'NUEVO', 'Azul claro', 'Única', 21, 1, 22, './llavero_trebol.jpg', 'Phone charm y llavero artesanal con dije de trébol de cuatro hojas y mostacillas pastel.', false, true, true),
('PROD-39', 'Cartuchera Su Zai Zai (WIFTY)', 'Papelería', 'WIFTY', 24.00, 120, '20cm x 10cm x 6cm', 'NUEVO', 'Cream White', 'Única', 15, 1, 16, './wifty.jpg', 'Estuche espacioso de tela acolchada bicolor estilo drama WIFTY con tirador metálico decorativo.', false, true, true),
('PROD-40', 'Holder de Estrella Plush Photocard', 'K-pop', 'K-POP WORLD', 18.00, 90, '14cm x 14cm', 'NUEVO', 'Azul claro', 'Única', 25, 0, 25, './prod_holder_estrella.jpg', 'Portafotos de felpa en forma de estrella con ventana transparente y mosquetón para mochila.', false, true, true)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    stock_disponible = EXCLUDED.stock_disponible,
    stock_reservado = EXCLUDED.stock_reservado,
    stock_total_fisico = EXCLUDED.stock_total_fisico,
    imagen = EXCLUDED.imagen,
    descripcion = EXCLUDED.descripcion;

-- 3. PEDIDOS REPRESENTATIVOS (Ciclo de Vida Completo)

-- Pedido 1: PED-000121 (PENDIENTE DE PAGO - Reserva activa por 24h)
INSERT INTO public.pedidos (id, cliente_id, cliente_data, total, estado, fecha_creacion, fecha_vencimiento_reserva, enlace_pago_activo) VALUES
('PED-000121', 'CLI-001', '{"id":"CLI-001","nombreOIdentificador":"Valeria Mendoza (@valeria_kawaii)","telefono":"998167789","canal":"WhatsApp"}'::jsonb, 34.00, 'PENDIENTE_PAGO', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '21 hours', 'https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/000121')
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado, total = EXCLUDED.total;

-- Pedido 2: PED-000122 (PAGADO - Pago aprobado por Yape)
INSERT INTO public.pedidos (id, cliente_id, cliente_data, total, estado, fecha_creacion, fecha_vencimiento_reserva, enlace_pago_activo) VALUES
('PED-000122', 'CLI-002', '{"id":"CLI-002","nombreOIdentificador":"Luciana Torres (@luciana_kpop)","telefono":"992187654","canal":"Instagram"}'::jsonb, 70.00, 'PAGADO', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '12 hours', 'https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/000122')
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado, total = EXCLUDED.total;

-- Pedido 3: PED-000123 (PENDIENTE DE PAGO - Reserva activa por 24h)
INSERT INTO public.pedidos (id, cliente_id, cliente_data, total, estado, fecha_creacion, fecha_vencimiento_reserva, enlace_pago_activo) VALUES
('PED-000123', 'CLI-003', '{"id":"CLI-003","nombreOIdentificador":"Andrea Castillo (@andreita_otaku)","telefono":"976543210","canal":"WhatsApp"}'::jsonb, 34.00, 'PENDIENTE_PAGO', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours', 'https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/000123')
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado, total = EXCLUDED.total;

-- Pedido 4: PED-000124 (CANCELADO - Vencieron las 24 horas sin pago)
INSERT INTO public.pedidos (id, cliente_id, cliente_data, total, estado, motivo_cancelacion, fecha_creacion, fecha_vencimiento_reserva, enlace_pago_activo) VALUES
('PED-000124', 'CLI-004', '{"id":"CLI-004","nombreOIdentificador":"Camila Benavides (@camila_style)","telefono":"965412890","canal":"Instagram"}'::jsonb, 25.00, 'CANCELADO', 'Vencimiento de 24 horas sin confirmación de pago', NOW() - INTERVAL '28 hours', NOW() - INTERVAL '4 hours', 'https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/000124')
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado, total = EXCLUDED.total;

-- Pedido 5: PED-000125 (PENDIENTE DE PAGO - Pago observado por diferencia en P4)
INSERT INTO public.pedidos (id, cliente_id, cliente_data, total, estado, fecha_creacion, fecha_vencimiento_reserva, enlace_pago_activo) VALUES
('PED-000125', 'CLI-005', '{"id":"CLI-005","nombreOIdentificador":"Mariana Quispe (@mariana_crafts)","telefono":"951234876","canal":"WhatsApp"}'::jsonb, 42.00, 'PENDIENTE_PAGO', NOW() - INTERVAL '5 hours', NOW() + INTERVAL '19 hours', 'https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/000125')
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado, total = EXCLUDED.total;

-- Pedido 6: PED-000126 (CANCELADO - Pago recibido tras cancelación para reembolso en P4)
INSERT INTO public.pedidos (id, cliente_id, cliente_data, total, estado, motivo_cancelacion, fecha_creacion, fecha_vencimiento_reserva, enlace_pago_activo) VALUES
('PED-000126', 'CLI-006', '{"id":"CLI-006","nombreOIdentificador":"Fabiana Rivas (@fabi_harajuku)","telefono":"943216789","canal":"Instagram"}'::jsonb, 55.00, 'CANCELADO', 'Cancelado por vencimiento de 24 horas', NOW() - INTERVAL '30 hours', NOW() - INTERVAL '6 hours', 'https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/000126')
ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado, total = EXCLUDED.total;

-- 4. DETALLES DE PEDIDO
DELETE FROM public.detalles_pedido WHERE pedido_id IN ('PED-000121', 'PED-000122', 'PED-000123', 'PED-000124', 'PED-000125', 'PED-000126');

INSERT INTO public.detalles_pedido (id, pedido_id, producto_id, producto_nombre, precio_unitario, cantidad, subtotal) VALUES
('DET-101', 'PED-000121', 'PROD-14', 'Set de portaminas Sanrio', 14.00, 1, 14.00),
('DET-102', 'PED-000121', 'PROD-12', 'Sanrio Memopads', 5.00, 2, 10.00),
('DET-103', 'PED-000121', 'PROD-15', 'Llavero de Peluche Tostada Kawaii', 10.00, 1, 10.00),

('DET-201', 'PED-000122', 'PROD-19', 'Vestido de encaje Sweet Fairycore', 55.00, 1, 55.00),
('DET-202', 'PED-000122', 'PROD-15', 'Llavero de Peluche Tostada Kawaii', 15.00, 1, 15.00),

('DET-301', 'PED-000123', 'PROD-39', 'Cartuchera Su Zai Zai (WIFTY)', 24.00, 1, 24.00),
('DET-302', 'PED-000123', 'PROD-12', 'Sanrio Memopads', 5.00, 2, 10.00),

('DET-401', 'PED-000124', 'PROD-13', 'Paleta de sombras de ojos Glitter', 23.00, 1, 23.00),
('DET-402', 'PED-000124', 'PROD-12', 'Sanrio Memopads', 2.00, 1, 2.00),

('DET-501', 'PED-000125', 'PROD-38', 'Trebol Good Luck Keychain', 14.00, 1, 14.00),
('DET-502', 'PED-000125', 'PROD-39', 'Cartuchera Su Zai Zai (WIFTY)', 24.00, 1, 24.00),
('DET-503', 'PED-000125', 'PROD-12', 'Sanrio Memopads', 4.00, 1, 4.00),

('DET-601', 'PED-000126', 'PROD-19', 'Vestido de encaje Sweet Fairycore', 55.00, 1, 55.00);

-- 5. PAGOS REALES Y CONCILIACIÓN
DELETE FROM public.pagos WHERE pedido_id IN ('PED-000122', 'PED-000125', 'PED-000126');

INSERT INTO public.pagos (id, pedido_id, referencia_externa, total_pedido, monto_recibido, diferencia, estado_pago, motivo_observacion, motivo_rechazo, resultado_reembolso) VALUES
('PAG-001', 'PED-000122', 'YAPE-984321', 70.00, 70.00, 0.00, 'APROBADO', NULL, NULL, NULL),
('PAG-002', 'PED-000125', 'YAPE-876543', 42.00, 37.00, -5.00, 'POR_REVISAR', 'Monto incompleto recibido por Yape: faltan S/ 5.00', NULL, NULL),
('PAG-003', 'PED-000126', 'PLIN-654321', 55.00, 55.00, 0.00, 'POR_REVISAR', 'Pago recibido cuando el pedido ya figuraba como CANCELADO por superar las 24 horas de reserva.', NULL, NULL);

-- 6. AUDITORÍA CRONOLÓGICA (historial_estados)
DELETE FROM public.historial_estados WHERE pedido_id IN ('PED-000121', 'PED-000122', 'PED-000123', 'PED-000124', 'PED-000125', 'PED-000126');

INSERT INTO public.historial_estados (id, pedido_id, fecha_hora, estado_anterior, estado_nuevo, origen, observaciones) VALUES
('HIST-101', 'PED-000121', NOW() - INTERVAL '3 hours', 'Nuevo', 'Pendiente de pago', 'Vendedor', 'Pedido registrado por WhatsApp. Stock reservado temporalmente durante 24 horas.'),
('HIST-102', 'PED-000121', NOW() - INTERVAL '2 hours 50 minutes', 'Pendiente de pago', 'Pendiente de pago', 'Vendedor', 'Enlace de pago seguro generado y enviado al cliente.'),

('HIST-201', 'PED-000122', NOW() - INTERVAL '12 hours', 'Nuevo', 'Pendiente de pago', 'Vendedor', 'Pedido registrado por Instagram. Stock reservado temporalmente por 24 horas.'),
('HIST-202', 'PED-000122', NOW() - INTERVAL '8 hours', 'Pendiente de pago', 'Pagado', 'Servicio de Pago', 'Pago confirmado por Yape (Ref: YAPE-984321). Monto exacto S/ 70.00. Stock descontado definitivamente.'),

('HIST-301', 'PED-000123', NOW() - INTERVAL '6 hours', 'Nuevo', 'Pendiente de pago', 'Vendedor', 'Pedido registrado por WhatsApp con reserva temporal activa.'),

('HIST-401', 'PED-000124', NOW() - INTERVAL '28 hours', 'Nuevo', 'Pendiente de pago', 'Vendedor', 'Pedido registrado por Instagram.'),
('HIST-402', 'PED-000124', NOW() - INTERVAL '4 hours', 'Pendiente de pago', 'Cancelado', 'Temporizador', 'Transcurrieron 24 horas sin confirmación de pago. Se cancela el pedido y se libera el stock de vuelta al catálogo disponible.'),

('HIST-501', 'PED-000125', NOW() - INTERVAL '5 hours', 'Nuevo', 'Pendiente de pago', 'Vendedor', 'Pedido registrado con reserva activa de stock.'),
('HIST-502', 'PED-000125', NOW() - INTERVAL '2 hours', 'Pendiente de pago', 'Pendiente de pago', 'Servicio de Pago', 'Pago recibido por Yape con diferencia de -S/ 5.00 (Recibido: S/ 37.00, Total: S/ 42.00). Derivado a revisión manual.'),

('HIST-601', 'PED-000126', NOW() - INTERVAL '30 hours', 'Nuevo', 'Pendiente de pago', 'Vendedor', 'Pedido inicial registrado.'),
('HIST-602', 'PED-000126', NOW() - INTERVAL '6 hours', 'Pendiente de pago', 'Cancelado', 'Temporizador', 'Vencimiento de plazo de 24 horas alcanzado.'),
('HIST-603', 'PED-000126', NOW() - INTERVAL '1 hour', 'Cancelado', 'Cancelado', 'Servicio de Pago', 'Se recibió un pago extemporáneo de S/ 55.00 tras la cancelación. Pasa a revisión para gestión de reembolso.');

-- 7. INTENTOS DE COBRO
DELETE FROM public.intentos_cobro WHERE pedido_id IN ('PED-000121', 'PED-000122', 'PED-000123', 'PED-000124', 'PED-000125', 'PED-000126');

INSERT INTO public.intentos_cobro (id, pedido_id, numero_intento, fecha_hora, resultado, enlace_generado) VALUES
('INT-001', 'PED-000121', 1, NOW() - INTERVAL '2 hours 50 minutes', 'Generado', 'https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/000121'),
('INT-002', 'PED-000122', 1, NOW() - INTERVAL '11 hours', 'Generado', 'https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/000122'),
('INT-003', 'PED-000123', 1, NOW() - INTERVAL '5 hours 30 minutes', 'Generado', 'https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/000123');
