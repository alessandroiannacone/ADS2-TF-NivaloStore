import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Bell,
  Sparkles,
  ChevronDown,
  Database,
  CheckCheck,
  Trash2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    vendedor,
    notificaciones,
    markNotificationAsRead,
    clearAllNotifications,
    setViewMode,
  } = useStore();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#F4A7C1]/30 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Logo e Identidad */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F4A7C1] to-[#C9B6F2] flex items-center justify-center shadow-kawaii-sm text-white">
            <Sparkles size={20} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#343047] font-['Quicksand',sans-serif] m-0">
                Nivalo Store
              </h1>
              <span className="bg-[#FFF0F6] text-[#F4A7C1] border border-[#F4A7C1]/40 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                🌸 Panel de Control
              </span>
            </div>
            <p className="text-xs text-[#746E8B] m-0 flex items-center gap-1.5">
              <span>Gestión de Pedidos y Stock</span>
              <span className="w-1 h-1 rounded-full bg-[#C9B6F2]"></span>
              <span className="text-[11px] text-[#C9B6F2] font-medium">Ventas por Redes Sociales</span>
            </p>
          </div>
        </div>

        {/* Acciones Rápidas y Perfil */}
        <div className="flex items-center gap-2.5">
          {/* Botón Ir a Tienda Online (Cliente) */}
          <button
            onClick={() => setViewMode('storefront')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F4A7C1] to-[#EE8EAF] hover:from-[#EE8EAF] hover:to-[#E0799E] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Volver a la Tienda Online (Vista Cliente)"
          >
            <span>🛍️</span>
            <span>Ver Tienda Online</span>
          </button>

          {/* Badge Estado Base de Datos */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              isSupabaseConfigured
                ? 'bg-[#2D9D78]/10 text-[#2D9D78] border-[#2D9D78]/30'
                : 'bg-gray-100 text-[#746E8B] border-gray-200'
            }`}
            title={isSupabaseConfigured ? 'Conectado a PostgreSQL en Supabase' : 'Modo local activo'}
          >
            <Database size={13} className={isSupabaseConfigured ? 'text-[#2D9D78]' : 'text-[#746E8B]'} />
            <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Base de Datos Local'}</span>
          </div>

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#343047] border border-gray-200 relative transition cursor-pointer"
              title="Notificaciones del sistema"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DE6978] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Menú Desplegable Notificaciones */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-kawaii border border-[#C9B6F2]/30 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#343047]">Centro de Alertas</span>
                    {unreadCount > 0 && (
                      <span className="bg-[#FFF0F6] text-[#DE6978] text-[10px] font-bold px-2 py-0.2 rounded-full border border-[#DE6978]/30">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => notificaciones.forEach((n) => markNotificationAsRead(n.id))}
                        className="text-[11px] text-[#746E8B] hover:text-[#343047] flex items-center gap-1 transition cursor-pointer"
                        title="Marcar todas como leídas"
                      >
                        <CheckCheck size={13} />
                        <span className="hidden sm:inline">Leer todas</span>
                      </button>
                    )}
                    {notificaciones.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-[#DE6978] hover:text-[#DE6978]/80 flex items-center gap-1 transition cursor-pointer"
                        title="Borrar todas"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 py-2 pr-1">
                  {notificaciones.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#746E8B]">
                      <p>✨ No hay notificaciones pendientes</p>
                    </div>
                  ) : (
                    notificaciones.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl text-xs transition border ${
                          n.tipo === 'success'
                            ? 'bg-[#2D9D78]/5 border-[#2D9D78]/20'
                            : n.tipo === 'warning'
                            ? 'bg-[#E9B44C]/10 border-[#E9B44C]/30'
                            : n.tipo === 'error'
                            ? 'bg-[#DE6978]/10 border-[#DE6978]/30'
                            : 'bg-[#F3EEFF] border-[#C9B6F2]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-bold text-[11px] ${
                              n.tipo === 'success'
                                ? 'text-[#2D9D78]'
                                : n.tipo === 'warning'
                                ? 'text-[#E9B44C]'
                                : n.tipo === 'error'
                                ? 'text-[#DE6978]'
                                : 'text-[#746E8B]'
                            }`}
                          >
                            {n.titulo}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#343047] mt-0.5 leading-snug">{n.mensaje}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Perfil del Vendedor */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
            >
              <img
                src={vendedor.avatar}
                alt={vendedor.nombre}
                className="w-7 h-7 rounded-full object-cover border border-[#F4A7C1]"
              />
              <span className="text-xs font-semibold text-[#343047] hidden md:inline">
                {vendedor.nombre.split(' ')[0]}
              </span>
              <ChevronDown size={14} className="text-[#746E8B]" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-kawaii border border-[#C9B6F2]/30 p-3 z-50">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <img
                    src={vendedor.avatar}
                    alt={vendedor.nombre}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#F4A7C1]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#343047]">{vendedor.nombre}</h4>
                    <p className="text-[11px] text-[#746E8B]">{vendedor.rol}</p>
                    <span className="inline-block mt-0.5 text-[10px] text-[#2D9D78] font-medium bg-[#2D9D78]/10 px-1.5 py-0.2 rounded-full">
                      ● Sesión activa
                    </span>
                  </div>
                </div>
                <div className="pt-2 text-[11px] text-[#746E8B] space-y-1">
                  <p><strong>Ubicación:</strong> Lima, Perú</p>
                  <p><strong>Canales:</strong> Instagram & WhatsApp</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
