import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  FilePlus,
  CreditCard,
  ListOrdered,
  AlertCircle,
  Heart,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeScreen, setActiveScreen, pedidos, setPaymentSimulatorOpen } = useStore();

  // Contadores
  const pendingCount = pedidos.filter((p) => p.estado === 'PENDIENTE_PAGO').length;
  const observedCount = pedidos
    .flatMap((p) => p.pagos || [])
    .filter((pg) => pg.estadoPago === 'POR_REVISAR').length;

  const navItems: Array<{
    id: 'P1' | 'P2' | 'P3' | 'P4';
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    cus: string;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'P1',
      label: 'Registrar pedido',
      sublabel: 'P1 – Nuevo pedido y stock',
      icon: FilePlus,
      cus: 'CUS-01',
    },
    {
      id: 'P2',
      label: 'Generar cobro',
      sublabel: 'P2 – Enlace de pago',
      icon: CreditCard,
      cus: 'CUS-02',
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-[#C9B6F2] text-white',
    },
    {
      id: 'P3',
      label: 'Lista de pedidos',
      sublabel: 'P3 – Historial y 24h',
      icon: ListOrdered,
      cus: 'CUS-04 / 05',
    },
    {
      id: 'P4',
      label: 'Pagos por revisar',
      sublabel: 'P4 – Conciliación manual',
      icon: AlertCircle,
      cus: 'CUS-06',
      badge: observedCount > 0 ? observedCount : undefined,
      badgeColor: 'bg-[#DE6978] text-white animate-pulse',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white/80 backdrop-blur-md border-r border-[#C9B6F2]/30 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        {/* Banner de Navegación */}
        <div className="px-2 py-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#746E8B]">
            Módulos Principales – Iteración 2
          </span>
        </div>

        {/* 4 Secciones Principales */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full group text-left px-3.5 py-3 rounded-2xl transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFF0F6] to-[#F3EEFF] text-[#343047] font-semibold shadow-kawaii-sm border border-[#F4A7C1]/50'
                    : 'text-[#746E8B] hover:bg-[#FFF0F6]/40 hover:text-[#343047] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#F4A7C1] text-white shadow-xs'
                        : 'bg-[#F3EEFF] text-[#C9B6F2] group-hover:bg-[#F4A7C1]/20 group-hover:text-[#F4A7C1]'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gray-100 text-[#746E8B] font-mono">
                        {item.id}
                      </span>
                    </div>
                    <span className="text-[11px] block text-[#746E8B] font-normal">
                      {item.sublabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${
                      isActive ? 'text-[#F4A7C1] translate-x-0.5' : 'text-gray-300 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Tarjeta de Acceso al Simulador de Pasarela CUS-03 */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF0F6] via-[#F3EEFF] to-white border border-[#C9B6F2]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#343047] flex items-center gap-1">
              <span>💳</span> Pasarela CUS-03
            </span>
            <span className="text-[10px] bg-[#C9B6F2]/30 text-[#343047] font-semibold px-1.5 py-0.5 rounded-full">
              Simulación
            </span>
          </div>
          <p className="text-[11px] text-[#746E8B] leading-snug">
            Prueba la confirmación automática, pagos con diferencia, duplicados y post-cancelación.
          </p>
          <button
            onClick={() => setPaymentSimulatorOpen(true)}
            className="w-full py-1.5 px-2 bg-white hover:bg-[#F3EEFF] text-[#343047] text-xs font-semibold rounded-xl border border-[#C9B6F2]/50 shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Lanzar Pasarela</span>
            <span className="text-[#F4A7C1]">✨</span>
          </button>
        </div>
      </div>

      {/* Footer académico del menú */}
      <div className="p-4 border-t border-gray-100 text-center space-y-2">
        <div className="flex items-center justify-center gap-1 text-[11px] text-[#746E8B]">
          <span>Hecho con</span>
          <Heart size={12} className="text-[#DE6978] fill-[#DE6978]" />
          <span>para Análisis y Sistemas II</span>
        </div>
        <div className="text-[10px] text-[#C9B6F2] font-medium">
          ICONIX Iteración 2 • 2026
        </div>
      </div>
    </aside>
  );
};
