import React, { useState } from 'react';
import { XCircle, ShieldAlert } from 'lucide-react';
import type { Pedido } from '../../types';

interface CancelOrderModalProps {
  order: Pedido;
  onClose: () => void;
  onConfirm: (pedidoId: string, motivo: string) => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  order,
  onClose,
  onConfirm,
}) => {
  const [cancelReason, setCancelReason] = useState('');

  const totalUnits = order.detalles.reduce((acc, d) => acc + d.cantidad, 0);

  const handleConfirm = () => {
    onConfirm(order.id, cancelReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-kawaii border border-rose-300 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#343047]">
              ¿Deseas Cancelar este Pedido? 💔
            </h4>
            <p className="text-xs text-[#746E8B] mt-0.5">
              Pedido <strong>{order.id}</strong> • Total: <strong>S/ {order.total.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-900 space-y-1">
          <span className="font-bold flex items-center gap-1">
            <ShieldAlert size={14} /> Regla de Invariante de Stock Físico:
          </span>
          <p className="text-[11px] leading-relaxed">
            Al cancelar, las unidades retenidas ({totalUnits} unidades) serán <strong>restituidas de inmediato al catálogo disponible</strong> para que otros clientes puedan comprarlas.
          </p>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#665E75] block mb-1">
            Motivo de la Cancelación:
          </label>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Ej. Cliente solicitó cancelación / No envió comprobante"
            className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#343047]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#746E8B] hover:bg-gray-100 transition cursor-pointer"
          >
            No cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
          >
            <XCircle size={14} />
            <span>Sí, Cancelar y Liberar Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
