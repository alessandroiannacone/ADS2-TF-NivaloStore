import React, { useState } from 'react';
import { XCircle, AlertCircle } from 'lucide-react';
import type { Pago, Pedido } from '../../types';

interface RejectPaymentModalProps {
  data: { pago: Pago; pedido: Pedido };
  onClose: () => void;
  onReject: (pagoId: string, motivo: string) => void;
}

export const RejectPaymentModal: React.FC<RejectPaymentModalProps> = ({
  data,
  onClose,
  onReject,
}) => {
  const { pago, pedido } = data;
  const [rejectMotivo, setRejectMotivo] = useState('');
  const [rejectErrorMsg, setRejectErrorMsg] = useState('');

  const handleConfirmRejection = () => {
    if (!rejectMotivo.trim()) {
      setRejectErrorMsg('Ingresa un motivo para registrar el rechazo del pago.');
      return;
    }
    onReject(pago.id, rejectMotivo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-kawaii border border-[#DE6978]/40 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F6] text-[#DE6978] flex items-center justify-center shrink-0">
            <XCircle size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#343047]">
              Rechazar Pago y Registrar Reembolso
            </h4>
            <p className="text-xs text-[#746E8B] mt-0.5">
              Pedido <strong>{pedido.id}</strong> • Monto a reembolsar: <strong>S/ {pago.montoRecibido.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#343047] mb-1">
            Motivo del Rechazo <span className="text-[#DE6978]">*</span> (Obligatorio):
          </label>
          <textarea
            rows={3}
            value={rejectMotivo}
            onChange={(e) => {
              setRejectMotivo(e.target.value);
              if (rejectErrorMsg) setRejectErrorMsg('');
            }}
            placeholder="Indica la razón detallada para auditar el rechazo (ej. 'Monto incompleto', 'Pedido cancelado por vencimiento')..."
            className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#DE6978] text-[#343047]"
          />
          {rejectErrorMsg && (
            <p className="text-[11px] text-[#DE6978] mt-1 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> {rejectErrorMsg}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#746E8B] hover:bg-gray-100 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmRejection}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#DE6978] hover:bg-[#DE6978]/90 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
          >
            <XCircle size={14} />
            <span>Confirmar Rechazo y Reembolsar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

