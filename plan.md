# plan.md — Plan Técnico de Implementación (SDD)
## Arquitectura, Módulos, Modelo de Datos y Estrategia de Entrega

---

### 1. Enfoque Arquitectónico

Nivalo Store v2 se construye siguiendo el patrón de **Arquitectura en Capas Basada en Componentes (Component-Driven Layered Architecture)** sobre React 19 y TypeScript:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Capa de Presentación UI                     │
│  Storefront (Catálogo/Carrito)  │  Panel Vendedor (P1, P2, P3, P4)│
│  Modales (Simulador Pagos, Historial) │ Notificaciones Toast   │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Despacho de Acciones
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Capa de Lógica de Negocio                    │
│             StoreContext (Motor de Estado Reactivo)             │
│  - Control de Reserva 24h       - Verificación de Invariantes    │
│  - Generador de Enlaces Cobro   - Trazabilidad y Auditoría       │
│  - Conciliación de Pagos        - Motor de Reembolsos            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Capa de Dominio y Datos                      │
│  - Tipos e Interfaces Fuertemente Tipadas (src/types/index.ts)  │
│  - Repositorio en Memoria Reactiva e Inicializador MockData     │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Desglose de Módulos Técnicos

#### Módulo 1: Modelo de Dominio y Tipos (`src/types/index.ts`)
- Modelado formal de entidades: `Cliente`, `Vendedor`, `Producto`, `Pedido`, `DetallePedido`, `ReservaStock`, `IntentoCobro`, `Pago`, `HistorialEstado`.
- Definición de uniones discriminadas y tipos literales para estados: `EstadoPedido`, `EstadoPago`, `OrigenCambio`, `CanalVenta`.

#### Módulo 2: Motor de Estado y Lógica de Negocio (`src/context/StoreContext.tsx`)
- Implementación de `StoreProvider` y hook personalizado `useStore()`.
- Funciones operativas de negocio con validación de invariantes:
  - `createOrder()`: Verificación de stock, reserva de 24h y registro de auditoría.
  - `generatePaymentLink()`: Generación de token firmado y registro de intentos.
  - `processPaymentWebhook()`: Detección de coincidencia de monto vs discrepancia.
  - `simulate24HoursExpiration()`: Cancelación masiva de pedidos vencidos y devolución de inventario.
  - `approveObservedPayment()` / `rejectObservedPayment()` / `retryRefund()`.

#### Módulo 3: Pantallas del Flujo ICONIX
- **P1 (`src/screens/P1RegisterOrder.tsx`):** Selector de canal social, buscador de productos con badge de disponibilidad, control de cantidades con validación de stock disponible, resumen de pedido.
- **P2 (`src/screens/P2GenerateCharge.tsx`):** Selector de pedidos pendientes, generador de enlace criptográfico, temporizador visible, botón de copia y redirección directa a la API de WhatsApp con mensaje estructurado.
- **P3 (`src/screens/P3OrdersList.tsx`):** Tabla de pedidos con filtros por estado, cuenta regresiva en tiempo real, disparador manual de vencimiento para demostración docente y lanzador de auditoría.
- **P4 (`src/screens/P4ReviewPayments.tsx`):** Tablero de conciliación financiera con cálculo de diferencia ($\pm\text{S/}$), modales de justificación de rechazo y trazabilidad de reembolso.

#### Módulo 4: Tienda Pública (Storefront) (`src/screens/Storefront.tsx`)
- Experiencia de compra para clientes: catálogo interactivo con filtros de 10 categorías, carrito deslizable, lista de deseos (wishlist) y botón para transferir el pedido al vendedor en P1.

#### Módulo 5: Herramientas de Demostración y Simulación
- `DemoTourBar.tsx`: Barra superior para ejecutar los 6 escenarios solicitados por el docente con un solo clic.
- `PaymentSimulatorModal.tsx`: Simulador completo de eventos de pasarela (Pago exacto, Monto incorrecto, Notificación duplicada, Pago tardío).

---

### 3. Modelo Físico y Relacional de Base de Datos

El diseño relacional normalizado en 3FN proyectado para persistencia en PostgreSQL / SQLite consta de las siguientes tablas:

1. **`vendedores`** (`id` PK, `nombre`, `usuario`, `rol`, `avatar`)
2. **`clientes`** (`id` PK, `nombre_identificador`, `telefono`, `canal`, `created_at`)
3. **`productos`** (`id` PK, `nombre`, `categoria`, `marca`, `precio`, `stock_total_fisico`, `stock_disponible`, `stock_reservado`, `imagen`, `descripcion`)
4. **`pedidos`** (`id` PK, `cliente_id` FK, `total`, `estado`, `motivo_cancelacion`, `fecha_creacion`, `fecha_vencimiento_reserva`, `enlace_pago_activo`)
5. **`detalles_pedido`** (`id` PK, `pedido_id` FK, `producto_id` FK, `cantidad`, `precio_unitario`, `subtotal`)
6. **`reservas_stock`** (`id` PK, `pedido_id` FK, `producto_id` FK, `cantidad`, `fecha_creacion`, `fecha_vencimiento`, `estado`)
7. **`intentos_cobro`** (`id` PK, `pedido_id` FK, `numero_intento`, `fecha_hora`, `resultado`, `enlace_generado`, `mensaje_error`)
8. **`pagos`** (`id` PK, `pedido_id` FK, `referencia_externa` UNIQUE, `fecha_pago`, `total_pedido`, `monto_recibido`, `diferencia`, `estado_pago`, `motivo_rechazo`, `resultado_reembolso`)
9. **`historial_estados`** (`id` PK, `pedido_id` FK, `fecha_hora`, `estado_anterior`, `estado_nuevo`, `origen`, `observaciones`)

---

### 4. Fases de Despliegue y Ejecución

- **Fase de Desarrollo:** Servidor local Vite (`npm run dev`) con hot-module replacement (HMR).
- **Fase de Empaquetado:** Bundle optimizado con `vite build` y validación estricta de tipos mediante `tsc -b`.
- **Fase de Demostración:** Ejecución en navegador con suite de datos mock precargados para sustentar ante el docente.

