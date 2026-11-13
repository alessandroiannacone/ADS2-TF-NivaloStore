import type { IOrderRepository } from './IOrderRepository';
import type { Pedido, Pago, HistorialEstado, TrackingEnvio, EstadoPedido } from '../types';
import {
  fetchOrdersFromSupabase,
  saveOrderToSupabase,
  updateOrderStatusInSupabase,
  savePaymentToSupabase,
  updateOrderTrackingInSupabase,
} from '../services/supabaseService';

export class OrderRepository implements IOrderRepository {
  async findAll(): Promise<Pedido[] | null> {
    return await fetchOrdersFromSupabase();
  }

  async save(pedido: Pedido): Promise<boolean> {
    return await saveOrderToSupabase(pedido);
  }

  async updateStatus(
    id: string,
    estado: EstadoPedido,
    historial: HistorialEstado,
    motivoCancelacion?: string
  ): Promise<boolean> {
    return await updateOrderStatusInSupabase(id, estado, historial, motivoCancelacion);
  }

  async savePayment(pago: Pago): Promise<boolean> {
    return await savePaymentToSupabase(pago);
  }

  async updateTracking(
    pedidoId: string,
    tracking: TrackingEnvio,
    historial?: HistorialEstado
  ): Promise<boolean> {
    return await updateOrderTrackingInSupabase(pedidoId, tracking, historial);
  }
}

export const orderRepository = new OrderRepository();
