import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notificaciones, markNotificationAsRead } = useStore();

  // Mostrar la notificación más reciente no leída
  const latestUnread = notificaciones.find((n) => !n.leida);
  if (!latestUnread) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`p-4 rounded-2xl shadow-kawaii border backdrop-blur-md flex items-start gap-3 ${
          latestUnread.tipo === 'success'
            ? 'bg-white/95 border-[#2D9D78]/50 text-[#343047]'
            : latestUnread.tipo === 'warning'
            ? 'bg-white/95 border-[#E9B44C]/50 text-[#343047]'
            : latestUnread.tipo === 'error'
            ? 'bg-white/95 border-[#DE6978]/50 text-[#343047]'
            : 'bg-white/95 border-[#C9B6F2]/50 text-[#343047]'
        }`}
      >
        <span className="mt-0.5">
          {latestUnread.tipo === 'success' && (
            <CheckCircle2 size={18} className="text-[#2D9D78]" />
          )}
          {latestUnread.tipo === 'warning' && (
            <AlertTriangle size={18} className="text-[#E9B44C]" />
          )}
          {latestUnread.tipo === 'error' && (
            <XCircle size={18} className="text-[#DE6978]" />
          )}
          {latestUnread.tipo === 'info' && (
            <Info size={18} className="text-[#C9B6F2]" />
          )}
        </span>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold">{latestUnread.titulo}</h5>
            <span className="text-[10px] text-[#746E8B]">{latestUnread.fechaHora}</span>
          </div>
          <p className="text-[11px] text-[#746E8B] mt-0.5 leading-snug">
            {latestUnread.mensaje}
          </p>
        </div>

        <button
          onClick={() => markNotificationAsRead(latestUnread.id)}
          className="text-gray-400 hover:text-[#343047] transition p-1 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
