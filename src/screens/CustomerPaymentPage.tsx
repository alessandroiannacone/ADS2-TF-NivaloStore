import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { NIVALO_STORE_CONTACT, getAssetUrl, INITIAL_PRODUCTOS } from '../data/mockData';

interface CustomerPaymentPageProps {
  pedidoId: string;
  onBackToStore?: () => void;
}

export const CustomerPaymentPage: React.FC<CustomerPaymentPageProps> = ({
  pedidoId,
  onBackToStore,
}) => {
  const { pedidos, productos } = useStore();
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedTotal, setCopiedTotal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'yape' | 'plin' | 'transferencia'>('yape');

  // Buscar el pedido correspondiente
  const normalizedId = pedidoId.startsWith('PED-') ? pedidoId : `PED-${pedidoId.padStart(6, '0')}`;
  const pedido = pedidos.find((p) => p.id === normalizedId || p.id.replace('PED-', '') === pedidoId);

  // Calcular tiempo restante de reserva de 24 horas
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!pedido) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const expiration = new Date(pedido.fechaVencimientoReserva).getTime();
      const diff = expiration - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [pedido]);

  // Subtotal de artículos y costo de envío calculado/almacenado
  const itemsSubtotal = pedido ? (pedido.detalles || []).reduce((acc, curr) => acc + curr.subtotal, 0) : 0;
  const shippingCost = pedido
    ? (pedido.costoEnvio !== undefined
        ? pedido.costoEnvio
        : pedido.total > itemsSubtotal
        ? Math.round((pedido.total - itemsSubtotal) * 100) / 100
        : itemsSubtotal >= 80
        ? 0
        : 15)
    : 0;
  const totalExacto = pedido ? (pedido.total > 0 ? pedido.total : itemsSubtotal + shippingCost) : 0;

  const copyNumber = () => {
    navigator.clipboard.writeText(NIVALO_STORE_CONTACT.telefono);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const copyTotalAmount = () => {
    if (!pedido) return;
    navigator.clipboard.writeText(totalExacto.toFixed(2));
    setCopiedTotal(true);
    setTimeout(() => setCopiedTotal(false), 2000);
  };

  // Helper para resolver la imagen oficial del producto en la boleta
  const getItemImage = (item: { productoId: string; productoNombre: string; productoImagen?: string }) => {
    if (item.productoImagen && item.productoImagen.trim() !== '') {
      return getAssetUrl(item.productoImagen);
    }
    const foundInState = productos.find((p) => p.id === item.productoId);
    if (foundInState?.imagen) {
      return getAssetUrl(foundInState.imagen);
    }
    const foundInMock = INITIAL_PRODUCTOS.find((p) => p.id === item.productoId);
    if (foundInMock?.imagen) {
      return getAssetUrl(foundInMock.imagen);
    }
    const norm = (s: string) =>
      (s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    const nameClean = norm(item.productoNombre);
    const foundByName =
      productos.find((p) => norm(p.nombre) === nameClean) ||
      INITIAL_PRODUCTOS.find((p) => norm(p.nombre) === nameClean) ||
      productos.find(
        (p) =>
          norm(p.nombre).includes(nameClean) ||
          nameClean.includes(norm(p.nombre))
      ) ||
      INITIAL_PRODUCTOS.find(
        (p) =>
          norm(p.nombre).includes(nameClean) ||
          nameClean.includes(norm(p.nombre))
      );
    if (foundByName?.imagen) {
      return getAssetUrl(foundByName.imagen);
    }
    return getAssetUrl('prod_memopads.jpg');
  };

  if (!pedido) {
    return (
      <div className="min-h-screen bg-[#FFF8FA] flex flex-col items-center justify-center p-4 text-center font-['Poppins',sans-serif]">
        <div className="bg-white p-8 rounded-3xl shadow-kawaii max-w-md w-full border border-pink-100 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-400 mx-auto flex items-center justify-center text-3xl">
            🌸
          </div>
          <h2 className="text-xl font-bold text-[#4A3B4E]">Pedido no encontrado</h2>
          <p className="text-xs text-[#8E7C94]">
            El código de pedido <span className="font-mono font-bold text-[#F4A7C1]">{normalizedId}</span> no existe o ha expirado.
          </p>
          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="w-full py-3 rounded-2xl bg-[#F4A7C1] text-white font-bold text-xs shadow-md hover:bg-[#DE6978] transition"
            >
              Volver a la tienda
            </button>
          )}
        </div>
      </div>
    );
  }

  const isPending = pedido.estado === 'PENDIENTE_PAGO';
  const isPaid = pedido.estado === 'PAGADO';
  const isCancelled = pedido.estado === 'CANCELADO' || timeLeft.isExpired;

  const waMessage = `🌸 ¡Hola Nivalo Store! Ya realicé mi pago de *S/ ${totalExacto.toFixed(2)}* por *Yape* para el pedido *${pedido.id}*. Adjunto mi comprobante de pago 📸`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] via-[#FFF9FB] to-white text-[#4A3B4E] font-['Poppins',sans-serif] pb-12">
      {/* Header Seguro */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#FCDCE7] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBackToStore && (
              <button
                onClick={onBackToStore}
                className="p-1.5 rounded-xl hover:bg-pink-50 text-[#8E7C94] hover:text-[#4A3B4E] transition"
                title="Volver"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xl">🌸</span>
              <span className="font-['Fredoka',sans-serif] font-bold text-lg text-[#F4A7C1] tracking-wide">
                Nivalo Store
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Pago Seguro 100% Garantizado</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner de Reserva de 24 Horas */}
        {isPending && !isCancelled && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF0F6] to-[#F3EEFF] border border-[#F4A7C1]/50 shadow-kawaii-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E9B44C] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock size={20} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#343047] flex items-center gap-1.5">
                  <span>Stock Reservado Temporalmente (24 Horas)</span>
                </h4>
                <p className="text-[11px] text-[#746E8B]">
                  Tus artículos están separados para ti. Completa tu pago antes de que expire la reserva.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-2xl border border-[#E9B44C]/30 shadow-xs self-start sm:self-auto font-mono text-xs font-bold text-[#E9B44C]">
              <span>Tiempo restante:</span>
              <span>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        {/* Estado Si Ya Fue Pagado */}
        {isPaid && (
          <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-kawaii-sm flex items-center gap-3 text-emerald-800">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">¡Pago Confirmado con Éxito!</h4>
              <p className="text-xs text-emerald-700">
                Tu pedido ya se encuentra pagado y en preparación para empaque y despacho.
              </p>
            </div>
          </div>
        )}

        {/* Estado Si Fue Cancelado o Vencido */}
        {isCancelled && (
          <div className="p-4 rounded-3xl bg-red-50 border border-red-200 shadow-kawaii-sm flex items-center gap-3 text-red-800">
            <Clock size={24} className="text-red-500 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Reserva Vencida o Cancelada</h4>
              <p className="text-xs text-red-700">
                El plazo de 24 horas ha concluido y el stock ha sido reintegrado a la tienda. Si ya pagaste, comunícate con nosotros por WhatsApp.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Opciones de Pago (Culqi y Métodos Tradicionales) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Selector de Método: Yape, Plin y Transferencia */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-pink-100 shadow-xs">
              <button
                onClick={() => setSelectedMethod('yape')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  selectedMethod === 'yape'
                    ? 'bg-gradient-to-r from-[#742284] to-[#50155E] text-white shadow-sm'
                    : 'text-[#746E8B] hover:bg-purple-50'
                }`}
              >
                <span>💜 Yape (QR y Celular)</span>
              </button>

              <button
                onClick={() => setSelectedMethod('plin')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  selectedMethod === 'plin'
                    ? 'bg-gradient-to-r from-[#00A9E0] to-[#0072CE] text-white shadow-sm'
                    : 'text-[#746E8B] hover:bg-cyan-50'
                }`}
              >
                <span>💙 Plin (QR y Celular)</span>
              </button>

              <button
                onClick={() => setSelectedMethod('transferencia')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  selectedMethod === 'transferencia'
                    ? 'bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] text-white shadow-sm'
                    : 'text-[#746E8B] hover:bg-pink-50'
                }`}
              >
                <span>🏦 Transferencia Bancaria</span>
              </button>
            </div>

            {/* 1. TARJETA DE PAGO YAPE CON QR Y DATOS COMPLETOS */}
            {selectedMethod === 'yape' && (
              <div className="bg-white rounded-3xl p-6 shadow-kawaii border-2 border-[#742284]/30 relative overflow-hidden space-y-5">
                {/* Cabecera Yape */}
                <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAssetUrl('yape_logo.png')}
                      alt="Yape Oficial"
                      className="w-12 h-12 rounded-2xl object-cover shadow-md bg-white border border-purple-100"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#742284]">
                          Pagar con Yape
                        </h3>
                        <span className="text-[10px] bg-[#00D4B2] text-[#343047] font-bold px-2 py-0.5 rounded-full">
                          Sin Comisiones
                        </span>
                      </div>
                      <p className="text-xs text-[#746E8B]">
                        Yapea al instante escaneando el código QR o mediante el número de celular
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR y Datos Organizados de Forma Impecable */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center py-2">
                  {/* Código QR Oficial de Yape */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center">
                    <div className="p-3 bg-gradient-to-br from-[#742284] via-[#631B72] to-[#4A3E4E] rounded-3xl shadow-md flex flex-col items-center w-full max-w-[210px]">
                      <div className="bg-white p-2.5 rounded-2xl shadow-inner flex flex-col items-center justify-center w-full">
                        <img
                          src={getAssetUrl('qr_yape.jpg')}
                          alt="Código QR Yape Nivalo Store"
                          className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-xl"
                        />
                        <div className="mt-1.5 text-center">
                          <span className="text-[11px] font-bold text-[#742284] flex items-center justify-center gap-1">
                            <span>💜</span> Escanea con tu app Yape
                          </span>
                          <span className="text-[9px] text-[#8E7C94]">
                            Abre Yape y enfoca la cámara
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recuadros Bonitos, Ordenados y Sin Desbordes */}
                  <div className="sm:col-span-7 space-y-2.5 w-full min-w-0">
                    {/* Recuadro 1: Número Celular */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-[#742284] tracking-wider truncate">
                          Número Celular Yape:
                        </span>
                        <button
                          type="button"
                          onClick={copyNumber}
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-purple-100 text-[#742284] font-bold text-[11px] border border-purple-200 transition-all flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer active:scale-95"
                          title="Copiar número"
                        >
                          {copiedNumber ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedNumber ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <div className="text-base sm:text-lg font-black font-mono text-[#343047] tracking-wider">
                        {NIVALO_STORE_CONTACT.telefonoDisplay}
                      </div>
                    </div>

                    {/* Recuadro 2: Titular */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-[#742284] tracking-wider block mb-0.5">
                        Titular de la Cuenta:
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-[#343047] truncate">
                        Nivalo Store (Alessandro Iannacone)
                      </p>
                    </div>

                    {/* Recuadro 3: Total Exacto */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FFF0F6] border-2 border-[#F4A7C1] shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-[#DE6978] tracking-wider truncate">
                          Total Exacto a Yapear:
                        </span>
                        <button
                          type="button"
                          onClick={copyTotalAmount}
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-pink-100 text-[#DE6978] font-bold text-[11px] border border-pink-200 transition-all flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer active:scale-95"
                          title="Copiar total"
                        >
                          {copiedTotal ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedTotal ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-[#DE6978] tracking-tight">
                        S/ {totalExacto.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pasos a seguir */}
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2 text-xs text-[#746E8B]">
                  <h5 className="font-bold text-[#742284] flex items-center gap-1.5">
                    <span>📌</span> Pasos para confirmar tu compra con Yape:
                  </h5>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>Abre tu aplicación <strong>Yape</strong> en tu teléfono.</li>
                    <li>Escanea el código QR de arriba o yapea a <strong>{NIVALO_STORE_CONTACT.telefonoDisplay}</strong>.</li>
                    <li>Ingresa el monto exacto: <strong className="font-mono text-[#742284]">S/ {totalExacto.toFixed(2)}</strong>.</li>
                    <li>Toma una captura de tu comprobante y presiona el botón verde de abajo para enviárnosla.</li>
                  </ol>
                </div>

                {/* Botón WhatsApp Comprobante */}
                <a
                  href={`https://wa.me/51${NIVALO_STORE_CONTACT.telefono}?text=${encodeURIComponent(waMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <WhatsAppIcon size={18} />
                  <span>Ya yapé, enviar comprobante por WhatsApp</span>
                </a>
              </div>
            )}

            {/* 2. TARJETA DE PAGO PLIN CON QR OFICIAL Y DATOS */}
            {selectedMethod === 'plin' && (
              <div className="bg-white rounded-3xl p-6 shadow-kawaii border-2 border-[#00A9E0]/40 relative overflow-hidden space-y-5">
                {/* Cabecera Plin */}
                <div className="flex items-center justify-between border-b border-cyan-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00A9E0] to-[#0072CE] text-white flex items-center justify-center font-black text-2xl shadow-md border border-cyan-200">
                      P
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#0072CE]">
                          Pagar con Plin
                        </h3>
                        <span className="text-[10px] bg-[#00A9E0] text-white font-bold px-2 py-0.5 rounded-full">
                          Interoperable
                        </span>
                      </div>
                      <p className="text-xs text-[#746E8B]">
                        Válido desde BBVA, Scotiabank, Interbank y BanBif
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR y Datos Plin Organizados de Forma Impecable */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center py-2">
                  {/* Código QR Oficial de Plin (Imagen Subida) */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center">
                    <div className="p-3 bg-gradient-to-br from-[#00A9E0] via-[#008CC9] to-[#0072CE] rounded-3xl shadow-md flex flex-col items-center w-full max-w-[210px]">
                      <div className="bg-white p-2.5 rounded-2xl shadow-inner flex flex-col items-center justify-center w-full">
                        <img
                          src={getAssetUrl('qr_plin.png')}
                          alt="Código QR Plin Nivalo Store"
                          className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-xl"
                        />
                        <div className="mt-1.5 text-center">
                          <span className="text-[11px] font-bold text-[#0072CE] flex items-center justify-center gap-1">
                            <span>💙</span> Escanea con tu app Plin
                          </span>
                          <span className="text-[9px] text-[#746E8B]">
                            BBVA • Interbank • Scotiabank
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recuadros Bonitos, Ordenados y Sin Desbordes para Plin */}
                  <div className="sm:col-span-7 space-y-2.5 w-full min-w-0">
                    {/* Recuadro 1: Celular Plin */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F0FAFF] border border-[#BFE8F7] shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-[#0072CE] tracking-wider truncate">
                          Número Celular Plin:
                        </span>
                        <button
                          type="button"
                          onClick={copyNumber}
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-cyan-100 text-[#0072CE] font-bold text-[11px] border border-cyan-200 transition-all flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer active:scale-95"
                          title="Copiar número"
                        >
                          {copiedNumber ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedNumber ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <div className="text-base sm:text-lg font-black font-mono text-[#343047] tracking-wider">
                        {NIVALO_STORE_CONTACT.telefonoDisplay}
                      </div>
                    </div>

                    {/* Recuadro 2: Titular */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F0FAFF] border border-[#BFE8F7] shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-[#0072CE] tracking-wider block mb-0.5">
                        Titular de la Cuenta:
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-[#343047] truncate">
                        Nivalo Store (Alessandro Iannacone)
                      </p>
                    </div>

                    {/* Recuadro 3: Total Exacto */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FFF0F6] border-2 border-[#F4A7C1] shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-[#DE6978] tracking-wider truncate">
                          Total Exacto a Pagar por Plin:
                        </span>
                        <button
                          type="button"
                          onClick={copyTotalAmount}
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-pink-100 text-[#DE6978] font-bold text-[11px] border border-pink-200 transition-all flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer active:scale-95"
                          title="Copiar total"
                        >
                          {copiedTotal ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedTotal ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-[#DE6978] tracking-tight">
                        S/ {totalExacto.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pasos a seguir Plin */}
                <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-100 space-y-2 text-xs text-[#746E8B]">
                  <h5 className="font-bold text-[#0072CE] flex items-center gap-1.5">
                    <span>📌</span> Pasos para pagar con Plin:
                  </h5>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>Abre tu aplicación bancaria (BBVA, Interbank, Scotiabank o BanBif).</li>
                    <li>Elige <strong>Plin</strong> y escanea el código QR de arriba o ingresa el número <strong>{NIVALO_STORE_CONTACT.telefonoDisplay}</strong>.</li>
                    <li>Digita el monto exacto: <strong className="font-mono text-[#0072CE]">S/ {totalExacto.toFixed(2)}</strong>.</li>
                    <li>Captura el comprobante y envíanoslo por WhatsApp pulsando el botón verde abajo.</li>
                  </ol>
                </div>

                {/* Botón WhatsApp Comprobante Plin */}
                <a
                  href={`https://wa.me/51${NIVALO_STORE_CONTACT.telefono}?text=${encodeURIComponent(waMessage.replace(/Yape/g, 'Plin'))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <WhatsAppIcon size={18} />
                  <span>Ya plineé, enviar comprobante por WhatsApp</span>
                </a>
              </div>
            )}

            {/* 3. TRANSFERENCIA MANUAL */}
            {selectedMethod === 'transferencia' && (
              <div className="bg-white rounded-3xl p-6 shadow-kawaii border border-pink-100 space-y-4">
                <h3 className="text-base font-bold text-[#343047]">Transferencia Bancaria</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-[#343047] block">BCP (Banco de Crédito del Perú)</span>
                    <span className="font-mono text-[#746E8B] block">Cta: 193-98765432-0-12</span>
                    <span className="font-mono text-[10px] text-[#746E8B] block">CCI: 0021930098765432012</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-[#343047] block">Interbank</span>
                    <span className="font-mono text-[#746E8B] block">Cta: 200-3001234567</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/51${NIVALO_STORE_CONTACT.telefono}?text=${encodeURIComponent(waMessage.replace('por *Yape*', 'por Transferencia Bancaria'))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon size={18} />
                  <span>Enviar constancia bancaria</span>
                </a>
              </div>
            )}
          </div>

          {/* Columna Derecha: Resumen del Pedido */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl p-6 shadow-kawaii border border-pink-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#F4A7C1]" />
                  <h4 className="font-bold text-sm text-[#343047]">Resumen del Pedido</h4>
                </div>
                <span className="text-xs font-mono font-bold bg-pink-50 text-[#F4A7C1] px-2 py-0.5 rounded-full border border-pink-100">
                  {pedido.id}
                </span>
              </div>

              {/* Cliente */}
              <div className="text-xs text-[#746E8B] space-y-1">
                <div>
                  Cliente: <strong className="text-[#343047]">{pedido.cliente.nombreOIdentificador}</strong>
                </div>
                <div>
                  Canal: <strong className="text-[#343047]">{pedido.cliente.canal}</strong> ({pedido.cliente.telefono})
                </div>
              </div>

              {/* Items con foto respectiva del producto */}
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                {pedido.detalles.map((item, idx) => {
                  const itemImg = getItemImage(item);
                  return (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-2xl bg-pink-50 overflow-hidden shrink-0 border border-pink-100 shadow-xs flex items-center justify-center">
                          <img
                            src={itemImg}
                            alt={item.productoNombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = getAssetUrl('prod_memopads.jpg');
                            }}
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-[#343047] block line-clamp-1">
                            {item.productoNombre}
                          </span>
                          <span className="text-[11px] text-[#8E7C94]">
                            {item.cantidad} x S/ {item.precioUnitario.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-[#343047] shrink-0 font-mono">
                        S/ {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total Final con Desglose */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#746E8B]">
                  <span>Subtotal</span>
                  <span className="font-mono">S/ {itemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#746E8B] items-center">
                  <span>Envío (Olva Courier / Shalom)</span>
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                      Gratis ✨
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-[#4A3B4E]">
                      S/ {shippingCost.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-base font-bold text-[#343047] pt-2 border-t border-gray-100">
                  <span>Total a Pagar</span>
                  <span className="text-[#DE6978] text-xl font-extrabold font-mono">
                    S/ {totalExacto.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta de Contacto y Ayuda */}
            <div className="p-4 rounded-3xl bg-pink-50/60 border border-pink-100 space-y-2 text-xs">
              <h5 className="font-bold text-[#343047] flex items-center gap-1.5">
                <span>💬</span> ¿Tienes alguna duda sobre tu compra?
              </h5>
              <p className="text-[11px] text-[#746E8B]">
                Estamos en línea para ayudarte con tu pedido o resolver cualquier consulta.
              </p>
              <a
                href={NIVALO_STORE_CONTACT.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#2D9D78] font-bold text-xs hover:underline pt-1"
              >
                <span>Chatear con soporte ({NIVALO_STORE_CONTACT.telefonoDisplay})</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};