import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Pago, Pedido } from '../../types';

interface ApprovePaymentModalProps {
  data: { pago: Pago; pedido: Pedido };
  onClose: () => void;
  onApprove: (pagoId: string) => void;
}

export const ApprovePaymentModal: React.FC<ApprovePaymentModalProps> = ({
  data,
  onClose,
  onApprove,
}) => {
  const { pago, pedido } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-kawaii border border-[#2D9D78]/40 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2D9D78]/15 text-[#2D9D78] flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#343047]">
              ¿Aprobar pago con diferencia observada?
            </h4>
            <p className="text-xs text-[#746E8B] mt-0.5">
              Pedido <strong>{pedido.id}</strong> • Ref: <strong>{pago.referenciaExterna}</strong>
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#746E8B]">Total del Pedido:</span>
            <span className="font-bold text-[#343047]">S/ {pago.totalPedido.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#746E8B]">Monto Recibido:</span>
            <span className="font-bold text-[#2D9D78]">S/ {pago.montoRecibido.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1">
            <span className="text-[#746E8B]">Diferencia Aceptada:</span>
            <span className="font-bold text-[#F4A7C1]">S/ {pago.diferencia.toFixed(2)}</span>
          </div>
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
            onClick={() => onApprove(pago.id)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2D9D78] hover:bg-[#2D9D78]/90 text-white shadow-xs transition cursor-pointer"
          >
            Sí, aprobar pago
          </button>
        </div>
      </div>
    </div>
  );
};

