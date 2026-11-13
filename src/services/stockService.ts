import type { Producto, DetallePedido } from '../types';

/**
 * Servicio de Dominio para la Gestión e Invariantes de Stock
 * 
 * Regla Crítica de Negocio (AGENTS.md):
 * Stock Total Físico = Stock Disponible + Stock Reservado
 */
export class StockService {
  /**
   * Valida la invariante fundamental de stock para un producto.
   */
  public static validateStockInvariant(producto: Producto): boolean {
    return producto.stockTotalFisico === (producto.stockDisponible + producto.stockReservado);
  }

  /**
   * Al registrar un pedido (P1 o Checkout Web):
   * Se incrementa stockReservado y se decrementa stockDisponible.
   * El stockTotalFisico permanece constante.
   */
  public static reserveStockForOrder(
    productos: Producto[],
    detalles: DetallePedido[]
  ): Producto[] {
    return productos.map((prod) => {
      const detalle = detalles.find((d) => d.productoId === prod.id);
      if (!detalle) return prod;

      const nuevoDisponible = Math.max(0, prod.stockDisponible - detalle.cantidad);
      const nuevoReservado = prod.stockReservado + detalle.cantidad;

      return {
        ...prod,
        stockDisponible: nuevoDisponible,
        stockReservado: nuevoReservado,
        stockTotalFisico: nuevoDisponible + nuevoReservado,
      };
    });
  }

  /**
   * Al cancelarse un pedido (por vencimiento de 24h o manual):
   * Se decrementa stockReservado y se restituye stockDisponible.
   * El stockTotalFisico permanece constante.
   */
  public static releaseStockFromOrder(
    productos: Producto[],
    detalles: DetallePedido[]
  ): Producto[] {
    return productos.map((prod) => {
      const detalle = detalles.find((d) => d.productoId === prod.id);
      if (!detalle) return prod;

      const nuevoReservado = Math.max(0, prod.stockReservado - detalle.cantidad);
      const nuevoDisponible = prod.stockDisponible + detalle.cantidad;

      return {
        ...prod,
        stockDisponible: nuevoDisponible,
        stockReservado: nuevoReservado,
        stockTotalFisico: nuevoDisponible + nuevoReservado,
      };
    });
  }

  /**
   * Al confirmarse el pago (P2 / P3 / Conciliación):
   * La reserva se consolida como venta final.
   * Se decrementa tanto stockReservado como stockTotalFisico.
   */
  public static confirmStockForOrder(
    productos: Producto[],
    detalles: DetallePedido[]
  ): Producto[] {
    return productos.map((prod) => {
      const detalle = detalles.find((d) => d.productoId === prod.id);
      if (!detalle) return prod;

      const nuevoReservado = Math.max(0, prod.stockReservado - detalle.cantidad);
      const nuevoTotalFisico = Math.max(0, prod.stockTotalFisico - detalle.cantidad);

      return {
        ...prod,
        stockReservado: nuevoReservado,
        stockTotalFisico: nuevoTotalFisico,
      };
    });
  }
}

