import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  History,
  RotateCcw,
} from 'lucide-react';
import type { Pago, Pedido } from '../types';

export const P4ReviewPayments: React.FC = () => {
  const {
    pedidos,
    approveObservedPayment,
    rejectObservedPayment,
    retryRefund,
    setHistoryModalOrderId,
  } = useStore();


  // Estados de modales
  const [confirmApprovePago, setConfirmApprovePago] = useState<{
    pago: Pago;
    pedido: Pedido;
  } | null>(null);

  const [rejectModalData, setRejectModalData] = useState<{
    pago: Pago;
    pedido: Pedido;
  } | null>(null);

  const [rejectMotivo, setRejectMotivo] = useState('');
  const [rejectErrorMsg, setRejectErrorMsg] = useState('');

  // Recopilar todos los pagos observados (POR_REVISAR)
  const observedPaymentsWithOrder: Array<{ pago: Pago; pedido: Pedido }> = [];

  for (const ped of pedidos) {
    for (const pg of ped.pagos || []) {
      if (pg.estadoPago === 'POR_REVISAR') {
        observedPaymentsWithOrder.push({ pago: pg, pedido: ped });
      }
    }
  }

  // Recopilar también pagos históricos ya revisados (Aprobados o Rechazados) para auditoría
  const reviewedPaymentsWithOrder: Array<{ pago: Pago; pedido: Pedido }> = [];

  for (const ped of pedidos) {
    for (const pg of ped.pagos || []) {
      if (pg.estadoPago === 'RECHAZADO' || (pg.estadoPago === 'APROBADO' && pg.diferencia !== 0)) {
        reviewedPaymentsWithOrder.push({ pago: pg, pedido: ped });
      }
    }
  }

  // Confirmar Aprobación
  const handleConfirmApproval = () => {
    if (!confirmApprovePago) return;
    const res = approveObservedPayment(confirmApprovePago.pago.id);
    if (res.success) {
      setConfirmApprovePago(null);
    } else {
      alert(res.error || 'No se pudo aprobar el pago.');
    }
  };

  // Confirmar Rechazo y Reembolso
  const handleConfirmRejection = () => {
    if (!rejectModalData) return;
    if (!rejectMotivo.trim()) {
      setRejectErrorMsg('El motivo del rechazo es obligatorio para auditar la operación.');
      return;
    }

    const res = rejectObservedPayment(
      rejectModalData.pago.id,
      rejectMotivo.trim(),
      false
    );

    if (res.success) {
      setRejectModalData(null);
      setRejectMotivo('');
      setRejectErrorMsg('');
    } else {
      setRejectErrorMsg(res.error || 'Error al procesar el rechazo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Título de la pantalla */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4A7C1]/30">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#343047] font-['Quicksand',sans-serif] m-0">
              Pagos por Revisar
            </h2>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FFF0F6] text-[#DE6978] border border-[#DE6978]/40">
              Conciliación
            </span>
          </div>
          <p className="text-xs text-[#746E8B] m-0 mt-0.5">
            Conciliación de pagos con diferencias de importe o recibidos tras la cancelación del pedido. Gestión de aprobación o reembolso.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#DE6978]/15 text-[#DE6978] border border-[#DE6978]/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DE6978] animate-pulse" />
            <span>{observedPaymentsWithOrder.length} pagos pendientes de revisión</span>
          </span>
        </div>
      </div>

      {/* A. Tabla Principal de Pagos Observados */}
      <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#FFF0F6] text-[#DE6978] flex items-center justify-center text-xs font-bold">
              ✓
            </span>
            <h3 className="text-sm font-bold text-[#343047]">
              Pagos Observados en Espera de Decisión
            </h3>
          </div>
          <span className="text-[11px] text-[#746E8B]">
            Diferencia = Monto Recibido - Total Pedido
          </span>
        </div>

        {observedPaymentsWithOrder.length === 0 ? (
          <div className="text-center py-12 text-[#746E8B] space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#2D9D78]/10 text-[#2D9D78] mx-auto flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#343047]">
              ¡Al día! No hay pagos observados pendientes de revisión
            </h4>
            <p className="text-xs max-w-md mx-auto leading-relaxed">
              Todos los cobros recibidos han sido aprobados o gestionados mediante resolución y reembolso.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[#746E8B] text-[11px] font-semibold">
                  <th className="py-3 px-2">Pedido / Cliente</th>
                  <th className="py-3 px-2">Referencia Pasarela</th>
                  <th className="py-3 px-2">Fecha del Pago</th>
                  <th className="py-3 px-2 text-right">Total Pedido</th>
                  <th className="py-3 px-2 text-right">Monto Recibido</th>
                  <th className="py-3 px-2 text-right">Diferencia</th>
                  <th className="py-3 px-2 text-center">Estado Pedido</th>
                  <th className="py-3 px-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {observedPaymentsWithOrder.map(({ pago, pedido }) => {
                  const isCancelledOrder = pedido.estado === 'CANCELADO';
                  const dateObj = new Date(pago.fechaPago);

                  return (
                    <tr
                      key={pago.id}
                      className="hover:bg-gray-50/70 transition duration-150"
                    >
                      {/* Pedido y Cliente */}
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-[#343047] font-mono">{pedido.id}</div>
                        <div className="text-[11px] text-[#746E8B]">
                          {pedido.cliente.nombreOIdentificador}
                        </div>
                      </td>

                      {/* Referencia Externa */}
                      <td className="py-3.5 px-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F3EEFF] text-[#C9B6F2] border border-[#C9B6F2]/30">
                          {pago.referenciaExterna}
                        </span>
                        {pago.resultadoReembolso === 'Fallido' && (
                          <span className="block mt-1 text-[10px] text-[#DE6978] font-bold">
                            ⚠️ Reembolso previo falló
                          </span>
                        )}
                      </td>

                      {/* Fecha de Pago */}
                      <td className="py-3.5 px-2 text-[11px] text-[#746E8B]">
                        <div>{dateObj.toLocaleDateString('es-PE')}</div>
                        <div className="text-[10px] font-mono">
                          {dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Total del Pedido */}
                      <td className="py-3.5 px-2 text-right font-medium text-[#746E8B]">
                        S/ {pago.totalPedido.toFixed(2)}
                      </td>

                      {/* Monto Recibido */}
                      <td className="py-3.5 px-2 text-right font-bold text-[#343047] font-mono">
                        S/ {pago.montoRecibido.toFixed(2)}
                      </td>

                      {/* Diferencia Calculada */}
                      <td className="py-3.5 px-2 text-right">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                            pago.diferencia < 0
                              ? 'bg-[#FFF0F6] text-[#DE6978] border border-[#DE6978]/30'
                              : pago.diferencia > 0
                              ? 'bg-[#E9B44C]/15 text-[#E9B44C] border border-[#E9B44C]/30'
                              : 'bg-gray-100 text-[#746E8B]'
                          }`}
                        >
                          {pago.diferencia > 0 ? '+' : ''}S/ {pago.diferencia.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-[#746E8B] mt-0.5">
                          {pago.diferencia < 0
                            ? 'Déficit (Monto incompleto)'
                            : pago.diferencia > 0
                            ? 'Superávit (Monto en exceso)'
                            : isCancelledOrder
                            ? 'Pago tardío post-cancelación'
                            : 'Monto exacto'}
                        </span>
                      </td>

                      {/* Estado del Pedido */}
                      <td className="py-3.5 px-2 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCancelledOrder
                              ? 'bg-[#DE6978]/15 text-[#DE6978]'
                              : 'bg-[#E9B44C]/15 text-[#E9B44C]'
                          }`}
                        >
                          {pedido.estado}
                        </span>
                      </td>

                      {/* Acciones (Aprobar / Rechazar) */}
                      <td className="py-3.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botón Aprobar (Deshabilitado si el pedido está CANCELADO - Regla 10) */}
                          <button
                            type="button"
                            disabled={isCancelledOrder}
                            onClick={() => setConfirmApprovePago({ pago, pedido })}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isCancelledOrder
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-[#2D9D78] hover:bg-[#2D9D78]/90 text-white shadow-xs'
                            }`}
                            title={
                              isCancelledOrder
                                ? 'Regla 10: Este pedido fue cancelado. No es posible aprobar el pago.'
                                : 'Aprobar pago manualmente'
                            }
                          >
                            <CheckCircle2 size={13} />
                            <span>Aprobar</span>
                          </button>

                          {/* Botón Rechazar */}
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalData({ pago, pedido });
                              setRejectMotivo(
                                isCancelledOrder
                                  ? 'Pedido previamente cancelado por vencimiento de 24 horas. Se rechaza pago y se gestiona reembolso.'
                                  : 'Monto recibido no coincide con el total acordado.'
                              );
                              setRejectErrorMsg('');
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FFF0F6] hover:bg-[#DE6978] text-[#DE6978] hover:text-white border border-[#DE6978]/30 transition flex items-center gap-1 cursor-pointer"
                            title="Rechazar pago y solicitar reembolso"
                          >
                            <XCircle size={13} />
                            <span>Rechazar</span>
                          </button>

                          {/* Reintentar Reembolso si falló previamente (Regla 11 & RNF) */}
                          {pago.resultadoReembolso === 'Fallido' && (
                            <button
                              type="button"
                              onClick={() => retryRefund(pago.id, true)}
                              className="px-2 py-1.5 rounded-xl text-xs font-bold bg-[#E9B44C] hover:bg-[#E9B44C]/90 text-white transition flex items-center gap-1 cursor-pointer"
                              title="Reintentar solicitud de reembolso ante el Servicio de Pago"
                            >
                              <RotateCcw size={12} />
                              <span>Reintentar</span>
                            </button>
                          )}

                          {/* Ver Historial de la orden */}
                          <button
                            type="button"
                            onClick={() => setHistoryModalOrderId(pedido.id)}
                            className="p-1.5 rounded-xl bg-gray-100 hover:bg-[#F3EEFF] text-[#746E8B] hover:text-[#C9B6F2] transition cursor-pointer"
                            title="Consultar historial del pedido"
                          >
                            <History size={13} />
                          </button>
                        </div>


                        {/* Mensaje D: Alerta si el pedido está cancelado */}
                        {isCancelledOrder && (
                          <div className="text-[10px] text-[#DE6978] font-semibold mt-1">
                            ⚠️ Este pedido fue cancelado. No es posible aprobar el pago.
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de Pagos ya Revisados (Auditoría de Conciliaciones) */}
      {reviewedPaymentsWithOrder.length > 0 && (
        <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h4 className="text-xs font-bold text-[#343047] flex items-center gap-1.5">
              <History size={14} className="text-[#C9B6F2]" />
              <span>Historial de Pagos Conciliados y Reembolsados</span>
            </h4>
            <span className="text-[10px] text-[#746E8B]">
              {reviewedPaymentsWithOrder.length} registros auditados
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {reviewedPaymentsWithOrder.map(({ pago, pedido }) => (
              <div key={pago.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#343047]">{pedido.id}</span>
                  <span className="text-[11px] text-[#746E8B] ml-2">
                    Ref: {pago.referenciaExterna} • Monto: S/ {pago.montoRecibido.toFixed(2)}
                  </span>
                  {pago.motivoRechazo && (
                    <p className="text-[11px] text-[#DE6978] italic mt-0.5">
                      Motivo: "{pago.motivoRechazo}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pago.estadoPago === 'APROBADO'
                        ? 'bg-[#2D9D78]/15 text-[#2D9D78]'
                        : 'bg-[#DE6978]/15 text-[#DE6978]'
                    }`}
                  >
                    {pago.estadoPago}
                  </span>
                  {pago.resultadoReembolso && (
                    <span className="text-[10px] font-mono text-[#746E8B]">
                      Reembolso: {pago.resultadoReembolso}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B. MODAL DE CONFIRMACIÓN DE APROBACIÓN */}
      {confirmApprovePago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-kawaii border border-[#2D9D78]/40 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2D9D78]/15 text-[#2D9D78] flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#343047]">
                  ¿Estás seguro de que deseas aprobar este pago?
                </h4>
                <p className="text-xs text-[#746E8B] mt-0.5">
                  Pedido <strong>{confirmApprovePago.pedido.id}</strong> • Ref: <strong>{confirmApprovePago.pago.referenciaExterna}</strong>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#746E8B]">Total del Pedido:</span>
                <span className="font-bold text-[#343047]">S/ {confirmApprovePago.pago.totalPedido.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#746E8B]">Monto Recibido:</span>
                <span className="font-bold text-[#2D9D78]">S/ {confirmApprovePago.pago.montoRecibido.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1">
                <span className="text-[#746E8B]">Diferencia Aceptada:</span>
                <span className="font-bold text-[#F4A7C1]">S/ {confirmApprovePago.pago.diferencia.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#746E8B] leading-relaxed">
              Al confirmar, el pedido pasará al estado <strong>"Pagado"</strong>, la reserva temporal se confirmará definitivamente y el pedido quedará <strong>"Listo para preparación"</strong> (sin descontar stock dos veces).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmApprovePago(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#746E8B] hover:bg-gray-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2D9D78] hover:bg-[#2D9D78]/90 text-white shadow-xs transition cursor-pointer"
              >
                Sí, aprobar pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RECHAZO Y REEMBOLSO */}
      {rejectModalData && (
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
                  Pedido <strong>{rejectModalData.pedido.id}</strong> • Monto a reembolsar: <strong>S/ {rejectModalData.pago.montoRecibido.toFixed(2)}</strong>
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
                onClick={() => setRejectModalData(null)}
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
      )}
    </div>
  );
};
