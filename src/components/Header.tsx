import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Bell,
  Sparkles,
  Wifi,
  WifiOff,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  CreditCard,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    vendedor,
    notificaciones,
    markNotificationAsRead,
    clearAllNotifications,
    resetDemoData,
    isOffline,
    setIsOffline,
    setPaymentSimulatorOpen,
    pedidos,
    setViewMode,
  } = useStore();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notificaciones.filter((n) => !n.leida).length;
  const observedCount = pedidos.flatMap((p) => p.pagos || []).filter((pg) => pg.estadoPago === 'POR_REVISAR').length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#F4A7C1]/30 px-4 lg:px-8 py-3 transition-all">
      {/* Alerta de conexión intermitente RNF02 */}
      {isOffline && (
        <div className="mb-2 bg-[#FFF0F6] border border-[#DE6978] text-[#DE6978] px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <WifiOff size={14} />
            <span>
              <strong>Simulación RNF02:</strong> Modo sin conexión activado. Las operaciones se almacenan localmente y se sincronizarán al recuperar la red.
            </span>
          </div>
          <button
            onClick={() => setIsOffline(false)}
            className="text-xs underline hover:text-[#DE6978]/80 cursor-pointer"
          >
            Reconectar
          </button>
        </div>
      )}

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
                🌸 Iteración 2 – ICONIX
              </span>
            </div>
            <p className="text-xs text-[#746E8B] m-0 flex items-center gap-1.5">
              <span>Panel del Vendedor</span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F4A7C1] to-[#EE8EAF] hover:from-[#EE8EAF] hover:to-[#E0799E] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Volver a la Tienda Online (Vista Cliente)"
          >
            <span>🌸</span>
            <span className="hidden sm:inline">Tienda Online</span>
          </button>

          {/* Botón rápido CUS-03 Pasarela */}
          <button
            onClick={() => setPaymentSimulatorOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3EEFF] text-[#746E8B] hover:text-[#343047] hover:bg-[#C9B6F2]/30 border border-[#C9B6F2]/40 text-xs font-medium transition cursor-pointer"
            title="Abrir Simulador de Notificaciones de Pago Pasarela (CUS-03)"
          >
            <CreditCard size={15} className="text-[#C9B6F2]" />
            <span>Simulador CUS-03</span>
            {observedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#DE6978] text-white text-[10px] rounded-full font-bold">
                {observedCount}
              </span>
            )}
          </button>

          {/* Toggle RNF02 Red */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`p-2 rounded-xl text-xs flex items-center gap-1 border transition cursor-pointer ${
              isOffline
                ? 'bg-[#FFF0F6] text-[#DE6978] border-[#DE6978]/40'
                : 'bg-gray-50 hover:bg-gray-100 text-[#746E8B] border-gray-200'
            }`}
            title={isOffline ? 'Red desconectada (RNF02)' : 'Simular desconexión móvil (RNF02)'}
          >
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span className="hidden md:inline text-[11px]">
              {isOffline ? 'Offline' : 'Online'}
            </span>
          </button>

          {/* Restablecer datos */}
          <button
            onClick={resetDemoData}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#746E8B] border border-gray-200 text-xs transition cursor-pointer"
            title="Restablecer datos de demostración a estado inicial"
          >
            <RotateCcw size={16} />
          </button>

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#343047] border border-gray-200 relative transition cursor-pointer"
              title="Notificaciones del sistema"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F4A7C1] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Menú desplegable de notificaciones */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-kawaii border border-[#C9B6F2]/30 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#343047]">Notificaciones</span>
                    <span className="text-[11px] bg-[#F3EEFF] text-[#C9B6F2] font-bold px-2 py-0.5 rounded-full">
                      {notificaciones.length}
                    </span>
                  </div>
                  {notificaciones.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-[#746E8B] hover:text-[#DE6978] cursor-pointer"
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notificaciones.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#746E8B]">
                      <p>✨ No hay notificaciones pendientes</p>
                    </div>
                  ) : (
                    notificaciones.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-2.5 rounded-xl text-xs transition border cursor-pointer ${
                          !notif.leida ? 'bg-[#FFF0F6]/60 border-[#F4A7C1]/40' : 'bg-gray-50/70 border-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5">
                            {notif.tipo === 'success' && <CheckCircle2 size={14} className="text-[#2D9D78]" />}
                            {notif.tipo === 'warning' && <AlertTriangle size={14} className="text-[#E9B44C]" />}
                            {notif.tipo === 'error' && <XCircle size={14} className="text-[#DE6978]" />}
                            {notif.tipo === 'info' && <Info size={14} className="text-[#C9B6F2]" />}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#343047]">{notif.titulo}</span>
                              <span className="text-[10px] text-[#746E8B]">{notif.fechaHora}</span>
                            </div>
                            <p className="text-[11px] text-[#746E8B] mt-0.5 leading-relaxed">
                              {notif.mensaje}
                            </p>
                          </div>
                        </div>
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
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-white hover:bg-[#FFF0F6]/50 border border-gray-200 transition cursor-pointer"
            >
              <div className="relative">
                <img
                  src={vendedor.avatar}
                  alt={vendedor.nombre}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#F4A7C1]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2D9D78] ring-2 ring-white"></span>
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-semibold text-[#343047] leading-tight">
                  {vendedor.nombre}
                </span>
                <span className="block text-[10px] text-[#746E8B] leading-none">
                  {vendedor.usuario}
                </span>
              </div>
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
                      ● Sesión activa simulada
                    </span>
                  </div>
                </div>
                <div className="pt-2 text-[11px] text-[#746E8B] space-y-1">
                  <p><strong>Sucursal:</strong> Lima, Perú</p>
                  <p><strong>Canales:</strong> Instagram & WhatsApp</p>
                  <p className="text-[10px] text-[#C9B6F2] font-medium pt-1">
                    Metodología ICONIX – Análisis y Sistemas II
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
