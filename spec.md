# spec.md — Especificación Funcional del Sistema
## Nivalo Store v2: Sistema Omnicanal de Pedidos y Conciliación de Pagos

---

### 1. Visión General del Sistema

**Nivalo Store** es una tienda especializada en papelería coreana/japonesa (Sanrio), maquillaje kawaii, moda femenina y accesorios de diseño. Opera a través de canales sociales directos (WhatsApp e Instagram).

El sistema **Nivalo Store v2** digitaliza y automatiza el flujo comercial completo: desde la captura de pedidos en redes sociales y la reserva temporal de inventario por 24 horas, hasta la generación de enlaces de cobro con pasarelas de pago digitales (Yape, Plin, Tarjeta), la auditoría de transiciones de estado y la conciliación de pagos observados con soporte de reembolso.

---

### 2. Actores del Sistema

| Actor | Descripción | Responsabilidades |
|---|---|---|
| **Vendedora / Administradora** | Personal de ventas y atención de Nivalo Store (ej. Camila Villavicencio). | Registra pedidos, genera enlaces de cobro, comparte enlaces por WhatsApp, monitorea el panel y resuelve pagos observados en P4. |
| **Cliente de Red Social** | Usuario final que contacta vía WhatsApp o Instagram para adquirir productos o navega el catálogo web. | Proporciona datos de contacto, recibe enlaces de pago, efectúa abonos y recibe notificaciones de pedido. |
| **Servicio de Pasarela de Pago (Externo/Simulado)** | Pasarela digital externa (Culqi, Niubiz, Mercado Pago, Yape). | Notifica vía webhook la confirmación del pago, el monto exacto y la referencia bancaria única. |
| **Temporizador del Sistema (Job / Cron Asíncrono)** | Proceso automatizado en segundo plano. | Evalúa la vigencia de las reservas cada ciclo, cancela pedidos que alcancen las 24 horas sin pago y libera el stock. |

---

### 3. Especificación de Casos de Uso (CUS)

#### CUS-01: Registrar Pedido y Reservar Stock Temporal (24 Horas)
- **Actor Principal:** Vendedora.
- **Precondición:** Existen productos en el catálogo con `stockDisponible > 0`.
- **Flujo Principal:**
  1. La vendedora accede a la pantalla P1 (Registrar Pedido).
  2. Ingresa los datos del cliente: Nombre completo o @usuario de red social y número telefónico.
  3. Selecciona el canal de origen de la venta (`WhatsApp` o `Instagram`).
  4. Selecciona uno o varios productos del catálogo y define las cantidades.
  5. El sistema valida en tiempo real que `cantidad <= stockDisponible`.
  6. El sistema calcula subtotales, total del pedido y proyecta el vencimiento a $T + 24\text{ h}$.
  7. La vendedora presiona "Crear Pedido & Reservar Stock".
  8. El sistema descuenta las unidades de `stockDisponible`, incrementa `stockReservado`, genera el código único (`PED-XXXXXX`), registra el evento en el historial de auditoría y muestra confirmación toast.
- **Flujo Alternativo:**
  - *4a. Stock Insuficiente:* El sistema bloquea el incremento de cantidad y emite una alerta visual indicando el stock disponible remanente.

#### CUS-02: Generar Enlace de Cobro y Compartir por WhatsApp
- **Actor Principal:** Vendedora.
- **Precondición:** El pedido existe y se encuentra en estado `PENDIENTE_PAGO`.
- **Flujo Principal:**
  1. La vendedora ingresa a la pantalla P2 (Generar Cobro) y selecciona el pedido.
  2. El sistema muestra el resumen del pedido, cliente, canal y monto total a pagar.
  3. La vendedora presiona "Generar Enlace de Pago Seguro".
  4. El sistema invoca el servicio de cobro, genera una URL única firmada (ej. `https://pay.nivalo.pe/checkout/PED-000121?sig=...`) y añade un registro de intento con resultado `Generado`.
  5. El sistema habilita botones de acción rápida: "Copiar Enlace" y "Enviar Enlace por WhatsApp".
  6. Al presionar "Enviar por WhatsApp", el sistema abre un enlace `wa.me` con el mensaje estructurado preformateado con datos del pedido y el link de pago.
- **Flujo Alternativo:**
  - *3a. Falla de Conectividad con la Pasarela:* Se registra el intento con resultado `Error`, se muestra toast explicativo y se habilita la opción de reintento.

#### CUS-03: Confirmar Pago vía Notificación de Pasarela (Webhook)
- **Actor Principal:** Servicio de Pasarela de Pago / Vendedora (Simulación).
- **Precondición:** El pedido está `PENDIENTE_PAGO` con reserva activa dentro de las 24 horas.
- **Flujo Principal:**
  1. La pasarela emite una notificación con `pedidoId`, `montoRecibido` y `referenciaExterna`.
  2. El sistema verifica que la referencia no esté previamente registrada (idempotencia).
  3. El sistema valida que $\text{montoRecibido} == \text{totalPedido}$.
  4. El estado del pedido se actualiza a `PAGADO`.
  5. El stock reservado se descuenta definitivamente del inventario físico total (`stockTotalFisico = stockTotalFisico - cantidad`, `stockReservado = stockReservado - cantidad`).
  6. Se registra el pago en el pedido y se añade el evento al historial con origen `Servicio de Pago`.
  7. Se emite notificación toast de éxito.

#### CUS-04: Cancelar Pedido Expirado y Liberar Stock
- **Actor Principal:** Temporizador del Sistema.
- **Precondición:** Pedido en estado `PENDIENTE_PAGO` cuya `fechaVencimientoReserva` ha sido alcanzada ($> 24\text{ horas}$).
- **Flujo Principal:**
  1. El temporizador escanea los pedidos pendientes.
  2. Detecta pedidos con tiempo de reserva agotado.
  3. Cambia el estado del pedido a `CANCELADO` con motivo `"Cancelado (sin pago 24 h)"`.
  4. Por cada detalle del pedido, restituye el stock: decrementa `stockReservado` e incrementa `stockDisponible`.
  5. Registra el evento en el historial con origen `Temporizador`.
  6. Genera notificación toast de advertencia/información en la interfaz.

#### CUS-05: Consultar Historial de Auditoría y Trazabilidad
- **Actor Principal:** Vendedora / Auditor.
- **Precondición:** Existe un pedido registrado en el sistema.
- **Flujo Principal:**
  1. Desde la pantalla P3 o P4, la vendedora hace clic en "Ver Historial" de un pedido.
  2. El sistema despliega el modal interactivo con una línea de tiempo cronológica vertical.
  3. Muestra cada transición: fecha, hora, estado anterior, nuevo estado, observaciones y badge distintivo según el origen (`Vendedor`, `Servicio de Pago` o `Temporizador`).

#### CUS-06: Revisar Pagos Observados y Gestionar Reembolsos
- **Actor Principal:** Vendedora / Administradora.
- **Precondición:** Existe un pago registrado con estado `POR_REVISAR` (discrepancia en monto o pago tardío tras cancelación).
- **Flujo Principal:**
  1. La vendedora accede a la pantalla P4 (Revisar Pagos).
  2. Filtra pagos por estado `POR_REVISAR`.
  3. Visualiza la ficha comparativa: Total del Pedido, Monto Recibido y Diferencia (faltante o excedente).
  4. Opciones de resolución:
     - **Aprobar Manualmente:** Se confirma el pedido a `PAGADO` con nota de auditoría.
     - **Rechazar e Iniciar Reembolso:** Se ingresa el motivo de rechazo (ej. "Monto incompleto no subsanado"), se invoca la API de reembolso a la pasarela y se registra el resultado (`Exitoso` o `Fallido` con botón de reintento).

---

### 4. Reglas de Negocio Codificadas

- **RN01:** Todo pedido debe tener al menos un producto y un cliente con nombre y teléfono válido.
- **RN02:** El tiempo límite de reserva son exactamente 1440 minutos (24 horas).
- **RN03:** No se puede generar enlace de cobro para pedidos ya cancelados o pagados.
- **RN04:** Todo cobro con diferencia de monto $\neq 0$ es retenido obligatoriamente para revisión humana.
- **RN05:** La liberación de stock por cancelación debe restaurar íntegramente la disponibilidad para otros compradores.

