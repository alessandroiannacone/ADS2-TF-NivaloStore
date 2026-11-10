# tasks.md — Plan de Tareas de Implementación (SDD)
## Control de Tareas para Agentes de IA y Equipo de Desarrollo

---

### Fase 1: Arquitectura Base y Modelado de Datos
- [x] **TASK-01:** Inicializar proyecto Vite con React 19, TypeScript y Tailwind CSS 4.
- [x] **TASK-02:** Diseñar el archivo de tipos de dominio `src/types/index.ts` con todas las interfaces (`Pedido`, `Producto`, `Pago`, `HistorialEstado`, `Cliente`).
- [x] **TASK-03:** Crear el catálogo de datos de prueba en `src/data/mockData.ts` con productos de Sanrio, Maquillaje, Ropa y Accesorios.
- [x] **TASK-04:** Configurar tokens de diseño visual en Tailwind (paleta pastel `#FFF8FA`, tipografía Poppins).

---

### Fase 2: Motor de Negocio y Estado Centralizado (StoreContext)
- [x] **TASK-05:** Implementar `StoreContext.tsx` con manejo de estado inmutable para pedidos, inventario y notificaciones.
- [x] **TASK-06:** Implementar la regla de reserva de inventario temporal (`stockDisponible` vs `stockReservado`).
- [x] **TASK-07:** Codificar la función de generación de enlace de cobro único y registro de intentos de cobro.
- [x] **TASK-08:** Programar el procesador de webhooks de pasarela con detección de pagos exactos, discrepancias y duplicados.
- [x] **TASK-09:** Implementar el motor de cancelación por expiración de 24 horas y liberación inmediata de stock físico.
- [x] **TASK-10:** Crear funciones de resolución para pagos observados (`approveObservedPayment`, `rejectObservedPayment`, `retryRefund`).

---

### Fase 3: Desarrollo de Pantallas Operativas (ICONIX P1 - P4)
- [x] **TASK-11:** Construir pantalla P1 (`P1RegisterOrder.tsx`): Formulario de cliente, selección de canal (WhatsApp/Instagram) y selector de catálogo con control de stock.
- [x] **TASK-12:** Construir pantalla P2 (`P2GenerateCharge.tsx`): Resumen de orden pendiente, generador de enlace y botón para compartir vía WhatsApp con mensaje dinámico.
- [x] **TASK-13:** Construir pantalla P3 (`P3OrdersList.tsx`): Tabla interactiva de pedidos, temporizadores de reserva activa y botón de simulación de vencimiento de 24 horas.
- [x] **TASK-14:** Construir pantalla P4 (`P4ReviewPayments.tsx`): Bandeja de pagos observados por diferencia de monto, modal de rechazo con causal y control de reembolsos.

---

### Fase 4: Experiencia Omnicanal (Storefront) y Componentes de Soporte
- [x] **TASK-15:** Desarrollar `Storefront.tsx` con catálogo categorizado, vista detallada de producto, carrito de compra y lista de deseos.
- [x] **TASK-16:** Implementar la transferencia interactiva del carrito del cliente a la pantalla de registro de pedido (P1).
- [x] **TASK-17:** Desarrollar `PaymentSimulatorModal.tsx` con soporte para los 4 escenarios de prueba (pago exitoso, monto incorrecto, duplicado, tardío).
- [x] **TASK-18:** Desarrollar `HistoryModal.tsx` con línea de tiempo cronológica y badges de origen (`Vendedor`, `Servicio de Pago`, `Temporizador`).
- [x] **TASK-19:** Implementar `DemoTourBar.tsx` para guiar la sustentación docente paso a paso por los 6 casos de uso.
- [x] **TASK-20:** Desarrollar `NotificationToast.tsx` para retroalimentación instantánea de eventos del sistema (RNF05).

---

### Fase 5: Aseguramiento de Calidad y Transición
- [x] **TASK-21:** Ejecutar análisis estático con Oxlint (`npm run lint`) y corregir advertencias críticas.
- [x] **TASK-22:** Compilar proyecto mediante TypeScript Compiler (`tsc -b`) y empaquetador Vite (`npm run build`).
- [x] **TASK-23:** Ejecutar batería de pruebas de integración manual de los 6 flujos de casos de uso.
- [x] **TASK-24:** Redactar la documentación formal de fases AUP (Inicio y Elaboración) y SDD (Implementación y Transición).

