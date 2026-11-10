import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  FilePlus,
  CreditCard,
  ListOrdered,
  AlertCircle,
  Database,
  ChevronRight,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const Sidebar: React.FC = () => {
  const { activeScreen, setActiveScreen, pedidos, productos } = useStore();

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
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'P1',
      label: 'Registrar pedido',
      sublabel: 'Nueva orden y reserva',
      icon: FilePlus,
    },
    {
      id: 'P2',
      label: 'Generar cobro',
      sublabel: 'Enlaces de pago',
      icon: CreditCard,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-[#C9B6F2] text-white',
    },
    {
      id: 'P3',
      label: 'Lista de pedidos',
      sublabel: 'Control y reservas 24h',
      icon: ListOrdered,
    },
    {
      id: 'P4',
      label: 'Pagos por revisar',
      sublabel: 'Conciliación de pagos',
      icon: AlertCircle,
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
            Gestión de Tienda
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

        {/* Resumen de Base de Datos */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF0F6] via-[#F3EEFF] to-white border border-[#C9B6F2]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#343047] flex items-center gap-1.5">
              <Database size={14} className="text-[#9A7BB0]" /> Base de Datos
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isSupabaseConfigured
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase Activo' : 'Modo Local'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-center">
            <div className="bg-white/80 p-2 rounded-xl border border-pink-100">
              <span className="text-[10px] text-[#746E8B] block">Productos</span>
              <span className="text-sm font-bold text-[#343047]">{productos.length}</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
              <span className="text-[10px] text-[#746E8B] block">Pedidos</span>
              <span className="text-sm font-bold text-[#343047]">{pedidos.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer del menú */}
      <div className="p-4 border-t border-gray-100 text-center space-y-1">
        <div className="text-[11px] font-medium text-[#746E8B]">
          Nivalo Store © 2026
        </div>
        <div className="text-[10px] text-[#C9B6F2]">
          Gestión Omnicanal & Reservas
        </div>
      </div>
    </aside>
  );
};
