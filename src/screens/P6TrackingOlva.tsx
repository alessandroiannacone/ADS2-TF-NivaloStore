import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { OlvaCourierLogo } from '../components/OlvaCourierLogo';
import {
  Search,
  Truck,
  CheckCircle2,
  MapPin,
  User,
  Copy,
  ExternalLink,
  Share2,
  AlertCircle,
  ArrowLeft,
  XCircle,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import type { Pedido, TrackingEnvio, EstadoEnvio } from '../types';

interface P6TrackingOlvaProps {
  initialOrderId?: string;
  onBackToStore?: () => void;
  isPublicPortal?: boolean;
}

export const P6TrackingOlva: React.FC<P6TrackingOlvaProps> = ({
  initialOrderId,
  onBackToStore,
  isPublicPortal = false,
}) => {
  const { pedidos, updateOrderTracking } = useStore();
  const { isAdmin } = useAuth();

  // Estados de búsqueda
  const [searchCode, setSearchCode] = useState(initialOrderId || 'PED-000124');
  const [searchDni, setSearchDni] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrderId || 'PED-000124'
  );
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showAdminControls, setShowAdminControls] = useState(false);

  // Estados para edición rápida desde Admin
  const [adminStatus, setAdminStatus] = useState<EstadoEnvio>('EN_CAMINO');
  const [adminTrackingCode, setAdminTrackingCode] = useState('');
  const [adminDestino, setAdminDestino] = useState('');
  const [newCheckpointText, setNewCheckpointText] = useState('');
  const [newCheckpointLocation, setNewCheckpointLocation] = useState('Centro logístico Lima');

  // Buscar el pedido seleccionado
  const currentPedido = useMemo<Pedido | undefined>(() => {
    return pedidos.find((p) => p.id.toUpperCase() === selectedOrderId.toUpperCase());
  }, [pedidos, selectedOrderId]);

  // Manejar consulta de búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = searchCode.trim().toUpperCase();
    if (!cleanCode) return;

    // Buscar por ID exacto o por número
    const found = pedidos.find(
      (p) =>
        p.id.toUpperCase() === cleanCode ||
        p.id.toUpperCase() === `PED-${cleanCode.padStart(6, '0')}` ||
        (searchDni && p.cliente.telefono.includes(searchDni)) ||
        (searchDni && p.envio?.dniCliente?.includes(searchDni))
    );

    if (found) {
      setSelectedOrderId(found.id);
    } else {
      setSelectedOrderId(cleanCode);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Datos calculados de tracking enriquecidos con Olva Courier
  const trackingData: TrackingEnvio = useMemo(() => {
    if (currentPedido?.envio) {
      return currentPedido.envio;
    }

    // Si no tiene envío específico aún, sintetizar datos amigables basados en el estado del pedido
    const isCancelled = currentPedido?.estado === 'CANCELADO';
    const isPaid = currentPedido?.estado === 'PAGADO';

    return {
      empresa: 'Olva Courier',
      numeroSeguimiento: isPaid ? 'TRK-OLVA-992817' : undefined,
      ordenEntrega: isPaid ? `ORD-OLVA-${currentPedido?.id.replace('PED-', '') || '2026-089'}` : undefined,
      estadoEnvio: isCancelled
        ? 'PENDIENTE_ENVIO'
        : isPaid
        ? 'EN_CAMINO'
        : 'PENDIENTE_ENVIO',
      fechaDespacho: isPaid ? '17 ene 2026, 11:10' : undefined,
      fechaEntregaEstimada: isPaid ? '18-19 de enero' : 'Pendiente de confirmación',
      destino: 'Av. Larco 450, Miraflores — Lima',
      destinatario: currentPedido?.cliente.nombreOIdentificador || 'Cliente Nivalo',
      dniCliente: '74829103',
      ubicacionActual: isPaid ? 'Centro logístico Lima' : 'Almacén Nivalo Store',
      historialEnvio: isPaid
        ? [
            {
              fechaHora: '17 Ene · 14:38',
              titulo: 'Entregado a Olva Courier',
              descripcion: 'El paquete se encuentra en tránsito en la red logística nacional de Olva Courier.',
              ubicacion: 'Centro logístico Lima',
              estado: 'actual',
            },
            {
              fechaHora: '17 Ene · 11:10',
              titulo: 'Paquete listo para envío',
              descripcion: 'Embalado y rotulado con guía oficial Olva en almacén principal Nivalo.',
              ubicacion: 'Almacén Nivalo',
              estado: 'completado',
            },
            {
              fechaHora: '17 Ene · 09:30',
              titulo: 'En preparación de empaque',
              descripcion: 'Inspección de calidad y adición de regalito sorpresa kawaii.',
              ubicacion: 'Almacén Nivalo',
              estado: 'completado',
            },
            {
              fechaHora: '16 Ene · 20:15',
              titulo: 'Pago verificado con Yape',
              descripcion: 'Aprobación de abono verificado por Alessandro Iannacone.',
              ubicacion: 'Nivalo Store',
              estado: 'completado',
            },
          ]
        : [
            {
              fechaHora: '16 Ene · 19:40',
              titulo: 'Pedido registrado',
              descripcion: 'Orden creada en espera de abono por Yape/Plin.',
              ubicacion: 'WhatsApp Nivalo',
              estado: 'actual',
            },
          ],
    };
  }, [currentPedido]);

  // Determinación de pasos del Stepper (8 pasos idénticos a la referencia)
  const steps = [
    { id: 1, label: 'Registrado' },
    { id: 2, label: 'Pago pendiente' },
    { id: 3, label: 'Pagado' },
    { id: 4, label: 'En preparación' },
    { id: 5, label: 'Listo para envío' },
    { id: 6, label: 'Despachado' },
    { id: 7, label: 'Entregado a Olva' },
    { id: 8, label: 'Cancelado' },
  ];

  // Calcular el índice del paso actual según la lógica de negocio de Nivalo
  const currentStepIndex = useMemo(() => {
    if (!currentPedido) return 1;

    if (currentPedido.estado === 'CANCELADO') {
      return 8; // Cancelado
    }

    if (currentPedido.estado === 'PENDIENTE_PAGO') {
      return 2; // Pago pendiente
    }

    // Pedido pagado: revisar estado de envío
    const envState = trackingData.estadoEnvio;
    if (envState === 'EN_PREPARACION') return 4;
    if (envState === 'DESPACHADO') return 6;
    if (envState === 'EN_CAMINO') return 7; // Entregado a Olva / En ruta
    if (envState === 'ENTREGADO') return 7; // Ya entregado

    return 3; // Pagado (en cola)
  }, [currentPedido, trackingData.estadoEnvio]);

  // Actualizar tracking desde admin
  const handleAdminUpdate = async () => {
    if (!currentPedido) return;

    const updatedTracking: TrackingEnvio = {
      ...trackingData,
      estadoEnvio: adminStatus,
      numeroSeguimiento: adminTrackingCode || trackingData.numeroSeguimiento,
      destino: adminDestino || trackingData.destino,
      historialEnvio: [
        ...(trackingData.historialEnvio || []),
        ...(newCheckpointText
          ? [
              {
                fechaHora: new Date().toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                titulo: newCheckpointText,
                descripcion: 'Actualización de tracking registrada desde el panel de control.',
                ubicacion: newCheckpointLocation,
                estado: 'actual' as const,
              },
            ]
          : []),
      ],
    };

    await updateOrderTracking(currentPedido.id, updatedTracking);
    setNewCheckpointText('');
    setShowAdminControls(false);
  };

  const shareViaWhatsApp = () => {
    if (!currentPedido) return;
    const msg = `🌸 *Nivalo Store - Trazabilidad de tu Pedido* ✨\n\nHola *${
      currentPedido.cliente.nombreOIdentificador
    }*, tu pedido *${currentPedido.id}* ya cuenta con seguimiento oficial por *Olva Courier* 🚚\n\n📋 *Guía Olva:* ${
      trackingData.numeroSeguimiento || 'En asignación'
    }\n📦 *Orden de Entrega:* ${
      trackingData.ordenEntrega || 'ORD-OLVA-2026-089'
    }\n📍 *Destino:* ${trackingData.destino || 'Dirección registrada'}\n📅 *Entrega Estimada:* ${
      trackingData.fechaEntregaEstimada || '18-19 de enero'
    }\n\n🔍 Puedes revisar el estado en vivo aquí:\nhttps://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/tracking?id=${
      currentPedido.id
    }`;
    window.open(`https://wa.me/51${currentPedido.cliente.telefono}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-['Poppins',sans-serif]">
      {/* Botón de retroceso si es portal público */}
      {onBackToStore && (
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8E7C94] hover:text-[#E2678D] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Volver a la tienda</span>
        </button>
      )}

      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FCDCE7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center shadow-xs">
              <Truck size={18} />
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#343047] tracking-tight">
              Consulta y tracking de pedido
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#746E8B] mt-1">
            Sigue el estado de tu compra y revisa la trazabilidad de envío en tiempo real con <strong>Olva Courier</strong>.
          </p>
        </div>

        {/* Acciones de cabecera */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://www.olvacourier.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-2xl bg-white border border-[#E30613]/30 hover:border-[#E30613] text-[#002F6C] hover:text-[#E30613] text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            title="Ir al portal web de Olva Courier"
          >
            <ExternalLink size={13} />
            <span>Web Olva Oficial</span>
          </a>

          {isAdmin && (
            <button
              onClick={() => {
                setShowAdminControls(!showAdminControls);
                if (currentPedido) {
                  setAdminStatus(trackingData.estadoEnvio);
                  setAdminTrackingCode(trackingData.numeroSeguimiento || '');
                  setAdminDestino(trackingData.destino || '');
                }
              }}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#C9B6F2] hover:opacity-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 size={13} />
              <span>{showAdminControls ? 'Cerrar Edición' : 'Editar Envío (Admin)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TARJETA 1: ENCUENTRA TU PEDIDO (Formulario de búsqueda) */}
      <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-[#FCDCE7] shadow-kawaii-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#343047]">Encuentra tu pedido</h2>
          <p className="text-xs text-[#746E8B]">
            Ingresa los datos con los que realizaste tu compra para consultar la guía.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-end gap-3.5">
          <div className="flex-1 w-full space-y-1">
            <label className="text-[11px] font-semibold text-[#665E75]">
              Código de pedido
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Ej. PED-000124"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs font-mono font-bold text-[#343047] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#F4A7C1] focus:ring-2 focus:ring-[#F4A7C1]/30 transition"
              />
              <span className="absolute left-3 top-2.5 text-[#BAA0AC]">#</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-1">
            <label className="text-[11px] font-semibold text-[#665E75]">
              DNI o Celular del cliente
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchDni}
                onChange={(e) => setSearchDni(e.target.value)}
                placeholder="Ej. 74829103 o 998167789"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#343047] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#F4A7C1] focus:ring-2 focus:ring-[#F4A7C1]/30 transition"
              />
              <User size={14} className="absolute left-3 top-3 text-[#BAA0AC]" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#E2678D] to-[#F4A7C1] hover:from-[#D4547B] hover:to-[#EE8EAF] text-white text-xs font-bold shadow-kawaii-sm flex items-center justify-center gap-2 transition-all cursor-pointer h-[42px]"
          >
            <Search size={15} />
            <span>Consultar estado</span>
          </button>
        </form>

        {/* Chips de acceso rápido */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#FFF0F6]">
          <span className="text-[11px] font-medium text-[#746E8B]">Pruebas rápidas:</span>
          {pedidos.slice(0, 4).map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSearchCode(p.id);
                setSelectedOrderId(p.id);
              }}
              className={`text-[10px] px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                selectedOrderId === p.id
                  ? 'bg-[#E2678D] text-white border-[#E2678D] font-bold shadow-xs'
                  : 'bg-[#FFF8FA] hover:bg-[#FFF0F6] text-[#746E8B] border-[#FCDCE7]'
              }`}
            >
              {p.id} {p.id === 'PED-000124' ? '🌟 (Olva En Ruta)' : `(${p.estado})`}
            </button>
          ))}
        </div>
      </div>

      {/* PANEL ADMIN: EDICIÓN RÁPIDA (Si está activo) */}
      {showAdminControls && isAdmin && currentPedido && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFF5F8] to-[#F5EFFF] border-2 border-dashed border-[#F4A7C1] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E2678D] flex items-center gap-1.5">
              <ShieldCheck size={16} /> Panel de Actualización de Tracking (Admin)
            </span>
            <span className="text-[10px] text-[#746E8B]">
              Editando: <strong>{currentPedido.id}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-[#665E75]">Estado de Envío</label>
              <select
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value as EstadoEnvio)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-[#FCDCE7] text-xs font-semibold text-[#343047]"
              >
                <option value="PENDIENTE_ENVIO">Pendiente de Envío</option>
                <option value="EN_PREPARACION">En Preparación (Almacén)</option>
                <option value="DESPACHADO">Despachado</option>
                <option value="EN_CAMINO">Entregado a Olva / En Camino</option>
                <option value="ENTREGADO">Entregado al Cliente</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#665E75]">Guía Olva Courier</label>
              <input
                type="text"
                value={adminTrackingCode}
                onChange={(e) => setAdminTrackingCode(e.target.value)}
                placeholder="Ej. TRK-OLVA-992817"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-[#FCDCE7] text-xs font-mono font-bold text-[#343047]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#665E75]">Dirección de Destino</label>
              <input
                type="text"
                value={adminDestino}
                onChange={(e) => setAdminDestino(e.target.value)}
                placeholder="Ej. Av. Larco 450, Miraflores"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-[#FCDCE7] text-xs text-[#343047]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[10px] font-semibold text-[#665E75]">Agregar Nuevo Punto de Historial</label>
              <input
                type="text"
                value={newCheckpointText}
                onChange={(e) => setNewCheckpointText(e.target.value)}
                placeholder="Ej. Paquete arribó a Centro de Distribución Olva Miraflores"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-[#FCDCE7] text-xs text-[#343047]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#665E75]">Ubicación del Punto</label>
              <input
                type="text"
                value={newCheckpointLocation}
                onChange={(e) => setNewCheckpointLocation(e.target.value)}
                placeholder="Ej. Centro logístico Lima / Agencia Miraflores"
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-[#FCDCE7] text-xs text-[#343047]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAdminControls(false)}
              className="px-4 py-1.5 rounded-xl bg-white text-xs text-[#746E8B] hover:text-[#343047] border border-gray-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdminUpdate}
              className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Guardar Cambios en BD
            </button>
          </div>
        </div>
      )}

      {/* Si no se encontró el pedido */}
      {!currentPedido && (
        <div className="p-8 rounded-3xl bg-white border border-rose-200 text-center space-y-3 shadow-kawaii-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-[#343047]">
            No encontramos el pedido "{selectedOrderId}"
          </h3>
          <p className="text-xs text-[#746E8B] max-w-md mx-auto">
            Verifica que el código coincida con el emitido al comprar (ejemplo: <strong>PED-000124</strong>) o prueba con los botones de prueba rápida arriba.
          </p>
        </div>
      )}

      {/* CUANDO HAY PEDIDO: RENDERIZAR RESULTADOS COMPLETOS */}
      {currentPedido && (
        <>
          {/* TARJETA 2: TIMELINE Y PIPELINE HORIZONTAL (Exacto a la foto de referencia) */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-[#FCDCE7] shadow-kawaii-sm space-y-6">
            {/* Header del pedido consultado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                      currentPedido.estado === 'CANCELADO'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : trackingData.estadoEnvio === 'EN_CAMINO'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : trackingData.estadoEnvio === 'ENTREGADO'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span>
                      {currentPedido.estado === 'CANCELADO'
                        ? 'PEDIDO CANCELADO'
                        : trackingData.estadoEnvio === 'EN_CAMINO'
                        ? 'PEDIDO EN RUTA'
                        : trackingData.estadoEnvio === 'ENTREGADO'
                        ? 'PEDIDO ENTREGADO'
                        : 'PEDIDO EN PREPARACIÓN'}
                    </span>
                  </span>
                </div>

                <div className="flex items-baseline gap-3 pt-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#343047] font-mono tracking-tight">
                    {currentPedido.id}
                  </h2>
                  <span className="text-[11px] text-[#8E7C94]">
                    Última actualización: {new Date(currentPedido.fechaCreacion).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Caja de Entrega Estimada (Extremo derecho, como en el mockup) */}
              <div className="p-3.5 px-5 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#E6F9EE] border border-emerald-200/80 shadow-xs flex items-center gap-3.5 self-start sm:self-auto">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Truck size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wide block">
                    Entrega estimada
                  </span>
                  <span className="text-sm font-extrabold text-emerald-950 font-mono">
                    {trackingData.fechaEntregaEstimada || '18-19 de enero'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Horizontal Interactivo (8 Pasos) */}
            <div className="pt-4 overflow-x-auto pb-4">
              <div className="min-w-[760px] relative flex items-center justify-between px-6">
                {/* Línea de fondo general */}
                <div className="absolute left-8 right-8 top-5 h-1 bg-gray-200 -z-0" />

                {/* Línea de progreso verde activa */}
                <div
                  className="absolute left-8 top-5 h-1 bg-[#10B981] transition-all duration-700 -z-0"
                  style={{
                    width:
                      currentStepIndex === 8
                        ? '100%'
                        : `${((Math.min(currentStepIndex, 7) - 1) / 6) * 100}%`,
                  }}
                />

                {/* Los 8 Pasos */}
                {steps.map((step) => {
                  const isCompleted = step.id < currentStepIndex && currentStepIndex !== 8;
                  const isCurrent = step.id === currentStepIndex;
                  const isCancelStep = step.id === 8;
                  const isCancelledOrder = currentPedido.estado === 'CANCELADO';

                  // Si el pedido no está cancelado, el paso 8 permanece en gris o como paso inactivo
                  const showCancelAsActive = isCancelStep && isCancelledOrder;

                  return (
                    <div
                      key={step.id}
                      className="flex flex-col items-center relative z-10 group"
                      style={{ width: `${100 / steps.length}%` }}
                    >
                      {/* Círculo indicador */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-xs ${
                          showCancelAsActive
                            ? 'bg-rose-500 text-white ring-4 ring-rose-100 scale-110'
                            : isCurrent && step.id === 7
                            ? 'bg-[#002F6C] text-white ring-4 ring-blue-100 scale-110 shadow-md'
                            : isCurrent
                            ? 'bg-[#E2678D] text-white ring-4 ring-pink-100 scale-110'
                            : isCompleted
                            ? 'bg-[#10B981] text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}
                      >
                        {showCancelAsActive ? (
                          <XCircle size={18} />
                        ) : isCurrent && step.id === 7 ? (
                          <Truck size={18} className="animate-bounce" />
                        ) : isCompleted ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <span className="text-[11px]">{step.id}</span>
                        )}
                      </div>

                      {/* Texto debajo del paso */}
                      <span
                        className={`text-[11px] mt-2.5 text-center transition-colors ${
                          showCancelAsActive
                            ? 'font-bold text-rose-600'
                            : isCurrent
                            ? 'font-extrabold text-[#343047]'
                            : isCompleted
                            ? 'font-semibold text-emerald-700'
                            : 'text-[#8E7C94]'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TARJETA 3: CONTENEDOR OFICIAL DE OLVA COURIER (Exacto a la foto de referencia) */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-[#FCDCE7] shadow-kawaii-sm space-y-6">
            {/* Cabecera de Olva Courier */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#FFF0F6]">
              <div className="flex items-center gap-4">
                <OlvaCourierLogo size="lg" />
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#002F6C]/10 text-[#002F6C] text-xs font-bold border border-[#002F6C]/20">
                  <span className="w-2 h-2 rounded-full bg-[#002F6C] animate-ping" />
                  <span>● EN TRÁNSITO</span>
                </span>

                <button
                  onClick={shareViaWhatsApp}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Compartir por WhatsApp"
                >
                  <Share2 size={13} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Cuadrícula de 4 Datos Clave (Destinatario, Destino, Orden, Guía Olva) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Destinatario */}
              <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] space-y-1">
                <span className="text-[10px] font-semibold text-[#8E7C94] uppercase tracking-wider block">
                  Destinatario
                </span>
                <span className="text-sm font-bold text-[#343047] block truncate" title={trackingData.destinatario || currentPedido.cliente.nombreOIdentificador}>
                  {trackingData.destinatario || currentPedido.cliente.nombreOIdentificador}
                </span>
                <span className="text-[10px] text-[#8E7C94]">
                  DNI: {trackingData.dniCliente || '74829103'}
                </span>
              </div>

              {/* 2. Destino */}
              <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] space-y-1">
                <span className="text-[10px] font-semibold text-[#8E7C94] uppercase tracking-wider block">
                  Destino de Entrega
                </span>
                <div className="flex items-start gap-1.5">
                  <MapPin size={14} className="text-[#E2678D] shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-[#343047] line-clamp-2">
                    {trackingData.destino || 'Av. Larco 450, Miraflores — Lima'}
                  </span>
                </div>
              </div>

              {/* 3. Orden de Entrega */}
              <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#8E7C94] uppercase tracking-wider">
                    Orden de entrega
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        trackingData.ordenEntrega || 'ORD-OLVA-2026-089',
                        'Orden copiada'
                      )
                    }
                    className="text-[#8E7C94] hover:text-[#E2678D] cursor-pointer"
                    title="Copiar orden"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <span className="text-xs font-mono font-bold text-[#002F6C] block">
                  {trackingData.ordenEntrega || 'ORD-OLVA-2026-089'}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Validado por Nivalo
                </span>
              </div>

              {/* 4. Guía de Envío Olva */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF0F6] to-[#F3EEFF] border border-[#F4A7C1] space-y-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#E2678D] uppercase tracking-wider">
                    Guía de envío Olva
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        trackingData.numeroSeguimiento || 'TRK-OLVA-992817',
                        'Guía copiada'
                      )
                    }
                    className="text-[#E2678D] hover:text-[#D4547B] cursor-pointer"
                    title="Copiar guía"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <span className="text-sm font-mono font-extrabold text-[#E30613] block">
                  {trackingData.numeroSeguimiento || 'TRK-OLVA-992817'}
                </span>
                {copyFeedback && (
                  <span className="text-[10px] text-emerald-600 font-bold block animate-fade-in">
                    ✓ {copyFeedback}
                  </span>
                )}
              </div>
            </div>

            {/* SECCIÓN: HISTORIAL DE MOVIMIENTO (Timeline idéntico al mockup) */}
            <div className="space-y-4 pt-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#343047] flex items-center gap-2">
                  <span>Historial de movimiento</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF0F6] text-[#E2678D] font-semibold">
                    {trackingData.historialEnvio?.length || 4} eventos
                  </span>
                </h3>
                <span className="text-[10px] text-[#8E7C94]">
                  Horario de Lima (GMT-5)
                </span>
              </div>

              {/* Lista vertical de hitos */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#002F6C] before:via-[#10B981] before:to-gray-200">
                {trackingData.historialEnvio?.map((item, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <div key={idx} className="relative flex items-start justify-between gap-4 group">
                      {/* Dot en la línea */}
                      <div
                        className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white transition-transform ${
                          isFirst
                            ? 'bg-[#002F6C] ring-4 ring-blue-100 scale-125'
                            : 'bg-[#10B981]'
                        }`}
                      />

                      {/* Info del evento */}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#8E7C94]">
                            {item.fechaHora}
                          </span>
                          <span className="text-xs font-bold text-[#343047]">
                            {item.titulo}
                          </span>
                          {isFirst && (
                            <span className="text-[9px] px-2 py-0.2 rounded-full bg-blue-100 text-[#002F6C] font-extrabold uppercase">
                              Último movimiento
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#746E8B]">
                          {item.descripcion}
                        </p>
                      </div>

                      {/* Ubicación a la derecha (como en la referencia) */}
                      {item.ubicacion && (
                        <div className="shrink-0 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8E7C94] bg-[#FFF8FA] px-2.5 py-1 rounded-xl border border-[#FCDCE7]">
                            <MapPin size={11} className="text-[#E2678D]" />
                            <span>{item.ubicacion}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumen del paquete (Productos incluidos) */}
            <div className="pt-4 border-t border-[#FFF0F6]">
              <span className="text-xs font-bold text-[#343047] block mb-2">
                Artículos en este paquete ({currentPedido.detalles.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {currentPedido.detalles.map((det) => (
                  <div
                    key={det.id}
                    className="p-2.5 rounded-xl bg-[#FFF8FA] border border-[#FCDCE7] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#343047] truncate pr-2">
                      {det.productoNombre}
                    </span>
                    <span className="text-[11px] font-bold text-[#E2678D] shrink-0">
                      x{det.cantidad} (S/ {det.subtotal.toFixed(2)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
