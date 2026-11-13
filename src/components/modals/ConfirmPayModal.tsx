import React, { useState } from 'react';
import { CheckCircle2, Check } from 'lucide-react';
import type { Pedido } from '../../types';

interface ConfirmPayModalProps {
  order: Pedido;
  onClose: () => void;
  onConfirm: (pedidoId: string, referencia: string, metodo: string) => void;
}

export const ConfirmPayModal: React.FC<ConfirmPayModalProps> = ({
  order,
  onClose,
  onConfirm,
}) => {
  const [payMethod, setPayMethod] = useState<'Yape' | 'Plin' | 'BCP / Transferencia' | 'Efectivo'>('Yape');
  const [payReference, setPayReference] = useState(
    () => `REF-MANUAL-${Math.floor(100000 + Math.random() * 900000)}`
  );

  const handleConfirm = () => {
    onConfirm(order.id, payReference, payMethod);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-kawaii border border-[#2D9D78]/40 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#343047]">
              ¿Confirmar Pago Recibido? 💜
            </h4>
            <p className="text-xs text-[#746E8B] mt-0.5">
              Pedido <strong>{order.id}</strong> • Cliente: <strong>{order.cliente.nombreOIdentificador}</strong>
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#746E8B]">Total del Pedido a Validar:</span>
            <span className="text-base font-extrabold text-[#DE6978] font-mono">
              S/ {order.total.toFixed(2)}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#665E75] block mb-1">
              Método de Pago:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Yape', 'Plin', 'BCP / Transferencia', 'Efectivo'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayMethod(m)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    payMethod === m
                      ? 'bg-[#742284] text-white border-[#742284] shadow-xs'
                      : 'bg-white text-[#746E8B] border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#665E75] block mb-1">
              N° de Operación / Referencia:
            </label>
            <input
              type="text"
              value={payReference}
              onChange={(e) => setPayReference(e.target.value)}
              placeholder="Ej. REF-YAPE-998167"
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-mono font-bold text-[#343047]"
            />
          </div>
        </div>

        <p className="text-[11px] text-[#746E8B] leading-relaxed">
          🌸 Al confirmar, el pedido pasará de <strong>"Pendiente de pago"</strong> a <strong>"Pagado"</strong>, se descontará definitivamente el stock reservado del almacén y se habilitará el despacho con <strong>Olva Courier</strong>.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#746E8B] hover:bg-gray-100 transition cursor-pointer"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#2D9D78] to-[#10B981] hover:opacity-95 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>Confirmar Pago Aprobado</span>
          </button>
        </div>
      </div>
    </div>
  );
};
