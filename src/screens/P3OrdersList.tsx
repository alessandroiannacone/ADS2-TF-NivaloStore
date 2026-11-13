import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useOrders } from '../hooks';
import {
  Search,
  Clock,
  History,
  CreditCard,
  Flame,
  Truck,
} from 'lucide-react';
import type { EstadoPedido, Pedido, TrackingEnvio } from '../types';
import { TrackingModal } from '../components/modals';

export const P3OrdersList: React.FC = () => {
  const { setActiveScreen } = useStore();
  const {
    pedidos,
    setSelectedOrderId,
    setHistoryModalOrderId,
    simulate24HoursExpiration,
    updateOrderTracking,
  } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [shippingFilter] = useState<string>('TODOS');
  const [selectedForExpiring, setSelectedForExpiring] = useState<string>('ALL');

  // Estado para modal de tracking
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Pedido | null>(null);
  const [isSavingTracking, setIsSavingTracking] = useState<boolean>(false);

  // Guardar actualización de tracking
  const handleSaveTracking = async (pedidoId: string, trackingData: TrackingEnvio) => {
    setIsSavingTracking(true);
    await updateOrderTracking(pedidoId, trackingData);
    setIsSavingTracking(false);
    setSelectedOrderForTracking(null);
  };

  // Calcular tiempo restante para pedidos pendientes
  const getRemainingTime = (isoVencimiento: string, estado: EstadoPedido) => {
    if (estado !== 'PENDIENTE_PAGO') return '—';
    const diffMs = new Date(isoVencimiento).getTime() - new Date().getTime();
    if (diffMs <= 0) return 'Vencido (0h 0m)';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Filtrado de pedidos
  const filteredPedidos = pedidos.filter((p) => {
    // Filtro por estado de pago
    if (statusFilter !== 'TODOS') {
      if (statusFilter === 'PENDIENTE_PAGO' && p.estado !== 'PENDIENTE_PAGO') return false;
      if (statusFilter === 'PAGADO' && p.estado !== 'PAGADO') return false;
      if (statusFilter === 'CANCELADO' && p.estado !== 'CANCELADO') return false;
    }

    // Filtro por estado de envío
    if (shippingFilter !== 'TODOS') {
      const currentShip = p.envio?.estadoEnvio || 'PENDIENTE_ENVIO';
      if (shippingFilter !== currentShip) return false;
    }

    // Buscador por cliente, teléfono, N° de pedido o tracking
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = p.id.toLowerCase().includes(q);
      const matchClient = p.cliente.nombreOIdentificador.toLowerCase().includes(q);
      const matchPhone = p.cliente.telefono.includes(q);
      const matchTracking = p.envio?.numeroSeguimiento?.toLowerCase().includes(q) || false;
      if (!matchId && !matchClient && !matchPhone && !matchTracking) return false;
    }

    return true;
  });

  // Disparar simulación de 24h
  const handleSimulateExpiration = () => {
    if (selectedForExpiring === 'ALL') {
      simulate24HoursExpiration();
    } else {
      simulate24HoursExpiration(selectedForExpiring);
    }
  };

  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      {/* Título de la Pantalla */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4A7C1]/30">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#343047] font-['Quicksand',sans-serif] m-0">
              Control de Pedidos, Envíos y Tracking
            </h2>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FFF0F6] text-[#F4A7C1] border border-[#F4A7C1]/40">
              Olva & Shalom Courier
            </span>
          </div>
          <p className="text-xs text-[#746E8B] m-0 mt-0.5">
            Rastreo en tiempo real, emisión de números de guía de envío, control de reservas de 24 horas y auditoría.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#746E8B]">
            Total: <strong>{pedidos.length}</strong> pedidos registrados
          </span>
        </div>
      </div>

      {/* Control de Reservas 24 horas */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF0F6] via-[#F3EEFF] to-white border border-[#C9B6F2]/40 shadow-kawaii-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E9B44C] text-white flex items-center justify-center shadow-xs">
              <Clock size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#343047] flex items-center gap-1.5">
                <span>Control de Reservas (Ventana de 24 Horas)</span>
              </h4>
              <p className="text-[11px] text-[#746E8B]">
                Los pedidos no pagados al expirar las 24 horas pasan a cancelados y liberan el stock reservado de vuelta al catálogo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedForExpiring}
              onChange={(e) => setSelectedForExpiring(e.target.value)}
              className="text-xs font-medium p-2 rounded-xl border border-gray-200 bg-white text-[#343047] focus:outline-none"
            >
              <option value="ALL">Vencer todos los pendientes</option>
              {pedidos
                .filter((p) => p.estado === 'PENDIENTE_PAGO')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    Solo {p.id} ({p.cliente.nombreOIdentificador})
                  </option>
                ))}
            </select>

            <button
              onClick={handleSimulateExpiration}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E9B44C] hover:bg-[#E9B44C]/90 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Ejecutar verificación de reservas vencidas"
            >
              <Flame size={14} />
              <span>Ejecutar vencimiento de reserva</span>
            </button>
          </div>
        </div>
      </div>

      {/* A. Lista de Pedidos: Filtros y Buscador */}
      <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-3 text-[#746E8B]" />
            <input
              type="text"
              placeholder="Buscar por cliente, @usuario, teléfono, pedido o N° de Guía..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#C9B6F2] text-[#343047]"
            />
          </div>

          {/* Filtro por estado con colores reglamentarios */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'TODOS'
                  ? 'bg-[#343047] text-white shadow-xs'
                  : 'bg-gray-100 text-[#746E8B] hover:bg-gray-200'
              }`}
            >
              Todos ({pedidos.length})
            </button>

            <button
              onClick={() => setStatusFilter('PENDIENTE_PAGO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'PENDIENTE_PAGO'
                  ? 'bg-[#E9B44C] text-white shadow-xs'
                  : 'bg-[#E9B44C]/15 text-[#E9B44C] hover:bg-[#E9B44C]/25'
              }`}
            >
              <span>Pendiente de pago</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/40">
                {pedidos.filter((p) => p.estado === 'PENDIENTE_PAGO').length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('PAGADO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'PAGADO'
                  ? 'bg-[#2D9D78] text-white shadow-xs'
                  : 'bg-[#2D9D78]/15 text-[#2D9D78] hover:bg-[#2D9D78]/25'
              }`}
            >
              <span>Pagado</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/40">
                {pedidos.filter((p) => p.estado === 'PAGADO').length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('CANCELADO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'CANCELADO'
                  ? 'bg-[#DE6978] text-white shadow-xs'
                  : 'bg-[#DE6978]/15 text-[#DE6978] hover:bg-[#DE6978]/25'
              }`}
            >
              <span>Cancelado</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/40">
                {pedidos.filter((p) => p.estado === 'CANCELADO').length}
              </span>
            </button>
          </div>
        </div>

        {/* Tabla Principal con Columna de Tracking */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[#746E8B] text-[11px] font-semibold">
                <th className="py-3 px-2">N° Pedido</th>
                <th className="py-3 px-2">Cliente y Canal</th>
                <th className="py-3 px-2 text-right">Total</th>
                <th className="py-3 px-2 text-center">Estado Pago</th>
                <th className="py-3 px-3 text-center">Envío & Tracking</th>
                <th className="py-3 px-2 text-center">Tiempo Restante</th>
                <th className="py-3 px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#746E8B]">
                    <p className="font-semibold text-sm">No se encontraron pedidos con los criterios actuales</p>
                    <p className="text-[11px] mt-0.5">Intenta cambiar el término de búsqueda o el filtro de estado.</p>
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((pedido) => {
                  const isExpired24h =
                    pedido.estado === 'CANCELADO' &&
                    pedido.motivoCancelacion?.includes('24 h');

                  const ship = pedido.envio;
                  const shipStatus = ship?.estadoEnvio || 'PENDIENTE_ENVIO';

                  return (
                    <tr
                      key={pedido.id}
                      className="hover:bg-gray-50/70 transition duration-150"
                    >
                      {/* Número de Pedido */}
                      <td className="py-3 px-2 font-mono font-bold text-[#343047]">
                        {pedido.id}
                      </td>

                      {/* Cliente */}
                      <td className="py-3 px-2">
                        <div className="font-semibold text-[#343047]">
                          {pedido.cliente.nombreOIdentificador}
                        </div>
                        <div className="text-[10px] text-[#746E8B]">
                          {pedido.cliente.canal} • {pedido.cliente.telefono}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-2 text-right font-bold text-[#F4A7C1] font-mono text-sm">
                        S/ {pedido.total.toFixed(2)}
                      </td>

                      {/* Estado Pago */}
                      <td className="py-3 px-2 text-center">
                        {pedido.estado === 'PAGADO' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2D9D78]/15 text-[#2D9D78] border border-[#2D9D78]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2D9D78]" />
                            Pagado
                          </span>
                        )}

                        {pedido.estado === 'PENDIENTE_PAGO' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E9B44C]/15 text-[#E9B44C] border border-[#E9B44C]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E9B44C] animate-pulse" />
                            Pendiente
                          </span>
                        )}

                        {pedido.estado === 'CANCELADO' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#DE6978]/15 text-[#DE6978] border border-[#DE6978]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DE6978]" />
                            {isExpired24h ? 'Cancelado (24h)' : 'Cancelado'}
                          </span>
                        )}
                      </td>

                      {/* Columna: Envío & Tracking */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          {shipStatus === 'ENTREGADO' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <span>🌸</span> Entregado
                            </span>
                          )}
                          {shipStatus === 'DESPACHADO' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Truck size={11} /> Despachado
                            </span>
                          )}
                          {shipStatus === 'EN_CAMINO' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              <span>🛵</span> En Camino
                            </span>
                          )}
                          {shipStatus === 'EN_PREPARACION' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <span>📦</span> Preparando
                            </span>
                          )}
                          {shipStatus === 'PENDIENTE_ENVIO' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                              <span>⏳</span> Pendiente
                            </span>
                          )}

                          <div className="text-[10px] font-mono text-[#746E8B]">
                            {ship?.empresa || 'Olva Courier'}:{' '}
                            <strong>{ship?.numeroSeguimiento || 'Sin guía'}</strong>
                          </div>
                        </div>
                      </td>

                      {/* Tiempo Restante */}
                      <td className="py-3 px-2 text-center text-xs">
                        {pedido.estado === 'PENDIENTE_PAGO' ? (
                          <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#E9B44C] bg-[#E9B44C]/10 px-2 py-0.5 rounded-md">
                            <Clock size={11} />
                            {getRemainingTime(pedido.fechaVencimientoReserva, pedido.estado)}
                          </span>
                        ) : (
                          <span className="text-[#746E8B] text-[11px]">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Ver Trazabilidad Olva Courier (P6) */}
                          <button
                            onClick={() => {
                              setSelectedOrderId(pedido.id);
                              setActiveScreen('P6');
                            }}
                            className="p-1.5 rounded-xl bg-blue-50 hover:bg-[#002F6C] text-[#002F6C] hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px] font-bold border border-blue-200"
                            title="Ver trazabilidad completa en Olva Courier (P6)"
                          >
                            <Truck size={13} />
                            <span>Ver Olva</span>
                          </button>

                          {/* Botón Gestión de Tracking y Envío */}
                          <button
                            onClick={() => setSelectedOrderForTracking(pedido)}
                            className="p-1.5 rounded-xl bg-purple-50 hover:bg-[#C9B6F2] text-[#742284] hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold border border-[#C9B6F2]/40"
                            title="Gestionar Envío y Tracking"
                          >
                            <Truck size={13} />
                            <span>Tracking</span>
                          </button>

                          {/* Ver Historial */}
                          <button
                            onClick={() => setHistoryModalOrderId(pedido.id)}
                            className="p-1.5 rounded-xl bg-gray-100 hover:bg-[#F3EEFF] text-[#343047] hover:text-[#C9B6F2] transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            title="Ver Historial de Cambios"
                          >
                            <History size={13} />
                            <span className="hidden sm:inline">Historial</span>
                          </button>

                          {/* Generar Cobro (si está pendiente) */}
                          {pedido.estado === 'PENDIENTE_PAGO' && (
                            <button
                              onClick={() => {
                                setSelectedOrderId(pedido.id);
                                setActiveScreen('P2');
                              }}
                              className="p-1.5 rounded-xl bg-[#FFF0F6] hover:bg-[#F4A7C1] text-[#F4A7C1] hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold border border-[#F4A7C1]/30"
                              title="Generar Cobro"
                            >
                              <CreditCard size={13} />
                              <span className="hidden sm:inline">Cobrar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL DE GESTIÓN Y TRACKEO DE ENVÍO ================= */}
      {selectedOrderForTracking && (
        <TrackingModal
          pedido={selectedOrderForTracking}
          onClose={() => setSelectedOrderForTracking(null)}
          onSaveTracking={handleSaveTracking}
          isSaving={isSavingTracking}
        />
      )}
    </div>
  );
};
