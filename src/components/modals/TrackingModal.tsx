import React, { useState } from 'react';
import {
  Truck,
  X,
  MapPin,
  Check,
  Copy,
  PackageCheck,
} from 'lucide-react';
import type { Pedido, TrackingEnvio, EmpresaEnvio, EstadoEnvio } from '../../types';
import { WhatsAppIcon } from '../WhatsAppIcon';

interface TrackingModalProps {
  pedido: Pedido;
  onClose: () => void;
  onSaveTracking: (pedidoId: string, tracking: TrackingEnvio) => Promise<void>;
  isSaving?: boolean;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  pedido,
  onClose,
  onSaveTracking,
  isSaving = false,
}) => {
  const currentTracking = pedido.envio;
  const [empresa, setEmpresa] = useState<EmpresaEnvio>(
    currentTracking?.empresa || 'Olva Courier'
  );
  const [numero, setNumero] = useState(
    currentTracking?.numeroSeguimiento || `TRK-OLVA-${pedido.id.replace('PED-', '')}`
  );
  const [destino, setDestino] = useState(
    currentTracking?.destino || 'Lima Metropolitana'
  );
  const [estado, setEstado] = useState<EstadoEnvio>(
    currentTracking?.estadoEnvio || 'PENDIENTE_ENVIO'
  );
  const [observaciones, setObservaciones] = useState(
    currentTracking?.observaciones || ''
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const generateWhatsAppMessage = () => {
    const trackingUrl = `https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/tracking?id=${pedido.id}`;
    const msg = `🌸 ¡Hola ${pedido.cliente.nombreOIdentificador}! Tu pedido *${pedido.id}* en *Nivalo Store* tiene actualización de envío:\n\n🚚 *Empresa:* ${empresa}\n📦 *Código de Seguimiento:* ${numero}\n📍 *Estado Actual:* ${estado}\n🔎 *Rastrea tu pedido en vivo aquí:* ${trackingUrl}\n\n¡Gracias por tu preferencia! ✨`;
    return encodeURIComponent(msg);
  };

  const handleSave = async () => {
    const updatedTracking: TrackingEnvio = {
      empresa,
      numeroSeguimiento: numero.trim(),
      ordenEntrega: currentTracking?.ordenEntrega || `ORD-OLVA-2026-${pedido.id.replace('PED-', '')}`,
      estadoEnvio: estado,
      destino: destino.trim(),
      destinatario: currentTracking?.destinatario || pedido.cliente.nombreOIdentificador,
      dniCliente: currentTracking?.dniCliente || '74829103',
      observaciones: observaciones.trim(),
      fechaDespacho:
        currentTracking?.fechaDespacho ||
        (estado === 'DESPACHADO' || estado === 'EN_CAMINO'
          ? new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
          : undefined),
      fechaEntregaEstimada:
        currentTracking?.fechaEntregaEstimada || '18-19 de enero',
      historialEnvio: currentTracking?.historialEnvio || [
        {
          fechaHora: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          titulo: 'Paquete listo para envío',
          descripcion: 'Almacén central Nivalo Store',
          ubicacion: 'Lima',
          estado: 'completado',
        },
      ],
    };

    await onSaveTracking(pedido.id, updatedTracking);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#FCDCE7] shadow-2xl p-6 text-left relative overflow-hidden space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Franja superior pastel */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#742284] via-[#F4A7C1] to-[#C9B6F2]" />

        {/* Cabecera */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#742284] flex items-center justify-center shadow-xs">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#4A3B4E]">
                Seguimiento y Envío
              </h3>
              <p className="text-[11px] text-[#8E7C94]">
                Pedido: <strong className="font-mono text-[#F4A7C1]">{pedido.id}</strong> • {pedido.cliente.nombreOIdentificador}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Resumen de artículos a enviar */}
        <div className="p-3 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#4A3B4E]">
            <span>Artículos incluidos:</span>
            <span className="text-[#DE6978] font-mono">Total: S/ {pedido.total.toFixed(2)}</span>
          </div>
          <div className="text-[11px] text-[#8E7C94] space-y-0.5">
            {(pedido.detalles || []).map((d, i) => (
              <div key={i} className="flex justify-between">
                <span>• {d.cantidad}x {d.productoNombre}</span>
                <span className="font-mono">S/ {d.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario de Tracking */}
        <div className="space-y-3">
          {/* Empresa Courier */}
          <div>
            <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
              Empresa de Envío <span className="text-[#DE6978]">*</span>
            </label>
            <select
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value as EmpresaEnvio)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
            >
              <option value="Olva Courier">Olva Courier (Nacional)</option>
              <option value="Shalom">Shalom (Agencia / Domicilio)</option>
              <option value="Motorizado Express">Motorizado Express (Lima)</option>
              <option value="Recojo en Almacén">Recojo en Almacén (Gratis)</option>
              <option value="Otro">Otro Courier</option>
            </select>
          </div>

          {/* Número de Guía / Tracking */}
          <div>
            <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
              Número de Guía / Código de Tracking
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ej. OLVA-2026-98124 o SHA-99214"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FCDCE7] text-xs font-mono font-bold text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(numero);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3 py-2.5 rounded-2xl bg-white border border-[#FCDCE7] text-xs text-[#8E7C94] hover:text-[#DE6978] transition flex items-center gap-1 cursor-pointer"
                title="Copiar código de guía"
              >
                {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Destino / Dirección */}
          <div>
            <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
              Destino / Dirección de Entrega
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-[#8E7C94]" />
              <input
                type="text"
                placeholder="Ej. Lima Metropolitana, Arequipa, Trujillo..."
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
              />
            </div>
          </div>

          {/* Estado de Envío */}
          <div>
            <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
              Estado Actual del Envío <span className="text-[#DE6978]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'PENDIENTE_ENVIO', label: '⏳ Pendiente', desc: 'Esperando empaque' },
                { id: 'EN_PREPARACION', label: '📦 Preparando', desc: 'Armando con regalito' },
                { id: 'DESPACHADO', label: '🚚 Despachado', desc: 'En agencia courier' },
                { id: 'EN_CAMINO', label: '🛵 En Camino', desc: 'En ruta de entrega' },
                { id: 'ENTREGADO', label: '🌸 Entregado', desc: 'Recibido por cliente' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setEstado(st.id as EstadoEnvio)}
                  className={`p-2.5 rounded-2xl text-left border transition cursor-pointer ${
                    estado === st.id
                      ? 'border-[#742284] bg-purple-50 text-[#742284] font-bold shadow-xs'
                      : 'border-gray-200 bg-white text-[#4A3B4E] hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs block">{st.label}</span>
                  <span className="text-[10px] text-[#8E7C94] font-normal block">{st.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
              Observaciones / Notas de Entrega
            </label>
            <input
              type="text"
              placeholder="Ej. Dejar en conserjería, llamar al llegar..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
            />
          </div>
        </div>

        {/* Botón WhatsApp directo al cliente */}
        <a
          href={`https://wa.me/51${pedido.cliente.telefono.replace(/\D/g, '')}?text=${generateWhatsAppMessage()}`}
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
        >
          <WhatsAppIcon size={16} />
          <span>Notificar Tracking por WhatsApp al Cliente</span>
        </a>

        {/* Acciones del Modal */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#4A3B4E] text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#742284] to-[#50155E] hover:opacity-95 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <span>Guardando...</span>
            ) : (
              <>
                <PackageCheck size={15} />
                <span>Actualizar Tracking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
