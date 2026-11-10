# constitution.md — Constitución del Sistema Nivalo Store v2
## Principios Rectores, Invariantes y Reglas No Negociables

Este documento establece la **Constitución del Proyecto Nivalo Store v2**. Define las normas arquitectónicas, de dominio y de calidad que ningún desarrollador ni agente autónomo de Inteligencia Artificial puede quebrantar.

---

### Artículo I: Invariantes Fundamentales de Negocio

1. **Integridad del Inventario (Principio de Conservación de Stock):**
   - El inventario físico jamás puede ser negativo.
   - Todo producto debe satisfacer en todo momento la ecuación:
     $$\text{stockTotalFisico} \equiv \text{stockDisponible} + \text{stockReservado}$$
   - No se permite registrar pedidos cuya cantidad solicitada exceda el `stockDisponible` actual, aun cuando exista `stockTotalFisico`.
2. **Ciclo de Vida de Reserva Temporal (Regla de las 24 Horas):**
   - La reserva temporal generada al crear un pedido tiene una vigencia perentoria e improrrogable de 24 horas naturales (1440 minutos).
   - Un pedido en estado `PENDIENTE_PAGO` cuyo tiempo expire debe ser cancelado forzosamente por el temporizador del sistema.
   - La cancelación automática implica la inmediata restitución del `stockDisponible`.
3. **Principio de Idempotencia y No Duplicidad de Pagos:**
   - Una referencia externa de pasarela de pago (`referenciaExterna`) no puede aplicarse más de una vez a pedidos distintos o al mismo pedido si ya fue procesada.
   - En caso de recibir un webhook duplicado, el sistema debe registrar el evento como `IGNORADO_DUPLICADO` sin alterar el saldo ni el stock.
4. **Trazabilidad Absoluta e Inmutabilidad de Auditoría:**
   - Queda terminantemente prohibido alterar el estado de un pedido sin registrar un evento cronológico en su arreglo `historial`.
   - Cada evento de historial debe detallar con exactitud el actor causante (`Vendedor`, `Servicio de Pago` o `Temporizador`), el timestamp ISO y una justificación u observación clara.

---

### Artículo II: Principios Arquitectónicos y de Código

1. **Arquitectura React Limpia y Desacoplada:**
   - La lógica de negocio, cálculos de stock y mutaciones de estado residen exclusivamente en `src/context/StoreContext.tsx`.
   - Las pantallas (`src/screens/`) y componentes (`src/components/`) deben ser estrictamente componentes de presentación y despacho de acciones.
2. **Tolerancia Cero a Tipos No Seguros en TypeScript:**
   - El uso de `any` está prohibido en todo el repositorio.
   - Toda propiedad de objeto, parámetro de función y retorno debe tener un tipo o interfaz explícito derivado de `src/types/index.ts`.
3. **Inmutabilidad del Estado Reactivo:**
   - El estado nunca debe ser mutado directamente. Todas las operaciones de actualización en `StoreContext` deben utilizar funciones puras que retornen nuevos arrays u objetos.

---

### Artículo III: Experiencia de Usuario, Estética y Accesibilidad

1. **Identidad Visual Corporativa:**
   - La interfaz debe respetar la identidad de marca de Nivalo Store: paleta pastel (#FFF8FA fondo principal, #F4A7C1 acento rosado, #C9B6F2 lavanda, #4A3E4E texto legible).
   - Tipografía principal: Poppins (Google Fonts) para alta legibilidad y estilo moderno.
2. **Retroalimentación en Tiempo Real (Feedback Continuo):**
   - Cualquier acción del usuario (registro de pedido, copia de enlace de pago, cobro recibido, cancelación o reembolso) debe ir acompañada de un mensaje emergente (Toast Notification) visible y auto-desvanecible.
3. **Facilidad de Demostración y Simulación Académica:**
   - El sistema debe incorporar utilidades de simulación accesibles (Barra DemoTourBar, Simulador de Webhooks de Pasarela, Simulador de Vencimiento de 24 horas) para demostrar ante evaluadores cada flujo de la metodología sin requerir infraestructura externa de pago.

