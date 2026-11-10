import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  History,
  User,
  CreditCard,
  Clock,
  Filter,
  RotateCcw,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import type { OrigenCambio } from '../types';


export const HistoryModal: React.FC = () => {
  const { historyModalOrderId, setHistoryModalOrderId, pedidos } = useStore();

  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [filterOrigen, setFilterOrigen] = useState<string>('TODOS');
  const [searchObs, setSearchObs] = useState<string>('');

  if (!historyModalOrderId) return null;

  const currentPedido = pedidos.find((p) => p.id === historyModalOrderId);
  if (!currentPedido) return null;

  const historial = currentPedido.historial || [];

  // Filtrado de eventos
  const filteredHistorial = historial.filter((item) => {
    if (filterEstado !== 'TODOS') {
      const matchNew = item.estadoNuevo.toLowerCase().includes(filterEstado.toLowerCase());
      const matchOld = item.estadoAnterior.toLowerCase().includes(filterEstado.toLowerCase());
      if (!matchNew && !matchOld) return false;
    }
    if (filterOrigen !== 'TODOS') {
      if (item.origen !== filterOrigen) return false;
    }
    if (searchObs.trim()) {
      if (!item.observaciones.toLowerCase().includes(searchObs.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const handleClearFilters = () => {
    setFilterEstado('TODOS');
    setFilterOrigen('TODOS');
    setSearchObs('');
  };

  const getOriginBadge = (origen: OrigenCambio) => {
    switch (origen) {
      case 'Vendedor':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F6] text-[#F4A7C1] border border-[#F4A7C1]/30">
            <User size={11} /> Vendedor
          </span>
        );
      case 'Servicio de Pago':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3EEFF] text-[#C9B6F2] border border-[#C9B6F2]/30">
            <CreditCard size={11} /> Servicio de Pago
          </span>
        );
      case 'Temporizador':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9B44C]/15 text-[#E9B44C] border border-[#E9B44C]/30">
            <Clock size={11} /> Temporizador (24h)
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('pagado')) return 'text-[#2D9D78] bg-[#2D9D78]/10 border-[#2D9D78]/30';
    if (s.includes('cancelado')) return 'text-[#DE6978] bg-[#DE6978]/10 border-[#DE6978]/30';
    return 'text-[#E9B44C] bg-[#E9B44C]/15 border-[#E9B44C]/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-kawaii border border-[#C9B6F2]/40 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#FFF0F6] to-[#F3EEFF] p-4 border-b border-[#C9B6F2]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9B6F2] text-white flex items-center justify-center shadow-xs">
              <History size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#343047] font-['Quicksand',sans-serif]">
                  Historial de Estados – {currentPedido.id}
                </h3>
                <span className="text-[11px] bg-white text-[#C9B6F2] font-mono px-2 py-0.5 rounded-full border border-[#C9B6F2]/40">
                  CUS-05 (Auditoría)
                </span>
              </div>
              <p className="text-xs text-[#746E8B]">
                Cliente: <strong className="text-[#343047]">{currentPedido.cliente.nombreOIdentificador}</strong> • Total: S/ {currentPedido.total.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setHistoryModalOrderId(null)}
            className="p-1.5 rounded-xl hover:bg-white text-[#746E8B] hover:text-[#343047] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="p-3 bg-[#F8F8FC] border-b border-gray-200/80 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#746E8B]">
            <span className="flex items-center gap-1.5">
              <Filter size={13} className="text-[#C9B6F2]" /> Filtros de Auditoría
            </span>
            {(filterEstado !== 'TODOS' || filterOrigen !== 'TODOS' || searchObs) && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] text-[#F4A7C1] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw size={11} /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Filtro Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="p-2 rounded-xl bg-white border border-gray-200 text-[#343047] focus:outline-none focus:border-[#C9B6F2]"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="Pendiente">Pendiente de pago</option>
              <option value="Pagado">Pagado</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            {/* Filtro Origen */}
            <select
              value={filterOrigen}
              onChange={(e) => setFilterOrigen(e.target.value)}
              className="p-2 rounded-xl bg-white border border-gray-200 text-[#343047] focus:outline-none focus:border-[#C9B6F2]"
            >
              <option value="TODOS">Todos los orígenes</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Servicio de Pago">Servicio de Pago</option>
              <option value="Temporizador">Temporizador</option>
            </select>

            {/* Búsqueda en texto */}
            <input
              type="text"
              placeholder="Buscar en observaciones..."
              value={searchObs}
              onChange={(e) => setSearchObs(e.target.value)}
              className="p-2 rounded-xl bg-white border border-gray-200 text-[#343047] placeholder-[#746E8B] focus:outline-none focus:border-[#C9B6F2]"
            />
          </div>
        </div>

        {/* Línea de Tiempo */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {filteredHistorial.length === 0 ? (
            <div className="text-center py-12 text-[#746E8B]">
              <p className="text-sm font-semibold">
                No se encontraron movimientos con los filtros seleccionados
              </p>
              <p className="text-xs text-[#746E8B]/80 mt-1">
                Prueba relajando los filtros de estado u origen.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#F3EEFF] text-[#C9B6F2] hover:bg-[#C9B6F2]/30 text-xs font-semibold cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#F4A7C1] before:via-[#C9B6F2] before:to-gray-200">
              {filteredHistorial.map((item, idx) => {
                const dateObj = new Date(item.fechaHora);
                const formattedDate = dateObj.toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('es-PE', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div key={item.id || idx} className="relative group">
                    {/* Marcador en la línea */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-[#C9B6F2] flex items-center justify-center group-hover:scale-110 transition shadow-xs">
                      <div className="w-2 h-2 rounded-full bg-[#F4A7C1]" />
                    </div>

                    {/* Tarjeta del evento */}
                    <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs hover:border-[#C9B6F2] transition">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getStatusColor(
                              item.estadoAnterior
                            )}`}
                          >
                            {item.estadoAnterior}
                          </span>
                          <ArrowRight size={12} className="text-[#746E8B]" />
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getStatusColor(
                              item.estadoNuevo
                            )}`}
                          >
                            {item.estadoNuevo}
                          </span>
                        </div>
                        {getOriginBadge(item.origen)}
                      </div>

                      <p className="text-xs text-[#343047] leading-relaxed">
                        {item.observaciones}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#746E8B]">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar size={11} className="text-[#C9B6F2]" />
                          {formattedDate} • {formattedTime}
                        </span>
                        <span className="text-[10px] text-[#746E8B]">
                          ID Evento: #{item.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs shrink-0">
          <span className="text-[#746E8B]">
            Total de movimientos registrados: <strong>{historial.length}</strong>
          </span>
          <button
            onClick={() => setHistoryModalOrderId(null)}
            className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#343047] font-semibold text-xs transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
