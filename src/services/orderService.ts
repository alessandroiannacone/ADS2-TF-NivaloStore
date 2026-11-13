import type { HistorialEstado, OrigenCambio } from '../types';

/**
 * Servicio de Dominio para la Lógica de Negocio de Pedidos (ICONIX P1-P4)
 */
export class OrderService {
  /**
   * Umbral para envío gratis: S/ 80.00
   * Menor a 80: S/ 15.00
   * 80 o mayor: S/ 0.00 (Gratis)
   */
  public static readonly FREE_SHIPPING_THRESHOLD = 80;
  public static readonly STANDARD_SHIPPING_COST = 15;

  /**
   * Calcula el costo de envío según el subtotal.
   */
  public static calculateShippingCost(subtotal: number, customShippingCost?: number): number {
    if (customShippingCost !== undefined) {
      return customShippingCost;
    }
    if (subtotal <= 0) return 0;
    return subtotal >= OrderService.FREE_SHIPPING_THRESHOLD ? 0 : OrderService.STANDARD_SHIPPING_COST;
  }

  /**
   * Calcula el total del pedido asegurando coherencia financiera.
   */
  public static calculateOrderTotals(subtotal: number, customShippingCost?: number): {
    subtotal: number;
    costoEnvio: number;
    total: number;
  } {
    const costoEnvio = OrderService.calculateShippingCost(subtotal, customShippingCost);
    return {
      subtotal,
      costoEnvio,
      total: subtotal + costoEnvio,
    };
  }

  /**
   * Determina si la reserva de 24 horas de un pedido ha expirado.
   */
  public static isReservationExpired(fechaVencimientoReserva: string): boolean {
    const expiration = new Date(fechaVencimientoReserva).getTime();
    const now = Date.now();
    return now > expiration;
  }

  /**
   * Calcula la fecha de expiración estándar (24 horas a partir de una fecha dada).
   */
  public static calculate24hExpiration(startDate: Date = new Date()): string {
    return new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }

  /**
   * Fábrica para crear registros de auditoría y trazabilidad inmutables.
   */
  public static createAuditHistory(params: {
    pedidoId: string;
    estadoAnterior: string;
    estadoNuevo: string;
    origen: OrigenCambio;
    observaciones: string;
  }): HistorialEstado {
    return {
      id: `HIST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pedidoId: params.pedidoId,
      fechaHora: new Date().toISOString(),
      estadoAnterior: params.estadoAnterior,
      estadoNuevo: params.estadoNuevo,
      origen: params.origen,
      observaciones: params.observaciones,
    };
  }

  /**
   * Genera la URL pública del portal de pago para el cliente.
   */
  public static generatePaymentUrl(pedidoId: string): string {
    const cleanId = pedidoId.replace('PED-', '');
    return `https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/${cleanId}`;
  }
}

