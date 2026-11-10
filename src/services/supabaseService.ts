import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Producto, Pedido, Pago, HistorialEstado } from '../types';

/**
 * Servicio para sincronizar datos con Supabase Backend (PostgreSQL)
 */

// 1. Obtener productos de Supabase
export const fetchProductsFromSupabase = async (): Promise<Producto[] | null> => {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Error al cargar productos de Supabase:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      categoria: item.categoria,
      marca: item.marca,
      precio: Number(item.precio),
      puntos: item.puntos,
      medidas: item.medidas,
      badge: item.badge,
      color: item.color,
      talla: item.talla,
      stockDisponible: item.stock_disponible,
      stockReservado: item.stock_reservado,
      stockTotalFisico: item.stock_total_fisico,
      imagen: item.imagen,
      descripcion: item.descripcion,
      esOferta: item.es_oferta,
      esFavorito: item.es_favorito,
      esRecomendado: item.es_recomendado,
    }));
  } catch (err) {
    console.warn('Excepción en fetchProductsFromSupabase:', err);
    return null;
  }
};

// 2. Guardar nuevo pedido en Supabase
export const saveOrderToSupabase = async (pedido: Pedido): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    // A) Insertar o actualizar cliente
    await supabase.from('clientes').upsert({
      id: pedido.cliente.id,
      nombre_o_identificador: pedido.cliente.nombreOIdentificador,
      telefono: pedido.cliente.telefono,
      canal: pedido.cliente.canal,
    });

    // B) Insertar pedido maestro
    const { error: orderError } = await supabase.from('pedidos').insert({
      id: pedido.id,
      cliente_id: pedido.cliente.id,
      cliente_data: pedido.cliente,
      total: pedido.total,
      estado: pedido.estado,
      motivo_cancelacion: pedido.motivoCancelacion || null,
      fecha_creacion: pedido.fechaCreacion,
      fecha_vencimiento_reserva: pedido.fechaVencimientoReserva,
      enlace_pago_activo: pedido.enlacePagoActivo || null,
    });

    if (orderError) {
      console.warn('Error al guardar pedido en Supabase:', orderError.message);
      return false;
    }

    // C) Insertar detalles del pedido
    if (pedido.detalles && pedido.detalles.length > 0) {
      const detallesPayload = pedido.detalles.map((d) => ({
        id: d.id,
        pedido_id: pedido.id,
        producto_id: d.productoId,
        producto_nombre: d.productoNombre,
        precio_unitario: d.precioUnitario,
        cantidad: d.cantidad,
        subtotal: d.subtotal,
      }));

      await supabase.from('detalles_pedido').insert(detallesPayload);
    }

    // D) Insertar historial inicial
    if (pedido.historial && pedido.historial.length > 0) {
      const historialPayload = pedido.historial.map((h) => ({
        id: h.id,
        pedido_id: pedido.id,
        fecha_hora: h.fechaHora,
        estado_anterior: h.estadoAnterior,
        estado_nuevo: h.estadoNuevo,
        origen: h.origen,
        observaciones: h.observaciones,
      }));

      await supabase.from('historial_estados').insert(historialPayload);
    }

    return true;
  } catch (err) {
    console.warn('Excepción en saveOrderToSupabase:', err);
    return false;
  }
};

// 3. Actualizar estado de pedido en Supabase
export const updateOrderStatusInSupabase = async (
  pedidoId: string,
  estado: string,
  historialItem?: HistorialEstado,
  motivoCancelacion?: string
): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    await supabase
      .from('pedidos')
      .update({
        estado,
        motivo_cancelacion: motivoCancelacion || null,
      })
      .eq('id', pedidoId);

    if (historialItem) {
      await supabase.from('historial_estados').insert({
        id: historialItem.id,
        pedido_id: pedidoId,
        fecha_hora: historialItem.fechaHora,
        estado_anterior: historialItem.estadoAnterior,
        estado_nuevo: historialItem.estadoNuevo,
        origen: historialItem.origen,
        observaciones: historialItem.observaciones,
      });
    }

    return true;
  } catch (err) {
    console.warn('Excepción en updateOrderStatusInSupabase:', err);
    return false;
  }
};

// 4. Registrar pago en Supabase
export const savePaymentToSupabase = async (pago: Pago): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    await supabase.from('pagos').upsert({
      id: pago.id,
      pedido_id: pago.pedidoId,
      referencia_externa: pago.referenciaExterna,
      fecha_pago: pago.fechaPago,
      total_pedido: pago.totalPedido,
      monto_recibido: pago.montoRecibido,
      diferencia: pago.diferencia,
      estado_pago: pago.estadoPago,
      motivo_observacion: pago.motivoObservacion || null,
      motivo_rechazo: pago.motivoRechazo || null,
      resultado_reembolso: pago.resultadoReembolso || null,
    });
    return true;
  } catch (err) {
    console.warn('Excepción en savePaymentToSupabase:', err);
    return false;
  }
};

// 5. Obtener pedidos desde Supabase
export const fetchOrdersFromSupabase = async (): Promise<Pedido[] | null> => {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        detalles:detalles_pedido(*),
        pagos:pagos(*),
        historial:historial_estados(*)
      `)
      .order('fecha_creacion', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((p: any) => ({
      id: p.id,
      cliente: p.cliente_data,
      total: Number(p.total),
      estado: p.estado,
      motivoCancelacion: p.motivo_cancelacion,
      fechaCreacion: p.fecha_creacion,
      fechaVencimientoReserva: p.fecha_vencimiento_reserva,
      enlacePagoActivo: p.enlace_pago_activo,
      intentosCobro: [],
      detalles: (p.detalles || []).map((d: any) => ({
        id: d.id,
        productoId: d.producto_id,
        productoNombre: d.producto_nombre,
        precioUnitario: Number(d.precio_unitario),
        cantidad: d.cantidad,
        subtotal: Number(d.subtotal),
      })),
      pagos: (p.pagos || []).map((pg: any) => ({
        id: pg.id,
        pedidoId: pg.pedido_id,
        referenciaExterna: pg.referencia_externa,
        fechaPago: pg.fecha_pago,
        totalPedido: Number(pg.total_pedido),
        montoRecibido: Number(pg.monto_recibido),
        diferencia: Number(pg.diferencia),
        estadoPago: pg.estado_pago,
        motivoObservacion: pg.motivo_observacion,
        motivoRechazo: pg.motivo_rechazo,
        resultadoReembolso: pg.resultado_reembolso,
      })),
      historial: (p.historial || []).map((h: any) => ({
        id: h.id,
        pedidoId: h.pedido_id,
        fechaHora: h.fecha_hora,
        estadoAnterior: h.estado_anterior,
        estadoNuevo: h.estado_nuevo,
        origen: h.origen,
        observaciones: h.observaciones,
      })),
    }));
  } catch (err) {
    console.warn('Excepción en fetchOrdersFromSupabase:', err);
    return null;
  }
};

