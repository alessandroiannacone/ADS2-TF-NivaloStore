import React from 'react';
import {
  CheckCircle2,
  Download,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { WhatsAppIcon } from '../WhatsAppIcon';
import { NIVALO_STORE_CONTACT } from '../../data/mockData';
import type { CulqiChargeResponse } from '../../services/culqiService';
import type { Pedido } from '../../types';

interface CulqiPaymentReceiptProps {
  pedido: Pedido;
  charge: CulqiChargeResponse;
  onBackToStore?: () => void;
  onViewTracking?: () => void;
}

export const CulqiPaymentReceipt: React.FC<CulqiPaymentReceiptProps> = ({
  pedido,
  charge,
  onBackToStore,
  onViewTracking,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const waShareMessage = `🌸 ¡Hola Nivalo Store! Acabo de pagar mi pedido *${pedido.id}* con la pasarela Culqi.\n*Monto:* S/ ${charge.amountSol.toFixed(2)}\n*Ref Culqi:* ${charge.reference_code}\n*Autorización:* ${charge.authorization_code}`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-kawaii border-2 border-emerald-200 text-left space-y-6 animate-in zoom-in-95 duration-300">
      {/* Cabecera de Éxito */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-sm">
          <CheckCircle2 size={36} className="text-emerald-500 animate-bounce" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
          Pago Aprobado por Pasarela Culqi
        </span>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-[#4A3B4E]">
          ¡Tu pago fue procesado con éxito! 🎉
        </h2>
        <p className="text-xs text-[#8E7C94] max-w-md mx-auto">
          Gracias por tu compra en Nivalo Store. Tu pedido está formalmente <strong>PAGADO</strong> y ha sido derivado al centro de preparación de envíos con <strong>Olva Courier</strong>.
        </p>
      </div>

      {/* Recibo Oficial Estilo Voucher */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#FCDCE7] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm text-[#00A9E0]">culqi</span>
            <span className="font-sans text-[11px] text-[#8E7C94]">• Comprobante Oficial</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            APROBADO
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="text-[#8E7C94] block">Código de Pedido:</span>
            <span className="font-bold text-[#4A3B4E]">{pedido.id}</span>
          </div>
          <div>
            <span className="text-[#8E7C94] block">Fecha y Hora:</span>
            <span className="font-bold text-[#4A3B4E]">
              {new Date(charge.creation_date).toLocaleString('es-PE')}
            </span>
          </div>
          <div>
            <span className="text-[#8E7C94] block">ID de Cargo Culqi:</span>
            <span className="font-bold text-[#0072CE] truncate block">{charge.id}</span>
          </div>
          <div>
            <span className="text-[#8E7C94] block">Código Autorización:</span>
            <span className="font-bold text-[#4A3B4E]">{charge.authorization_code}</span>
          </div>
          <div>
            <span className="text-[#8E7C94] block">Método de Pago:</span>
            <span className="font-bold text-[#4A3B4E]">
              {charge.card_brand || charge.payment_method}
              {charge.last_four ? ` (•••• ${charge.last_four})` : ''}
            </span>
          </div>
          <div>
            <span className="text-[#8E7C94] block">Referencia Externa:</span>
            <span className="font-bold text-[#4A3B4E] truncate block">{charge.reference_code}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#FCDCE7] flex items-center justify-between font-sans">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E7C94] tracking-wider block">
              Monto Total Cobrado
            </span>
            <span className="text-xl font-extrabold text-[#DE6978] font-mono">
              S/ {charge.amountSol.toFixed(2)}
            </span>
          </div>
          <span className="text-[11px] text-[#8E7C94] flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Sin comisión al cliente</span>
          </span>
        </div>
      </div>

      {/* Trazabilidad y Envío Olva Courier */}
      <div className="p-4 rounded-2xl bg-[#002F6C]/5 border border-[#002F6C]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#002F6C] text-white flex items-center justify-center shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[#002F6C]">
              Envío Olva Courier Activado 🚚
            </h4>
            <p className="text-[11px] text-[#556987]">
              Se ha generado tu orden de despacho en almacén para entrega en 24h - 48h hábiles.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onViewTracking) {
              onViewTracking();
            } else {
              window.location.hash = `#/tracking?id=${pedido.id}`;
            }
          }}
          className="px-4 py-2 rounded-xl bg-[#002F6C] hover:bg-[#00204A] text-white font-bold text-xs shadow-xs transition cursor-pointer whitespace-nowrap"
        >
          Consultar Tracking Olva →
        </button>
      </div>

      {/* Botones de Acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <a
          href={`https://wa.me/51${NIVALO_STORE_CONTACT.telefono}?text=${encodeURIComponent(waShareMessage)}`}
          target="_blank"
          rel="noreferrer"
          className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <WhatsAppIcon size={18} />
          <span>Notificar compra por WhatsApp</span>
        </a>

        <button
          onClick={handlePrint}
          className="py-3 px-4 rounded-2xl bg-white hover:bg-gray-50 text-[#4A3B4E] border border-gray-200 font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download size={16} />
          <span>Imprimir / Guardar Comprobante</span>
        </button>
      </div>

      {onBackToStore && (
        <div className="text-center pt-2">
          <button
            onClick={onBackToStore}
            className="text-xs font-semibold text-[#E2678D] hover:underline cursor-pointer"
          >
            ← Volver a la Tienda Nivalo Store
          </button>
        </div>
      )}
    </div>
  );
};
