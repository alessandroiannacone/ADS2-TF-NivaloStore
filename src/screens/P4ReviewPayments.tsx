import React, { useState } from 'react';
import { useOrders } from '../hooks';
import {
  CheckCircle2,
  XCircle,
  History,
  Clock,
  Search,
  Check,
  CreditCard,
  ExternalLink,
  MessageCircle,
  Copy,
} from 'lucide-react';
import type { Pago, Pedido, EstadoPedido } from '../types';
import {
  ConfirmPayModal,
  CancelOrderModal,
  ApprovePaymentModal,
  RejectPaymentModal,
} from '../components/modals';

export const P4ReviewPayments: React.FC = () => {
  const {
    pedidos,
    confirmOrderPayment,
    cancelOrder,
    approveObservedPayment,
    rejectObservedPayment,
    setHistoryModalOrderId,
  } = useOrders();

  // Control de pestañas: 'pendientes' | 'observados' | 'historial'
  const [activeTab, setActiveTab] = useState<'pendientes' | 'observados' | 'historial'>('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Estados para Modales de Acción en Pedidos Pendientes
  const [confirmPayModalOrder, setConfirmPayModalOrder] = useState<Pedido | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<Pedido | null>(null);

  // Estados para Modales de Pagos Observados (Conciliación CUS-03 / CUS-06)
  const [confirmApprovePago, setConfirmApprovePago] = useState<{
    pago: Pago;
    pedido: Pedido;
  } | null>(null);

  const [rejectModalData, setRejectModalData] = useState<{
    pago: Pago;
    pedido: Pedido;
  } | null>(null);

  // 1. Pedidos en estado PENDIENTE_PAGO
  const pendingOrders = pedidos.filter((p) => p.estado === 'PENDIENTE_PAGO');

  // 2. Pagos observados (POR_REVISAR)
  const observedPaymentsWithOrder: Array<{ pago: Pago; pedido: Pedido }> = [];
  for (const ped of pedidos) {
    for (const pg of ped.pagos || []) {
      if (pg.estadoPago === 'POR_REVISAR') {
        observedPaymentsWithOrder.push({ pago: pg, pedido: ped });
      }
    }
  }

  // 3. Pagos históricos ya revisados o conciliados
  const reviewedPaymentsWithOrder: Array<{ pago: Pago; pedido: Pedido }> = [];
  for (const ped of pedidos) {
    for (const pg of ped.pagos || []) {
      if (pg.estadoPago === 'RECHAZADO' || (pg.estadoPago === 'APROBADO' && pg.diferencia !== 0)) {
        reviewedPaymentsWithOrder.push({ pago: pg, pedido: ped });
      }
    }
  }

  // Helper para tiempo restante de reserva de 24h
  const getRemainingTime = (isoVencimiento: string, estado: EstadoPedido) => {
    if (estado !== 'PENDIENTE_PAGO') return '—';
    const diffMs = new Date(isoVencimiento).getTime() - new Date().getTime();
    if (diffMs <= 0) return 'Vencido (0h 0m)';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Confirmar Pago Manual de Pedido Pendiente
  const handleConfirmOrderPayment = (pedidoId: string, referencia: string, metodo: string) => {
    const res = confirmOrderPayment(pedidoId, referencia.trim() || undefined, metodo);
    if (res.success) {
      setConfirmPayModalOrder(null);
    } else {
      alert(res.error || 'No se pudo confirmar el pago.');
    }
  };

  // Confirmar Cancelación Manual de Pedido
  const handleConfirmOrderCancellation = (pedidoId: string, motivo: string) => {
    const res = cancelOrder(pedidoId, motivo.trim());
    if (res.success) {
      setCancelModalOrder(null);
    } else {
      alert(res.error || 'No se pudo cancelar el pedido.');
    }
  };

  // Confirmar Aprobación de Pago Observado (CUS-06)
  const handleConfirmApproval = (pagoId: string) => {
    const res = approveObservedPayment(pagoId);
    if (res.success) {
      setConfirmApprovePago(null);
    } else {
      alert(res.error || 'No se pudo aprobar el pago.');
    }
  };

  // Confirmar Rechazo y Reembolso de Pago Observado
  const handleConfirmRejection = (pagoId: string, motivo: string) => {
    const res = rejectObservedPayment(pagoId, motivo.trim(), false);
    if (res.success) {
      setRejectModalData(null);
    } else {
      alert(res.error || 'Error al procesar el rechazo.');
    }
  };

  // Filtrado de pedidos pendientes
  const filteredPendingOrders = pendingOrders.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.id.toLowerCase().includes(term) ||
      p.cliente.nombreOIdentificador.toLowerCase().includes(term) ||
      p.cliente.telefono.includes(term) ||
      p.detalles.some((d) => d.productoNombre.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-['Poppins',sans-serif]">
      {/* Título de la pantalla y Resumen de Estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F4A7C1]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#FFF0F6] text-[#DE6978] flex items-center justify-center shadow-xs">
              <CreditCard size={18} />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#343047] tracking-tight">
              Validar Pagos & Conciliación
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF0F6] text-[#DE6978] border border-[#DE6978]/40">
              P4 Gestión Omnicanal
            </span>
          </div>
          <p className="text-xs text-[#746E8B] mt-1">
            Revisa todos los pedidos pendientes por cobrar, valida abonos de Yape/Plin, concilia discrepancias o cancela órdenes liberando stock.
          </p>
        </div>

        {/* Resumen de contadores */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-xs font-bold px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingOrders.length} pendientes de cobro</span>
          </span>

          <span className="text-xs font-bold px-3 py-1.5 rounded-2xl bg-[#DE6978]/10 text-[#DE6978] border border-[#DE6978]/30 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#DE6978]" />
            <span>{observedPaymentsWithOrder.length} observados</span>
          </span>
        </div>
      </div>

      {/* PESTAÑAS PRINCIPALES */}
      <div className="flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-[#C9B6F2]/30 w-fit">
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'pendientes'
              ? 'bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] text-white shadow-xs'
              : 'text-[#746E8B] hover:text-[#343047] hover:bg-[#FFF0F6]/50'
          }`}
        >
          <span>⏳ Pedidos Pendientes de Pago</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'pendientes' ? 'bg-white/30 text-white' : 'bg-gray-100 text-[#746E8B]'
            }`}
          >
            {pendingOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('observados')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'observados'
              ? 'bg-gradient-to-r from-[#DE6978] to-[#9F3548] text-white shadow-xs'
              : 'text-[#746E8B] hover:text-[#343047] hover:bg-[#FFF0F6]/50'
          }`}
        >
          <span>⚠️ Pagos Observados / Discrepancias</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'observados' ? 'bg-white/30 text-white' : 'bg-gray-100 text-[#746E8B]'
            }`}
          >
            {observedPaymentsWithOrder.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'historial'
              ? 'bg-[#343047] text-white shadow-xs'
              : 'text-[#746E8B] hover:text-[#343047] hover:bg-gray-100'
          }`}
        >
          <span>📜 Historial y Auditoría</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'historial' ? 'bg-white/30 text-white' : 'bg-gray-100 text-[#746E8B]'
            }`}
          >
            {reviewedPaymentsWithOrder.length}
          </span>
        </button>
      </div>

      {/* PESTAÑA 1: PEDIDOS PENDIENTES DE PAGO */}
      {activeTab === 'pendientes' && (
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#343047] flex items-center gap-2">
                <span>Pedidos en Espera de Validación de Pago</span>
                <span className="text-xs font-normal text-[#746E8B]">
                  (Confirmar recepción de Yape o cancelar para liberar stock)
                </span>
              </h2>
            </div>

            {/* Buscador */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-3 text-[#BAA0AC]" />
              <input
                type="text"
                placeholder="Buscar por cliente, pedido o celular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#343047]"
              />
            </div>
          </div>

          {filteredPendingOrders.length === 0 ? (
            <div className="text-center py-12 text-[#746E8B] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#2D9D78]/10 text-[#2D9D78] mx-auto flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-base font-bold text-[#343047]">
                ¡No hay pedidos pendientes de pago en este momento!
              </h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed">
                Todas las órdenes registradas han sido validadas, pagadas o canceladas. Cuando un cliente haga un pedido por WhatsApp, Instagram o la tienda, aparecerá aquí inmediatamente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[#746E8B] text-[11px] font-semibold">
                    <th className="py-3 px-3">Pedido / Canal</th>
                    <th className="py-3 px-3">Cliente / Teléfono</th>
                    <th className="py-3 px-3">Artículos Reservados</th>
                    <th className="py-3 px-3 text-right">Total a Pagar</th>
                    <th className="py-3 px-3 text-center">Reserva 24h</th>
                    <th className="py-3 px-3 text-center">Enlace de Pago</th>
                    <th className="py-3 px-3 text-right">Acciones Directas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPendingOrders.map((pedido) => {
                    const remainingTime = getRemainingTime(pedido.fechaVencimientoReserva, pedido.estado);
                    const isExpiringSoon = remainingTime.includes('0h') || remainingTime.includes('1h');

                    return (
                      <tr key={pedido.id} className="hover:bg-[#FFF8FA]/60 transition-colors">
                        {/* ID y Canal */}
                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-[#343047] font-mono text-xs">
                            {pedido.id}
                          </div>
                          <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#FFF0F6] text-[#E2678D]">
                            {pedido.cliente.canal || 'WhatsApp'}
                          </span>
                        </td>

                        {/* Cliente y Teléfono */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-[#343047]">
                            {pedido.cliente.nombreOIdentificador}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-[#746E8B]">
                              {pedido.cliente.telefono}
                            </span>
                            <a
                              href={`https://wa.me/51${pedido.cliente.telefono}?text=Hola%20${encodeURIComponent(
                                pedido.cliente.nombreOIdentificador
                              )},%20te%20saludamos%20de%20Nivalo%20Store%20sobre%20tu%20pedido%20${pedido.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700"
                              title="Chatear por WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </a>
                          </div>
                        </td>

                        {/* Artículos Reservados */}
                        <td className="py-3.5 px-3 max-w-xs">
                          <div className="text-[11px] text-[#4A3E4E] space-y-0.5">
                            {pedido.detalles.slice(0, 2).map((det) => (
                              <div key={det.id} className="truncate">
                                • {det.productoNombre}{' '}
                                <span className="text-[#8E7C94] font-medium">(x{det.cantidad})</span>
                              </div>
                            ))}
                            {pedido.detalles.length > 2 && (
                              <span className="text-[10px] text-[#F4A7C1] font-bold">
                                +{pedido.detalles.length - 2} artículo(s) más
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total a Pagar */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="text-sm font-extrabold text-[#DE6978] font-mono">
                            S/ {pedido.total.toFixed(2)}
                          </span>
                        </td>

                        {/* Tiempo de Reserva */}
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                              isExpiringSoon
                                ? 'bg-rose-100 text-rose-700 animate-pulse'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <Clock size={11} />
                            <span>{remainingTime}</span>
                          </span>
                        </td>

                        {/* Enlace de Pago / Copiar */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={`#/pago/${pedido.id.replace('PED-', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-[#FFF0F6] text-[#742284] hover:bg-[#742284] hover:text-white transition shadow-2xs"
                              title="Abrir pasarela de pago Yape/Plin"
                            >
                              <ExternalLink size={13} />
                            </a>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/${pedido.id.replace(
                                    'PED-',
                                    ''
                                  )}`,
                                  '¡Copiado!'
                                )
                              }
                              className="p-1.5 rounded-xl bg-gray-100 text-[#746E8B] hover:text-[#343047] hover:bg-gray-200 transition cursor-pointer"
                              title="Copiar enlace de pago"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                          {copyFeedback && (
                            <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                              {copyFeedback}
                            </span>
                          )}
                        </td>

                        {/* Acciones Directas */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botón: Marcar como Pagado */}
                            <button
                              onClick={() => {
                                setConfirmPayModalOrder(pedido);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2D9D78] to-[#10B981] hover:opacity-95 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                              title="Confirmar abono y cambiar a Pagado"
                            >
                              <Check size={13} />
                              <span>Ya pagó</span>
                            </button>

                            {/* Botón: Cancelar Pedido */}
                            <button
                              onClick={() => setCancelModalOrder(pedido)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition cursor-pointer flex items-center gap-1"
                              title="Cancelar pedido y liberar reserva de stock"
                            >
                              <XCircle size={13} />
                              <span className="hidden md:inline">Cancelar</span>
                            </button>

                            {/* Historial */}
                            <button
                              onClick={() => setHistoryModalOrderId(pedido.id)}
                              className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#746E8B] hover:text-[#343047] transition cursor-pointer"
                              title="Ver historial de auditoría"
                            >
                              <History size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: PAGOS OBSERVADOS CON DISCREPANCIA (CUS-03) */}
      {activeTab === 'observados' && (
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#FFF0F6] text-[#DE6978] flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <h3 className="text-sm font-bold text-[#343047]">
                Pagos Observados en Espera de Decisión
              </h3>
            </div>
            <span className="text-[11px] text-[#746E8B]">
              Diferencia = Monto Recibido - Total Pedido
            </span>
          </div>

          {observedPaymentsWithOrder.length === 0 ? (
            <div className="text-center py-12 text-[#746E8B] space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#2D9D78]/10 text-[#2D9D78] mx-auto flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#343047]">
                ¡Al día! No hay pagos observados pendientes de revisión
              </h4>
              <p className="text-xs max-w-md mx-auto leading-relaxed">
                Todos los cobros recibidos han sido aprobados o gestionados mediante resolución y reembolso.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[#746E8B] text-[11px] font-semibold">
                    <th className="py-3 px-2">Pedido / Cliente</th>
                    <th className="py-3 px-2">Referencia Pasarela</th>
                    <th className="py-3 px-2">Fecha del Pago</th>
                    <th className="py-3 px-2 text-right">Total Pedido</th>
                    <th className="py-3 px-2 text-right">Monto Recibido</th>
                    <th className="py-3 px-2 text-right">Diferencia</th>
                    <th className="py-3 px-2 text-center">Estado Pedido</th>
                    <th className="py-3 px-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {observedPaymentsWithOrder.map(({ pago, pedido }) => {
                    const isCancelledOrder = pedido.estado === 'CANCELADO';
                    const dateObj = new Date(pago.fechaPago);

                    return (
                      <tr key={pago.id} className="hover:bg-gray-50/70 transition duration-150">
                        {/* Pedido y Cliente */}
                        <td className="py-3.5 px-2">
                          <div className="font-bold text-[#343047] font-mono">{pedido.id}</div>
                          <div className="text-[11px] text-[#746E8B]">
                            {pedido.cliente.nombreOIdentificador}
                          </div>
                        </td>

                        {/* Referencia Externa */}
                        <td className="py-3.5 px-2">
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px] text-[#343047]">
                            {pago.referenciaExterna}
                          </span>
                        </td>

                        {/* Fecha */}
                        <td className="py-3.5 px-2 text-[#746E8B]">
                          {dateObj.toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {/* Total Pedido */}
                        <td className="py-3.5 px-2 text-right font-medium text-[#343047]">
                          S/ {pago.totalPedido.toFixed(2)}
                        </td>

                        {/* Monto Recibido */}
                        <td className="py-3.5 px-2 text-right font-bold text-[#343047]">
                          S/ {pago.montoRecibido.toFixed(2)}
                        </td>

                        {/* Diferencia */}
                        <td className="py-3.5 px-2 text-right font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] ${
                              pago.diferencia < 0
                                ? 'bg-rose-100 text-rose-700'
                                : pago.diferencia > 0
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {pago.diferencia > 0 ? '+' : ''}S/ {pago.diferencia.toFixed(2)}
                          </span>
                        </td>

                        {/* Estado Pedido */}
                        <td className="py-3.5 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCancelledOrder
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {pedido.estado}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-2 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isCancelledOrder && (
                              <button
                                onClick={() => setConfirmApprovePago({ pago, pedido })}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#2D9D78] hover:bg-[#2D9D78]/90 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                                title="Aprobar pago con diferencia"
                              >
                                <CheckCircle2 size={13} />
                                <span>Aprobar</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setRejectModalData({ pago, pedido });
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DE6978] hover:bg-[#DE6978]/90 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                              title="Rechazar pago y gestionar reembolso"
                            >
                              <XCircle size={13} />
                              <span>Rechazar y reembolsar</span>
                            </button>

                            <button
                              onClick={() => setHistoryModalOrderId(pedido.id)}
                              className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#746E8B] hover:text-[#343047] transition cursor-pointer"
                              title="Ver historial de auditoría"
                            >
                              <History size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: HISTORIAL DE PAGOS Y CONCILIACIONES */}
      {activeTab === 'historial' && (
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gray-100 text-[#746E8B] flex items-center justify-center text-xs">
                <History size={14} />
              </span>
              <h3 className="text-sm font-bold text-[#343047]">
                Historial de Pagos Conciliados y Reembolsados
              </h3>
            </div>
            <span className="text-[11px] text-[#746E8B]">
              {reviewedPaymentsWithOrder.length} registros auditados
            </span>
          </div>

          {reviewedPaymentsWithOrder.length === 0 ? (
            <p className="text-xs text-center py-6 text-[#746E8B]">
              Aún no se han registrado resoluciones o reembolsos en esta sesión.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {reviewedPaymentsWithOrder.map(({ pago, pedido }) => (
                <div key={pago.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#343047] font-mono">{pedido.id}</span>
                      <span className="text-[#746E8B]">Ref: {pago.referenciaExterna}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-semibold text-[#343047]">
                        Monto: S/ {pago.montoRecibido.toFixed(2)}
                      </span>
                    </div>
                    {pago.motivoRechazo && (
                      <p className="text-[11px] text-[#DE6978] mt-0.5 italic">
                        Motivo: "{pago.motivoRechazo}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pago.estadoPago === 'APROBADO'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {pago.estadoPago}
                    </span>
                    {pago.resultadoReembolso && (
                      <span className="text-[10px] text-[#746E8B] bg-gray-100 px-2 py-0.5 rounded-md">
                        Reembolso: {pago.resultadoReembolso}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALES EXTRAÍDOS DESACOPLADOS */}
      {confirmPayModalOrder && (
        <ConfirmPayModal
          order={confirmPayModalOrder}
          onClose={() => setConfirmPayModalOrder(null)}
          onConfirm={handleConfirmOrderPayment}
        />
      )}

      {cancelModalOrder && (
        <CancelOrderModal
          order={cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
          onConfirm={handleConfirmOrderCancellation}
        />
      )}

      {confirmApprovePago && (
        <ApprovePaymentModal
          data={confirmApprovePago}
          onClose={() => setConfirmApprovePago(null)}
          onApprove={handleConfirmApproval}
        />
      )}

      {rejectModalData && (
        <RejectPaymentModal
          data={rejectModalData}
          onClose={() => setRejectModalData(null)}
          onReject={handleConfirmRejection}
        />
      )}
    </div>
  );
};
