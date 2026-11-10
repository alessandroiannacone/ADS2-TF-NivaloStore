# AGENTS.md — Directivas para Agentes de Inteligencia Artificial
## Proyecto: Nivalo Store v2 (Gestión Omnicanal y Reservas de Pedidos)

Este archivo contiene las directivas, contexto y reglas operativas para cualquier agente de inteligencia artificial (ej. Antigravity Agent, Claude Code, Cursor Composer) que participe en el desarrollo, mantenimiento, refactorización o generación de pruebas de este proyecto.

---

### 1. Perfil y Contexto del Proyecto

- **Nombre del Sistema:** Nivalo Store v2
- **Propósito:** Plataforma web para la gestión omnicanal de pedidos provenientes de redes sociales (WhatsApp e Instagram), emisión y seguimiento de enlaces de pago, control estricto de reserva de stock por 24 horas y conciliación de pagos observados.
- **Paradigma de Desarrollo:** Spec-Driven Development (SDD) bajo metodología Agile Unified Process (AUP) e ICONIX.
- **Entorno de Ejecución:** Navegador Web Moderno (Single Page Application / PWA ready).

---

### 2. Stack Tecnológico Mandatorio

Todos los agentes de IA deben ceñirse estrictamente a las versiones y librerías declaradas en el proyecto:

- **Frontend Core:** React 19.3+ (Functional Components, Hooks estrictos)
- **Lenguaje:** TypeScript 6.0+ en modo estricto (`strict: true`, sin tipos `any`)
- **Empaquetador y Servidor Dev:** Vite 8.3+
- **Estilos:** Tailwind CSS 4+ con tokens de diseño personalizados (tema pastel: `#FFF8FA`, `#F4A7C1`, `#C9B6F2`, `#4A3E4E`)
- **Iconografía:** `lucide-react`
- **Gestión de Estado:** React Context API con `StoreContext` centralizado y persistente en memoria reactiva.
- **Linter & Formato:** Oxlint / TypeScript Compiler (`tsc -b`)

---

### 3. Principios de Arquitectura y Estructura del Código

La base de código sigue una estructura modular y orientada a capas:

```
src/
├── assets/         # Recursos estáticos locales (logos, iconos)
├── components/     # Componentes visuales desacoplados (Header, Sidebar, Modales)
├── context/        # Estado global y orquestación de reglas de negocio (StoreContext.tsx)
├── data/           # Mock data inicial con catálogo, pedidos y vendedor (mockData.ts)
├── screens/        # Pantallas del flujo principal ICONIX (P1, P2, P3, P4, Storefront)
├── types/          # Definición formal de tipos e interfaces de dominio (index.ts)
├── App.tsx         # Enrutador/Layout maestro y modales de soporte
└── main.tsx        # Punto de entrada de la aplicación
```

#### Reglas de Codificación para el Agente:
1. **Inmutabilidad:** Modificar el estado únicamente mediante copias superficiales/profundas inmutables (`map`, `filter`, destructuring `{ ...state }`).
2. **Tipado Obligatorio:** Todo nuevo componente o función debe exportar o utilizar los tipos declarados en `src/types/index.ts`. No inventar estructuras divergentes.
3. **Consistencia Visual:** Mantener la estética visual kawaii/pastel de Nivalo Store. Utilizar fuentes redondeadas (`Poppins`), bordes suaves (`rounded-2xl`, `rounded-3xl`), sombras sutiles (`shadow-sm`, `shadow-md`) y paleta rosada/lavanda.

---

### 4. Reglas Críticas de Negocio que la IA Jamás Debe Violar

1. **Invariante de Stock Físico:**
   $$\text{Stock Total Físico} = \text{Stock Disponible} + \text{Stock Reservado}$$
   - Al registrar un pedido (P1), se incrementa `stockReservado` y se decrementa `stockDisponible`.
   - Al confirmarse el pago (P2/P3), se decrementa tanto `stockReservado` como `stockTotalFisico`.
   - Al cancelarse un pedido (por vencimiento de 24h o manual), se decrementa `stockReservado` y se restituye `stockDisponible`.
2. **Ventana de Reserva de 24 Horas:**
   - Todo pedido nuevo nace en estado `PENDIENTE_PAGO` con un timestamp de expiración a $T + 24\text{ horas}$.
   - Si vence el tiempo y no existe pago aprobado, el pedido pasa a `CANCELADO` y libera stock inmediatamente.
3. **Trazabilidad y Auditoría:**
   - Todo cambio de estado debe añadir un registro en `historial` indicando `fechaHora`, `estadoAnterior`, `estadoNuevo`, `origen` (`'Vendedor' | 'Servicio de Pago' | 'Temporizador'`) y `observaciones`.
4. **Conciliación de Pagos y Discrepancias:**
   - Si $\text{Monto Recibido} = \text{Total Pedido}$, el estado pasa automáticamente a `PAGADO`.
   - Si $\text{Monto Recibido} \neq \text{Total Pedido}$, el pago se categoriza como `POR_REVISAR` y debe ser evaluado manualmente en P4.
   - En caso de rechazo, el sistema debe registrar el motivo e iniciar el proceso de reembolso (`resultadoReembolso`).

---

### 5. Comandos de Verificación y Compilación

Cualquier agente debe validar sus cambios ejecutando:

- `npm run lint`: Asegurar que el código pase el linter Oxlint sin errores.
- `npm run build`: Comprobar que TypeScript compile de manera estricta y que Vite genere el bundle de producción sin fallos.
- `npm run dev`: Iniciar el entorno de desarrollo local en `http://localhost:5173`.

