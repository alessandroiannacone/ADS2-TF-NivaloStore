import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  CreditCard,
  X,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

export const PaymentSimulatorModal: React.FC = () => {
  const {
    paymentSimulatorOpen,
    setPaymentSimulatorOpen,
    pedidos,
    selectedOrderId,
    processPaymentWebhook,
    setActiveScreen,
  } = useStore();

  const [targetOrderId, setTargetOrderId] = useState<string>('');
  const [monto, setMonto] = useState<string>('');
  const [referencia, setReferencia] = useState<string>('');
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C' | 'D' | 'CUSTOM'>('A');
  const [resultMessage, setResultMessage] = useState<{
    status: 'APROBADO' | 'POR_REVISAR' | 'IGNORADO_DUPLICADO' | 'ERROR';
    text: string;
  } | null>(null);

  // Seleccionar orden por defecto
  useEffect(() => {
    if (selectedOrderId && pedidos.some((p) => p.id === selectedOrderId)) {
      setTargetOrderId(selectedOrderId);
    } else {
      const firstPending = pedidos.find((p) => p.estado === 'PENDIENTE_PAGO');
      if (firstPending) {
        setTargetOrderId(firstPending.id);
      } else if (pedidos.length > 0) {
        setTargetOrderId(pedidos[0].id);
      }
    }
  }, [selectedOrderId, pedidos, paymentSimulatorOpen]);

  const currentPedido = pedidos.find((p) => p.id === targetOrderId);

  // Configurar campos al cambiar escenario
  useEffect(() => {
    if (!currentPedido) return;

    const randomRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    if (activeScenario === 'A') {
      // Escenario A: Pago correcto
      setMonto(currentPedido.total.toFixed(2));
      setReferencia(randomRef);
    } else if (activeScenario === 'B') {
      // Escenario B: Monto incorrecto (diferencia de -S/ 10 o +S/ 15)
      const diffMonto = Math.max(5, currentPedido.total - 10);
      setMonto(diffMonto.toFixed(2));
      setReferencia(randomRef);
    } else if (activeScenario === 'C') {
      // Escenario C: Notificación duplicada (usar una referencia ya existente si hay)
      const existingPayment = pedidos.flatMap((p) => p.pagos || [])[0];
      if (existingPayment) {
        setReferencia(existingPayment.referenciaExterna);
        setMonto(existingPayment.montoRecibido.toFixed(2));
      } else {
        setReferencia('REF-DUPLICADA-999');
        setMonto(currentPedido.total.toFixed(2));
      }
    } else if (activeScenario === 'D') {
      // Escenario D: Pago recibido después de la cancelación
      const cancelledOrder = pedidos.find((p) => p.estado === 'CANCELADO');
      if (cancelledOrder) {
        setTargetOrderId(cancelledOrder.id);
        setMonto(cancelledOrder.total.toFixed(2));
      } else {
        setMonto(currentPedido.total.toFixed(2));
      }
      setReferencia(randomRef);
    }
    setResultMessage(null);
  }, [activeScenario, currentPedido?.id, paymentSimulatorOpen]);

  if (!paymentSimulatorOpen) return null;

  const handleSimulatePayment = () => {
    if (!targetOrderId) return;
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      alert('Ingresa un monto válido.');
      return;
    }
    if (!referencia.trim()) {
      alert('Ingresa una referencia externa.');
      return;
    }

    const res = processPaymentWebhook({
      pedidoId: targetOrderId,
      referenciaExterna: referencia.trim(),
      montoRecibido: numMonto,
    });

    setResultMessage({
      status: res.status,
      text: res.mensaje,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-kawaii border border-[#C9B6F2]/40 overflow-hidden">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#FFF0F6] to-[#F3EEFF] p-4 border-b border-[#C9B6F2]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9B6F2] text-white flex items-center justify-center shadow-xs">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#343047] flex items-center gap-2">
                Simulador de Pasarela de Pagos
                <span className="text-[11px] bg-white text-[#C9B6F2] font-mono px-2 py-0.5 rounded-full border border-[#C9B6F2]/40">
                  CUS-03 (Webhooks)
                </span>
              </h3>
              <p className="text-xs text-[#746E8B]">
                Emula la notificación enviada por el Servicio de Pago a la aplicación
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentSimulatorOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white text-[#746E8B] hover:text-[#343047] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Selector de Pedido */}
          <div>
            <label className="block text-xs font-semibold text-[#343047] mb-1">
              Seleccionar Pedido a Notificar:
            </label>
            <select
              value={targetOrderId}
              onChange={(e) => setTargetOrderId(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#C9B6F2]"
            >
              {pedidos.map((ped) => (
                <option key={ped.id} value={ped.id}>
                  {ped.id} – {ped.cliente.nombreOIdentificador} (Total: S/ {ped.total.toFixed(2)}) [{ped.estado}]
                </option>
              ))}
            </select>
          </div>

          {/* Información del pedido seleccionado */}
          {currentPedido && (
            <div className="p-3 rounded-2xl bg-[#F8F8FC] border border-gray-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[#746E8B]">Cliente: </span>
                <strong className="text-[#343047]">{currentPedido.cliente.nombreOIdentificador}</strong>
                <span className="text-[11px] text-[#746E8B] block mt-0.5">
                  Canal: {currentPedido.cliente.canal} • Tel: {currentPedido.cliente.telefono}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#746E8B] block text-[11px]">Total Requerido:</span>
                <span className="text-sm font-bold text-[#F4A7C1]">
                  S/ {currentPedido.total.toFixed(2)}
                </span>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                    currentPedido.estado === 'PAGADO'
                      ? 'bg-[#2D9D78]/15 text-[#2D9D78]'
                      : currentPedido.estado === 'CANCELADO'
                      ? 'bg-[#DE6978]/15 text-[#DE6978]'
                      : 'bg-[#E9B44C]/15 text-[#E9B44C]'
                  }`}
                >
                  {currentPedido.estado}
                </span>
              </div>
            </div>
          )}

          {/* Selector de los 4 Escenarios de ICONIX */}
          <div>
            <label className="block text-xs font-semibold text-[#343047] mb-1.5">
              Seleccionar Escenario de Prueba (CUS-03):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveScenario('A')}
                className={`p-2.5 rounded-2xl text-left border transition cursor-pointer ${
                  activeScenario === 'A'
                    ? 'border-[#2D9D78] bg-[#2D9D78]/10 text-[#343047] shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50 text-[#746E8B]'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#2D9D78]">
                  <CheckCircle2 size={13} />
                  <span>Escenario A</span>
                </div>
                <div className="text-xs font-semibold mt-0.5">Pago correcto</div>
                <div className="text-[10px] text-[#746E8B] leading-tight mt-0.5">
                  Importe exacto y confirmación
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveScenario('B')}
                className={`p-2.5 rounded-2xl text-left border transition cursor-pointer ${
                  activeScenario === 'B'
                    ? 'border-[#E9B44C] bg-[#E9B44C]/10 text-[#343047] shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50 text-[#746E8B]'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#E9B44C]">
                  <AlertTriangle size={13} />
                  <span>Escenario B</span>
                </div>
                <div className="text-xs font-semibold mt-0.5">Monto incorrecto</div>
                <div className="text-[10px] text-[#746E8B] leading-tight mt-0.5">
                  Diferencia → P4 Por revisar
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveScenario('C')}
                className={`p-2.5 rounded-2xl text-left border transition cursor-pointer ${
                  activeScenario === 'C'
                    ? 'border-[#C9B6F2] bg-[#F3EEFF] text-[#343047] shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50 text-[#746E8B]'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#C9B6F2]">
                  <Copy size={13} />
                  <span>Escenario C</span>
                </div>
                <div className="text-xs font-semibold mt-0.5">Notificación duplicada</div>
                <div className="text-[10px] text-[#746E8B] leading-tight mt-0.5">
                  Regla 9: Ignorar y no duplicar
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveScenario('D')}
                className={`p-2.5 rounded-2xl text-left border transition cursor-pointer ${
                  activeScenario === 'D'
                    ? 'border-[#DE6978] bg-[#FFF0F6] text-[#343047] shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50 text-[#746E8B]'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#DE6978]">
                  <AlertOctagon size={13} />
                  <span>Escenario D</span>
                </div>
                <div className="text-xs font-semibold mt-0.5">Post-cancelación</div>
                <div className="text-[10px] text-[#746E8B] leading-tight mt-0.5">
                  Regla 10: Reembolso en P4
                </div>
              </button>
            </div>
          </div>

          {/* Formulario de parámetros simulados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#343047] mb-1">
                Referencia Externa de Pasarela:
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#C9B6F2]"
                placeholder="ej. REF-984321"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#343047] mb-1">
                Monto Recibido en Soles (S/):
              </label>
              <input
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full text-xs font-medium p-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#C9B6F2]"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Mensaje de resultado de simulación */}
          {resultMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border transition ${
                resultMessage.status === 'APROBADO'
                  ? 'bg-[#2D9D78]/10 text-[#2D9D78] border-[#2D9D78]/30'
                  : resultMessage.status === 'POR_REVISAR'
                  ? 'bg-[#E9B44C]/15 text-[#343047] border-[#E9B44C]/40'
                  : resultMessage.status === 'IGNORADO_DUPLICADO'
                  ? 'bg-[#F3EEFF] text-[#746E8B] border-[#C9B6F2]/40'
                  : 'bg-[#FFF0F6] text-[#DE6978] border-[#DE6978]/40'
              }`}
            >
              <span className="mt-0.5">
                {resultMessage.status === 'APROBADO' && <ShieldCheck size={16} />}
                {resultMessage.status === 'POR_REVISAR' && <AlertTriangle size={16} className="text-[#E9B44C]" />}
                {resultMessage.status === 'IGNORADO_DUPLICADO' && <Copy size={16} className="text-[#C9B6F2]" />}
                {resultMessage.status === 'ERROR' && <AlertOctagon size={16} />}
              </span>
              <div className="flex-1">
                <div className="font-bold">
                  {resultMessage.status === 'APROBADO' && '¡Pago Confirmado y Aprobado!'}
                  {resultMessage.status === 'POR_REVISAR' && 'Pago Registrado como "Por Revisar"'}
                  {resultMessage.status === 'IGNORADO_DUPLICADO' && 'Notificación Duplicada Ignorada'}
                  {resultMessage.status === 'ERROR' && 'Error al procesar pago'}
                </div>
                <p className="mt-0.5 leading-relaxed">{resultMessage.text}</p>
                {resultMessage.status === 'POR_REVISAR' && (
                  <button
                    onClick={() => {
                      setPaymentSimulatorOpen(false);
                      setActiveScreen('P4');
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#DE6978] underline cursor-pointer"
                  >
                    <span>Ir a P4 (Pagos por revisar) para gestionarlo</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal con Acciones */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-[#746E8B]">
            Demostración académica de Webhooks sin transacciones bancarias reales.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaymentSimulatorOpen(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#746E8B] hover:bg-gray-200 transition cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSimulatePayment}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#F4A7C1] to-[#C9B6F2] text-white hover:opacity-95 shadow-kawaii-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Disparar Webhook</span>
              <Sparkles size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
