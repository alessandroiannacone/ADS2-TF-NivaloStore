import { useStore } from '../context/StoreContext';

/**
 * Hook personalizado para la gestión y trazabilidad de Pedidos (ICONIX P1-P4)
 * Encapsula la orquestación de pedidos, pagos, cancelación y envíos.
 */
export function useOrders() {
  const {
    pedidos,
    selectedOrderId,
    setSelectedOrderId,
    historyModalOrderId,
    setHistoryModalOrderId,
    createOrder,
    generatePaymentLink,
    processPaymentWebhook,
    simulate24HoursExpiration,
    approveObservedPayment,
    rejectObservedPayment,
    retryRefund,
    confirmOrderPayment,
    cancelOrder,
    updateOrderTracking,
  } = useStore();

  return {
    pedidos,
    selectedOrderId,
    setSelectedOrderId,
    historyModalOrderId,
    setHistoryModalOrderId,
    createOrder,
    generatePaymentLink,
    processPaymentWebhook,
    simulate24HoursExpiration,
    approveObservedPayment,
    rejectObservedPayment,
    retryRefund,
    confirmOrderPayment,
    cancelOrder,
    updateOrderTracking,
  };
}
