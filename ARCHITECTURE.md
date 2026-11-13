# Arquitectura de Software y Patrones de Diseño — Nivalo Store v2

Este documento describe la arquitectura formal, los patrones de diseño aplicados y la estructura por capas implementada en **Nivalo Store v2** para garantizar alta mantenibilidad, cohesión, bajo acoplamiento y escalabilidad futura.

---

## 1. Diagrama de Capas del Sistema (Layered Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN (UI / SCREENS)                   │
│   • Storefront (Tienda Online)                                         │
│   • P1 Registrar Pedido          • P4 Validar Pagos / Conciliación      │
│   • P2 Generar Cobro (Yape/Plin) • P5 Gestión de Catálogo               │
│   • P3 Lista & Trazabilidad      • P6 Tracking Olva Courier             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consume
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│           CAPA DE COMPONENTES REUTILIZABLES & MODALES DESACOPLADOS      │
│   • src/components/modals/: TrackingModal, ConfirmPayModal,             │
│     CancelOrderModal, ApprovePaymentModal, RejectPaymentModal          │
│   • src/components/storefront/: ProductCard, CartSidebar               │
│   • src/components/: OlvaCourierLogo, WhatsAppIcon, Header, Sidebar    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consume
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                CAPA DE FACADE / CUSTOM HOOKS (REACT HOOKS)              │
│   • useCart()            : Carrito, Wishlist, Totales, Envíos          │
│   • useOrders()          : Pedidos, Pagos, Conciliación, Tracking      │
│   • useProducts()        : Catálogo, Stock, Altas y Bajas              │
│   • useNotifications()   : Sistema de Alertas Toast                    │
│   • useDemoScenarios()   : Simulador ICONIX Escenarios A, B, C, D      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ orquesta
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA DE ESTADO GLOBAL REACTIVO (CONTEXT)              │
│   • StoreContext.tsx     : Orquestador reactivo de estado en memoria   │
│   • AuthContext.tsx      : Autenticación RBAC (Admin / Cliente)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ delega reglas
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            CAPA DE SERVICIOS DE DOMINIO (DOMAIN LOGIC / DDD)            │
│   • StockService         : Invariante fundamental de stock físico      │
│   • OrderService         : Trazabilidad, 24h vencimiento, envíos       │
│   • NotificationService  : Factoría de auditoría y notificaciones      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ persiste / consulta
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA DE REPOSITORIOS (REPOSITORY PATTERN)            │
│   • IOrderRepository     -> OrderRepository (Supabase / Local Fallback)│
│   • IProductRepository   -> ProductRepository (Supabase / Local)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL / Network
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          INFRAESTRUCTURA Y DATOS                       │
│   • Supabase PostgreSQL (Tablas: pedidos, productos, clientes, pagos) │
│   • LocalStorage (Persistencia offline / fallback resiliente)         │
│   • Pasarelas Simuladas (Yape, Plin, BCP, Olva Courier Tracking)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Patrones de Diseño Aplicados

### A. Patrón Repositorio (Repository Pattern)
- **Ubicación:** `src/repositories/`
- **Interfaces:** `IOrderRepository.ts`, `IProductRepository.ts`
- **Implementaciones:** `OrderRepository.ts`, `ProductRepository.ts`
- **Propósito:** Desacopla la lógica de negocio y los componentes de React de la tecnología de base de datos específica (Supabase PostgreSQL / LocalStorage). Si en el futuro se migra a Firebase, MongoDB o un backend REST/GraphQL en NestJS o Go, basta con crear una nueva implementación de la interfaz correspondiente sin alterar una sola línea de la lógica de negocio o de la UI.

### B. Capa de Servicios de Dominio (Domain Services / DDD)
- **Ubicación:** `src/services/`
- **Servicios:**
  - `StockService`: Encapsula de forma pura e inmutable la regla crítica del invariante de stock físico:
    $$\text{Stock Total Físico} = \text{Stock Disponible} + \text{Stock Reservado}$$
    - `reserveStockForOrder()`: Incrementa `stockReservado` y reduce `stockDisponible`.
    - `releaseStockFromOrder()`: Incrementa `stockDisponible` y reduce `stockReservado`.
    - `confirmStockForOrder()`: Consolida la venta restando `stockReservado` y `stockTotalFisico`.
  - `OrderService`:
    - Cálculo de costos de envío con umbral de S/ 80.00 (envío gratis vs S/ 15.00).
    - Verificación del plazo de reserva de 24 horas (`isReservationExpired`).
    - Generación de entradas inmutables de auditoría (`createAuditHistory`).
  - `NotificationService`: Factoría de notificaciones estandarizadas del sistema.

### C. Patrón Fachada (Facade Pattern) mediante Custom Hooks
- **Ubicación:** `src/hooks/`
- **Hooks:**
  - `useCart()`: Expone únicamente los métodos y estados vinculados a la bolsa de compras y favoritos.
  - `useOrders()`: Expone la gestión de pedidos, pagos, cancelaciones y tracking.
  - `useProducts()`: Expone la gestión del catálogo.
  - `useNotifications()`: Expone la mensajería del sistema.
  - `useDemoScenarios()`: Expone el simulador de escenarios de cobro ICONIX.
- **Propósito:** Previene que los componentes dependan del "God Object" de StoreContext, facilitando tests unitarios, reduciendo dependencias circulares y mejorando la legibilidad.

### D. Principio de Responsabilidad Única (SRP) en Componentes Modales
- **Ubicación:** `src/components/modals/`
- **Componentes:**
  - `TrackingModal`: Gestión de números de guía y estados de envío (Olva Courier, Shalom).
  - `ConfirmPayModal`: Aprobación manual de abonos por Yape, Plin o transferencia bancaria.
  - `CancelOrderModal`: Cancelación controlada con restitución automática de stock al catálogo.
  - `ApprovePaymentModal`: Conciliación de pagos observados con diferencias monetarias menores.
  - `RejectPaymentModal`: Rechazo auditado de pagos con inicio de protocolo de reembolso.

### E. Descomposición Modular de Pantallas Complejas
- **Ubicación:** `src/components/storefront/`
- **Componentes:**
  - `ProductCard`: Tarjeta de producto reutilizable con foto, precio, badges, botón de agregar y favoritos.
  - `CartSidebar`: Panel deslizable del carrito de compras con control de cantidades, barra de progreso para envío gratis y checkout directo por Yape.

---

## 3. Guía de Escalabilidad para Nuevas Funcionalidades

### ¿Cómo agregar una nueva pasarela de pago (ej. Niubiz / Culqi)?
1. Declarar el nuevo método en `src/types/index.ts`.
2. Añadir la lógica de webhook/conciliación en `src/services/orderService.ts`.
3. Consumir la acción a través del hook `useOrders()`.

### ¿Cómo agregar una nueva empresa de envíos (ej. Chazki)?
1. Agregar el literal al tipo `EmpresaEnvio` en `src/types/index.ts`.
2. Agregar la opción en `TrackingModal.tsx`.
3. El cálculo de ruta y plantilla de WhatsApp se actualiza de inmediato sin tocar el resto de la aplicación.
