// Modelos de datos para Nivalo Store - Iteración 2 (Metodología ICONIX)

export type CanalVenta = 'WhatsApp' | 'Instagram';

export type EstadoPedido = 'PENDIENTE_PAGO' | 'PAGADO' | 'CANCELADO';

export type EstadoPago = 'PENDIENTE' | 'APROBADO' | 'POR_REVISAR' | 'RECHAZADO' | 'REEMBOLSADO';

export type OrigenCambio = 'Vendedor' | 'Servicio de Pago' | 'Temporizador';

export type ResultadoIntento = 'Generado' | 'Error' | 'Sin respuesta';

export interface Vendedor {
  id: string;
  nombre: string;
  usuario: string;
  rol: string;
  avatar: string;
}

export interface Cliente {
  id: string;
  nombreOIdentificador: string; // Nombre o usuario de red social (ej. @sakura_peru o Valeria Mendoza)
  telefono: string;
  canal: CanalVenta;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stockDisponible: number; // Stock físico libre para reservar
  stockReservado: number;  // Stock actualmente comprometido en reservas temporales de 24h
  stockTotalFisico: number; // Stock físico total en tienda
  imagen: string;
  descripcion?: string;
  marca?: string;
  medidas?: string;
  puntos?: number;
  badge?: string;
  talla?: string;
  color?: string;
  subcategoria?: string;
  descuento?: string;
  precioAnterior?: number;
  esOferta?: boolean;
  esFavorito?: boolean;
  esRecomendado?: boolean;
}

export interface DetallePedido {
  id: string;
  productoId: string;
  productoNombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  productoImagen?: string;
}

export interface ReservaStock {
  id: string;
  pedidoId: string;
  productoId: string;
  cantidad: number;
  fechaCreacion: string;
  fechaVencimiento: string; // 24 horas después
  estado: 'ACTIVA' | 'CONFIRMADA' | 'LIBERADA';
}

export interface IntentoCobro {
  id: string;
  pedidoId: string;
  numeroIntento: number;
  fechaHora: string;
  resultado: ResultadoIntento;
  enlaceGenerado?: string;
  mensajeError?: string;
}

export interface HistorialEstado {
  id: string;
  pedidoId: string;
  fechaHora: string;
  estadoAnterior: string;
  estadoNuevo: string;
  origen: OrigenCambio;
  observaciones: string;
}

export interface Pago {
  id: string;
  pedidoId: string;
  referenciaExterna: string; // Código de pasarela (ej. REF-984321)
  fechaPago: string;
  totalPedido: number;
  montoRecibido: number;
  diferencia: number; // Monto recibido - Total pedido
  estadoPago: EstadoPago;
  motivoObservacion?: string;
  motivoRechazo?: string;
  resultadoReembolso?: 'Exitoso' | 'Fallido' | 'Pendiente';
}

export type EstadoEnvio = 'PENDIENTE_ENVIO' | 'EN_PREPARACION' | 'DESPACHADO' | 'EN_CAMINO' | 'ENTREGADO';
export type EmpresaEnvio = 'Olva Courier' | 'Shalom' | 'Motorizado Express' | 'Recojo en Almacén' | 'Otro';

export interface TrackingEnvio {
  empresa: EmpresaEnvio;
  numeroSeguimiento?: string;
  estadoEnvio: EstadoEnvio;
  fechaDespacho?: string;
  fechaEntregaEstimada?: string;
  destino?: string;
  observaciones?: string;
  historialEnvio?: Array<{
    fechaHora: string;
    titulo: string;
    descripcion: string;
  }>;
}

export interface Pedido {
  id: string; // Código único (ej. PED-000120)
  userId?: string; // UUID de usuario autenticado en Supabase Auth
  cliente: Cliente;
  detalles: DetallePedido[];
  subtotal?: number;
  costoEnvio?: number;
  total: number;
  estado: EstadoPedido;
  envio?: TrackingEnvio;
  motivoCancelacion?: string; // ej: "Cancelado (sin pago 24 h)"
  fechaCreacion: string;
  fechaVencimientoReserva: string; // 24h desde creación
  tiempoRestanteMinutos?: number;
  intentosCobro: IntentoCobro[];
  pagos: Pago[];
  historial: HistorialEstado[];
  enlacePagoActivo?: string;
}

export type UserRole = 'ADMIN' | 'CLIENTE';

export interface UserProfile {
  id: string; // UUID de auth.users
  email: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificacionSistema {
  id: string;
  tipo: 'success' | 'warning' | 'error' | 'info';
  titulo: string;
  mensaje: string;
  fechaHora: string;
  leida: boolean;
}
