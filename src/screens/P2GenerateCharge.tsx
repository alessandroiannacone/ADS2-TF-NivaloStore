import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  CreditCard,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { NIVALO_STORE_CONTACT, getAssetUrl } from '../data/mockData';

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);


export const P2GenerateCharge: React.FC = () => {
  const {
    pedidos,
    productos,
    selectedOrderId,
    setSelectedOrderId,
    generatePaymentLink,
  } = useStore();

  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedWhatsAppMsg, setCopiedWhatsAppMsg] = useState<boolean>(false);
  const [copiedInstagramMsg, setCopiedInstagramMsg] = useState<boolean>(false);
  const [lastGeneratedLink, setLastGeneratedLink] = useState<string | null>(null);

  // Inicializar o sincronizar con pedido seleccionado
  useEffect(() => {
    if (selectedOrderId && pedidos.some((p) => p.id === selectedOrderId)) {
      setCurrentOrderId(selectedOrderId);
    } else {
      const firstPending = pedidos.find((p) => p.estado === 'PENDIENTE_PAGO');
      if (firstPending) {
        setCurrentOrderId(firstPending.id);
      } else if (pedidos.length > 0) {
        setCurrentOrderId(pedidos[0].id);
      }
    }
  }, [selectedOrderId, pedidos]);

  const currentPedido = pedidos.find((p) => p.id === currentOrderId);

  // Calcular tiempo restante de la reserva de 24h
  const getRemainingTime = (isoVencimiento?: string) => {
    if (!isoVencimiento) return 'Sin fecha';
    const diffMs = new Date(isoVencimiento).getTime() - new Date().getTime();
    if (diffMs <= 0) return 'Vencido (Plazo de 24h culminado)';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m restantes`;
  };

  const isExpired = currentPedido
    ? new Date() > new Date(currentPedido.fechaVencimientoReserva)
    : false;

  const isValidForCharge =
    currentPedido &&
    currentPedido.estado === 'PENDIENTE_PAGO' &&
    !isExpired;

  // Razón de invalidación para cobro
  const getInvalidReason = () => {
    if (!currentPedido) return 'Selecciona un pedido';
    if (currentPedido.estado === 'PAGADO') {
      return 'Este pedido ya cuenta con un pago aprobado y verificado. No requiere enlace de cobro.';
    }
    if (currentPedido.estado === 'CANCELADO') {
      return 'Este pedido fue cancelado. La reserva de inventario fue liberada y no puede cobrarse.';
    }
    if (isExpired) {
      return 'La reserva temporal de 24 horas ha expirado. El pedido debe ser cancelado para liberar el stock.';
    }
    return '';
  };

  // Generar enlace
  const handleGenerateLink = () => {
    if (!currentPedido || !isValidForCharge) return;

    setIsProcessing(true);
    setLastGeneratedLink(null);

    // Procesamiento de enlace
    setTimeout(() => {
      const res = generatePaymentLink(currentPedido.id, false);
      setIsProcessing(false);
      if (res.success && res.enlace) {
        setLastGeneratedLink(res.enlace);
      }
    }, 500);
  };

  const [copiedYapeInfo, setCopiedYapeInfo] = useState<boolean>(false);

  const rawLinkId = currentPedido?.id ? currentPedido.id.replace('PED-', '') : '';
  const finalLink = currentPedido?.enlacePagoActivo?.includes('alessandroiannacone.github.io')
    ? currentPedido.enlacePagoActivo
    : `https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/${rawLinkId}`;

  // Mensaje para WhatsApp con datos de Yape y enlace
  const whatsappText = currentPedido
    ? `🌸 ¡Hola ${currentPedido.cliente.nombreOIdentificador}! Gracias por comprar en *Nivalo Store*.\n\nAquí tienes las opciones de pago para tu pedido *${currentPedido.id}* por un total de *S/ ${currentPedido.total.toFixed(2)}*:\n\n💜 *1. YAPE / PLIN (Directo):*\n📱 Número: *${NIVALO_STORE_CONTACT.telefonoDisplay}*\n👤 Titular: *Nivalo Store (Alessandro Iannacone)*\n\n💳 *2. O PAGA EN LÍNEA CON PASARELA CULQI (TARJETAS VISA / MASTERCARD / YAPE QR):*\n👉 ${finalLink}\n\n⚠️ Recuerda que tu stock está reservado durante *24 horas*. Por favor envíanos la captura de tu comprobante por aquí. ¡Muchas gracias! 💕`
    : '';

  // Mensaje para Instagram
  const instagramText = currentPedido
    ? `Hola ${currentPedido.cliente.nombreOIdentificador} 💖 Tu pedido ${currentPedido.id} en Nivalo Store está listo para pago por S/ ${currentPedido.total.toFixed(2)}.\n\n💜 Yapea al número: ${NIVALO_STORE_CONTACT.telefonoDisplay} (Nivalo Store)\n💳 O paga en línea con pasarela Culqi (Tarjetas / Yape): ${finalLink}\n\n(Tu stock está reservado por 24 horas ✨)`
    : '';

  const copyToClipboard = (text: string, type: 'link' | 'wa' | 'ig' | 'yape') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (type === 'wa') {
      setCopiedWhatsAppMsg(true);
      setTimeout(() => setCopiedWhatsAppMsg(false), 2000);
    } else if (type === 'ig') {
      setCopiedInstagramMsg(true);
      setTimeout(() => setCopiedInstagramMsg(false), 2000);
    } else if (type === 'yape') {
      setCopiedYapeInfo(true);
      setTimeout(() => setCopiedYapeInfo(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4A7C1]/30">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#343047] font-['Quicksand',sans-serif] m-0">
              Generar Cobro
            </h2>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FFF0F6] text-[#F4A7C1] border border-[#F4A7C1]/40">
              Enlace Seguro
            </span>
          </div>
          <p className="text-xs text-[#746E8B] m-0 mt-0.5">
            Generación y envío de enlaces de pago para pedidos pendientes con reserva activa de 24 horas.
          </p>
        </div>
      </div>

      {/* Selector de Pedido */}
      <div className="bg-white p-4 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#343047]">
            Seleccionar pedido para cobro:
          </label>
        </div>
        <select
          value={currentOrderId}
          onChange={(e) => {
            setCurrentOrderId(e.target.value);
            setSelectedOrderId(e.target.value);
            setLastGeneratedLink(null);
          }}
          className="text-xs font-semibold p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[#343047] focus:outline-none focus:border-[#C9B6F2]"
        >
          {pedidos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} – {p.cliente.nombreOIdentificador} (S/ {p.total.toFixed(2)}) [{p.estado}]
            </option>
          ))}
        </select>
      </div>

      {currentPedido && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Tarjeta del Pedido y Acciones de Cobro */}
          <div className="lg:col-span-7 space-y-6">
            {/* A. Tarjeta del Pedido Seleccionado */}
            <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#FFF0F6] text-[#F4A7C1] flex items-center justify-center text-xs font-bold">
                    A
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#343047]">{currentPedido.id}</h3>
                    <span className="text-[11px] text-[#746E8B]">
                      Registrado el {new Date(currentPedido.fechaCreacion).toLocaleString('es-PE')}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    currentPedido.estado === 'PAGADO'
                      ? 'bg-[#2D9D78]/10 text-[#2D9D78] border-[#2D9D78]/30'
                      : currentPedido.estado === 'CANCELADO'
                      ? 'bg-[#DE6978]/10 text-[#DE6978] border-[#DE6978]/30'
                      : 'bg-[#E9B44C]/15 text-[#E9B44C] border-[#E9B44C]/30'
                  }`}
                >
                  {currentPedido.estado === 'CANCELADO' && currentPedido.motivoCancelacion
                    ? currentPedido.motivoCancelacion
                    : currentPedido.estado}
                </span>
              </div>

              {/* Información detallada */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-[#746E8B] block">Cliente</span>
                  <strong className="text-[#343047]">{currentPedido.cliente.nombreOIdentificador}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-[#746E8B] block">Canal / Teléfono</span>
                  <strong className="text-[#343047]">
                    {currentPedido.cliente.canal} ({currentPedido.cliente.telefono})
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-[#746E8B] block">Total a Cobrar</span>
                  <strong className="text-sm text-[#F4A7C1] font-bold">
                    S/ {currentPedido.total.toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Tiempo restante de reserva */}
              <div className="p-3 rounded-2xl bg-[#F8F8FC] border border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock size={16} className={isExpired ? 'text-[#DE6978]' : 'text-[#E9B44C]'} />
                  <div>
                    <span className="text-[#746E8B] block text-[11px]">Reserva de stock (24 horas)</span>
                    <strong className={isExpired ? 'text-[#DE6978]' : 'text-[#343047]'}>
                      {getRemainingTime(currentPedido.fechaVencimientoReserva)}
                    </strong>
                  </div>
                </div>
                <span className="text-[10px] text-[#746E8B]">
                  Vence: {new Date(currentPedido.fechaVencimientoReserva).toLocaleTimeString('es-PE')}
                </span>
              </div>

              {/* Detalle de productos solicitados */}
              <div>
                <h4 className="text-xs font-semibold text-[#746E8B] mb-2">
                  Artículos incluidos en el cobro:
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl p-2 max-h-44 overflow-y-auto">
                  {currentPedido.detalles.map((d) => {
                    const prodMatch = productos.find((p) => p.id === d.productoId);
                    const imgUrl = getAssetUrl(d.productoImagen || prodMatch?.imagen || 'prod_memopads.jpg');
                    return (
                      <div key={d.id} className="py-2 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={imgUrl}
                            alt={d.productoNombre}
                            className="w-9 h-9 rounded-xl object-cover border border-[#FCDCE7] shrink-0 bg-pink-50"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = getAssetUrl('prod_memopads.jpg');
                            }}
                          />
                          <span className="text-[#343047] font-medium truncate">
                            {d.cantidad}x {d.productoNombre}
                          </span>
                        </div>
                        <span className="text-[#746E8B] font-mono shrink-0">
                          S/ {d.subtotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* B y E: Generar Enlace y Simulación de Fallo */}
            <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#343047] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#F3EEFF] text-[#C9B6F2] flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <span>Generar Enlace de Pago</span>
                </h3>
              </div>

              {/* F. Validación: si el pedido no es válido para cobro */}
              {!isValidForCharge ? (
                <div className="p-3.5 rounded-2xl bg-[#FFF0F6] border border-[#DE6978]/40 text-xs text-[#DE6978] flex items-start gap-2.5">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Pedido no válido para generar cobro</h5>
                    <p className="mt-0.5 leading-relaxed text-[11px] text-[#746E8B]">
                      {getInvalidReason()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#746E8B] leading-relaxed">
                    Al generar el enlace seguro, se creará el acceso único para que el cliente pague su pedido mediante la <strong>pasarela Culqi</strong> (Tarjetas de Débito/Crédito Visa, Mastercard, Diners o Yape) dentro de las 24 horas de reserva.
                  </p>

                  <button
                    type="button"
                    onClick={handleGenerateLink}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-2xl text-xs font-bold bg-gradient-to-r from-[#F4A7C1] to-[#C9B6F2] text-white shadow-kawaii-sm hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generando enlace de cobro...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Generar enlace de pago</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Enlace Activo Generado */}
              {(currentPedido.enlacePagoActivo || lastGeneratedLink) && (
                <div className="p-3.5 rounded-2xl bg-[#F3EEFF]/80 border border-[#C9B6F2]/50 space-y-2">
                  <span className="text-[11px] font-bold text-[#343047] flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#C9B6F2]" />
                    Enlace de Pago Activo:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentPedido.enlacePagoActivo || lastGeneratedLink || ''}
                      className="w-full text-xs font-mono p-2 rounded-xl bg-white border border-gray-200 text-[#343047]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          currentPedido.enlacePagoActivo || lastGeneratedLink || '',
                          'link'
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-[#343047] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check size={14} className="text-[#2D9D78]" /> : <Copy size={14} />}
                      <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Yape, Compartir Enlace & Historial */}
          <div className="lg:col-span-5 space-y-6">
            {/* TARJETA DE COBRO YAPE */}
            <div className="bg-gradient-to-br from-[#742284] via-[#631B72] to-[#450F52] text-white p-5 rounded-3xl shadow-kawaii space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={getAssetUrl('yape_logo.png')}
                    alt="Yape Oficial"
                    className="w-10 h-10 rounded-2xl object-cover shadow-sm bg-white"
                  />
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1.5 text-white">
                      <span>Cobro por Yape</span>
                      <span className="text-[10px] bg-[#00D4B2] text-[#343047] font-bold px-1.5 py-0.2 rounded-full">
                        Oficial
                      </span>
                    </h4>
                    <span className="text-[11px] text-white/80">
                      Datos directos para el cliente
                    </span>
                  </div>
                </div>

                <a
                  href={`#/pago/${rawLinkId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] bg-white/20 hover:bg-white/30 text-white font-semibold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
                  title="Abrir vista de pago que ve el cliente"
                >
                  <ExternalLink size={12} />
                  <span>Ver página</span>
                </a>
              </div>

              {/* QR y Teléfono */}
              <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl backdrop-blur-xs border border-white/10">
                {/* QR Oficial Yape */}
                <div className="bg-white p-1 rounded-xl shrink-0 shadow-sm">
                  <img
                    src={getAssetUrl('qr_yape.jpg')}
                    alt="Yape QR"
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                </div>

                {/* Número y Titular */}
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">
                    Número Yape:
                  </span>
                  <div className="text-lg font-mono font-bold tracking-wide">
                    {NIVALO_STORE_CONTACT.telefonoDisplay}
                  </div>
                  <div className="text-[11px] text-white/90">
                    Titular: <strong>{NIVALO_STORE_CONTACT.titularYape}</strong>
                  </div>
                  <div className="text-[11px] text-[#00D4B2] font-semibold">
                    Total: S/ {currentPedido.total.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Botón copiar datos Yape */}
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `💜 Datos de Pago por Yape:\n📱 Celular: ${NIVALO_STORE_CONTACT.telefonoDisplay}\n👤 Titular: Nivalo Store (Alessandro Iannacone)\n💰 Total: S/ ${currentPedido.total.toFixed(2)}\n🔗 Enlace seguro: ${finalLink}`,
                    'yape'
                  )
                }
                className="w-full py-2.5 px-3 bg-white hover:bg-purple-50 text-[#742284] font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedYapeInfo ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedYapeInfo ? '¡Datos de Yape copiados!' : 'Copiar datos de Yape'}</span>
              </button>
            </div>

            {/* C. Compartir Enlace con Cliente */}
            <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="w-6 h-6 rounded-lg bg-[#FFF0F6] text-[#F4A7C1] flex items-center justify-center text-xs font-bold">
                  C
                </span>
                <h3 className="text-sm font-bold text-[#343047]">
                  Compartir Enlace por Redes Sociales
                </h3>
              </div>

              {/* Opción WhatsApp */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D9D78] flex items-center gap-1.5">
                    <WhatsAppIcon size={14} /> WhatsApp
                  </span>
                  <div className="flex items-center gap-3">
                    {currentPedido?.cliente?.telefono && (
                      <a
                        href={`https://wa.me/51${currentPedido.cliente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-[#2D9D78] hover:underline flex items-center gap-1"
                        title="Abrir chat en WhatsApp"
                      >
                        <ExternalLink size={12} />
                        <span>Abrir chat</span>
                      </a>
                    )}
                    <button
                      onClick={() => copyToClipboard(whatsappText, 'wa')}
                      className="text-[11px] font-semibold text-[#2D9D78] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedWhatsAppMsg ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedWhatsAppMsg ? '¡Copiado!' : 'Copiar texto'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-[#746E8B] bg-white p-2.5 rounded-xl border border-gray-100 font-mono whitespace-pre-wrap leading-relaxed">
                  {whatsappText}
                </p>
              </div>

              {/* Opción Instagram */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F4A7C1] flex items-center gap-1.5">
                    <InstagramIcon size={14} className="text-[#F4A7C1]" /> Instagram DM
                  </span>

                  <button
                    onClick={() => copyToClipboard(instagramText, 'ig')}
                    className="text-[11px] font-semibold text-[#F4A7C1] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedInstagramMsg ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedInstagramMsg ? '¡Copiado!' : 'Copiar texto preparado'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#746E8B] bg-white p-2.5 rounded-xl border border-gray-100 font-mono whitespace-pre-wrap leading-relaxed">
                  {instagramText}
                </p>
              </div>
            </div>

            {/* D. Historial de Intentos de Cobro */}
            <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#F3EEFF] text-[#C9B6F2] flex items-center justify-center text-xs font-bold">
                    D
                  </span>
                  <h3 className="text-sm font-bold text-[#343047]">
                    Historial de Intentos de Cobro
                  </h3>
                </div>
                <span className="text-[11px] bg-gray-100 text-[#746E8B] px-2 py-0.5 rounded-full font-mono font-semibold">
                  {currentPedido.intentosCobro?.length || 0} intentos
                </span>
              </div>

              {(!currentPedido.intentosCobro || currentPedido.intentosCobro.length === 0) ? (
                <div className="text-center py-6 text-xs text-[#746E8B]">
                  No se han registrado intentos de cobro para este pedido aún.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {currentPedido.intentosCobro.map((intento) => {
                    const dateObj = new Date(intento.fechaHora);
                    return (
                      <div key={intento.id} className="pt-2 first:pt-0 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#343047]">
                            Intento #{intento.numeroIntento}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              intento.resultado === 'Generado'
                                ? 'bg-[#2D9D78]/10 text-[#2D9D78]'
                                : intento.resultado === 'Sin respuesta'
                                ? 'bg-[#DE6978]/10 text-[#DE6978]'
                                : 'bg-[#E9B44C]/15 text-[#E9B44C]'
                            }`}
                          >
                            {intento.resultado}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#746E8B]">
                          {dateObj.toLocaleDateString('es-PE')} • {dateObj.toLocaleTimeString('es-PE')}
                        </div>
                        {intento.enlaceGenerado && (
                          <div className="text-[10px] text-[#C9B6F2] font-mono truncate mt-0.5">
                            {intento.enlaceGenerado}
                          </div>
                        )}
                        {intento.mensajeError && (
                          <div className="text-[11px] text-[#DE6978] mt-1 font-medium bg-[#FFF0F6] p-1.5 rounded-lg border border-[#DE6978]/20">
                            {intento.mensajeError}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
