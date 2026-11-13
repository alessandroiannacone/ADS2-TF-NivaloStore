import type { Pedido, Pago, HistorialEstado, TrackingEnvio, EstadoPedido } from '../types';

export interface IOrderRepository {
  findAll(): Promise<Pedido[] | null>;
  save(pedido: Pedido): Promise<boolean>;
  updateStatus(
    id: string,
    estado: EstadoPedido,
    historial: HistorialEstado,
    motivoCancelacion?: string
  ): Promise<boolean>;
  savePayment(pago: Pago): Promise<boolean>;
  updateTracking(
    pedidoId: string,
    tracking: TrackingEnvio,
    historial?: HistorialEstado
  ): Promise<boolean>;
}
