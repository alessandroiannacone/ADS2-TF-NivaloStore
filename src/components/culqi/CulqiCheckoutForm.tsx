import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Building2,
} from 'lucide-react';
import {
  CULQI_CONFIG,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  processCulqiCardPayment,
  processCulqiYapePayment,
  type CulqiCardData,
  type CulqiYapeData,
  type CulqiChargeResponse,
} from '../../services/culqiService';
import type { Pedido } from '../../types';

interface CulqiCheckoutFormProps {
  pedido: Pedido;
  totalPagar: number;
  onPaymentSuccess: (charge: CulqiChargeResponse) => void;
}

export const CulqiCheckoutForm: React.FC<CulqiCheckoutFormProps> = ({
  pedido,
  totalPagar,
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'yape' | 'pagoefectivo'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedCIP, setCopiedCIP] = useState(false);

  // Formulario Tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState(pedido.cliente.nombreOIdentificador || '');
  const [email, setEmail] = useState('');

  // Formulario Yape Culqi
  const [yapePhone, setYapePhone] = useState(pedido.cliente.telefono || '');
  const [yapeCode, setYapeCode] = useState('');
  const [yapeEmail, setYapeEmail] = useState('');

  // Estado PagoEfectivo
  const [cipCode] = useState(() => `CIP-${Math.floor(1000000 + Math.random() * 9000000)}`);

  const cardBrand = detectCardBrand(cardNumber);

  // Llenar datos de prueba
  const fillTestCard = (type: 'visa' | 'mastercard') => {
    const test = CULQI_CONFIG.testCards[type];
    setCardNumber(test.number);
    setExpiry(test.exp);
    setCvv(test.cvv);
    setCardholderName(test.name);
    setEmail(test.email);
    setErrorMessage('');
  };

  const fillTestYape = () => {
    const test = CULQI_CONFIG.testCards.yape;
    setYapePhone(test.phone);
    setYapeCode(test.approvalCode);
    setYapeEmail(test.email);
    setErrorMessage('');
  };

  // Procesar Pago con Tarjeta
  const handlePayCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const [month, year] = expiry.split('/');
    const cardData: CulqiCardData = {
      cardNumber,
      cvv,
      expirationMonth: month || '',
      expirationYear: year || '',
      email: email.trim(),
      cardholderName: cardholderName.trim(),
    };

    setIsProcessing(true);
    setProcessingStep('Tokenizando tarjeta de forma segura con Culqi...');

    try {
      setTimeout(() => {
        setProcessingStep('Validando fondos y autorización bancaria...');
      }, 600);

      const res = await processCulqiCardPayment(cardData, totalPagar, pedido.id);

      if (res.success && res.charge) {
        setProcessingStep('¡Pago Aprobado exitosamente por Culqi! ✨');
        setTimeout(() => {
          setIsProcessing(false);
          onPaymentSuccess(res.charge!);
        }, 500);
      } else {
        setIsProcessing(false);
        setErrorMessage(res.error || 'No se pudo completar el cobro con Culqi.');
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage('Error al conectar con la pasarela Culqi. Intenta nuevamente.');
      console.error(err);
    }
  };

  // Procesar Pago con Yape Culqi
  const handlePayYape = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const yapeData: CulqiYapeData = {
      phone: yapePhone,
      approvalCode: yapeCode,
      email: yapeEmail.trim(),
    };

    setIsProcessing(true);
    setProcessingStep('Validando código de aprobación Yape con Culqi...');

    try {
      const res = await processCulqiYapePayment(yapeData, totalPagar, pedido.id);

      if (res.success && res.charge) {
        setProcessingStep('¡Yape confirmado al instante por Culqi! 💜');
        setTimeout(() => {
          setIsProcessing(false);
          onPaymentSuccess(res.charge!);
        }, 500);
      } else {
        setIsProcessing(false);
        setErrorMessage(res.error || 'Código Yape no válido o expirado.');
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage('Error al procesar el pago con Yape Culqi.');
      console.error(err);
    }
  };

  // Procesar PagoEfectivo Simulado
  const handleConfirmPagoEfectivo = () => {
    setIsProcessing(true);
    setProcessingStep('Generando código CIP en la red PagoEfectivo...');

    setTimeout(() => {
      const now = new Date();
      const charge: CulqiChargeResponse = {
        id: `chr_cip_${Date.now()}`,
        object: 'charge',
        amount: Math.round(totalPagar * 100),
        amountSol: totalPagar,
        currency_code: 'PEN',
        reference_code: `CULQI-${cipCode}`,
        authorization_code: `AUT-${cipCode.replace('CIP-', '')}`,
        current_status: 'captured',
        card_brand: 'PagoEfectivo (CIP)',
        payment_method: 'PagoEfectivo',
        creation_date: now.toISOString(),
        client_email: email || 'cliente@nivalostore.pe',
        order_id: pedido.id,
      };

      setIsProcessing(false);
      onPaymentSuccess(charge);
    }, 1000);
  };

  const copyCIP = () => {
    navigator.clipboard.writeText(cipCode);
    setCopiedCIP(true);
    setTimeout(() => setCopiedCIP(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-kawaii border-2 border-[#00A9E0]/20 text-left relative overflow-hidden space-y-6">
      {/* Barra de marca Culqi oficial */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Logo Culqi Oficial */}
          <div className="h-11 px-3.5 rounded-2xl bg-gradient-to-r from-[#00A9E0] to-[#0072CE] text-white flex items-center justify-center font-extrabold text-sm tracking-wider shadow-sm">
            <span className="font-['Poppins',sans-serif] font-black text-base tracking-tighter">culqi</span>
            <span className="text-[10px] ml-1 opacity-80">v4</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-[#4A3B4E]">
                Pasarela Segura Culqi
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Instantáneo ⚡
              </span>
            </div>
            <p className="text-[11px] text-[#8E7C94]">
              Tarjetas Débito/Crédito (Visa, Mastercard, Amex), Yape directo y PagoEfectivo
            </p>
          </div>
        </div>

        {/* Sellos de Seguridad */}
        <div className="flex items-center gap-2 text-[10px] text-[#8E7C94]">
          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200">
            <Lock size={12} className="text-[#00A9E0]" />
            <span>256-bit SSL</span>
          </span>
          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>PCI-DSS</span>
          </span>
        </div>
      </div>

      {/* Tabs de Métodos de Culqi */}
      <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
        <button
          type="button"
          onClick={() => {
            setActiveTab('card');
            setErrorMessage('');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'card'
              ? 'bg-[#00A9E0] text-white shadow-xs'
              : 'text-[#7E5E6E] hover:bg-white'
          }`}
        >
          <CreditCard size={15} />
          <span>Tarjeta Débito / Crédito</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('yape');
            setErrorMessage('');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'yape'
              ? 'bg-[#742284] text-white shadow-xs'
              : 'text-[#7E5E6E] hover:bg-purple-50'
          }`}
        >
          <span>💜 Yape Directo Culqi</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('pagoefectivo');
            setErrorMessage('');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'pagoefectivo'
              ? 'bg-[#F39200] text-white shadow-xs'
              : 'text-[#7E5E6E] hover:bg-amber-50'
          }`}
        >
          <Building2 size={15} />
          <span>PagoEfectivo / CIP</span>
        </button>
      </div>

      {/* Mensaje de Error */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PAGO CON TARJETA */}
      {activeTab === 'card' && (
        <form onSubmit={handlePayCard} className="space-y-5">
          {/* Previsualización Visual de la Tarjeta */}
          <div className="w-full max-w-sm mx-auto aspect-[1.58/1] rounded-2xl p-5 bg-gradient-to-tr from-[#1E293B] via-[#334155] to-[#475569] text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/20">
            {/* Brillos de fondo */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00A9E0]/20 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#F4A7C1]/20 rounded-full blur-xl" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#00A9E0] uppercase">
                  Culqi Secured
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-white/10 border border-white/10 uppercase">
                {cardBrand}
              </span>
            </div>

            {/* Chip EMV Dorado */}
            <div className="relative z-10 flex items-center gap-2 my-1">
              <div className="w-9 h-6 rounded-md bg-gradient-to-tr from-amber-300 via-amber-200 to-yellow-100 border border-amber-400 shadow-inner flex items-center justify-center">
                <div className="w-5 h-3.5 border border-amber-500/40 rounded-xs" />
              </div>
              <span className="text-[9px] text-gray-300 uppercase tracking-widest font-mono">Débito / Crédito</span>
            </div>

            {/* Número de tarjeta interactivo */}
            <div className="relative z-10 font-mono text-base sm:text-lg tracking-widest text-center text-white font-semibold">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>

            {/* Titular y Expiración */}
            <div className="relative z-10 flex items-end justify-between pt-1 border-t border-white/10 text-xs">
              <div>
                <p className="text-[8px] uppercase tracking-wider text-gray-300">Titular</p>
                <p className="font-semibold uppercase tracking-wide truncate max-w-[170px]">
                  {cardholderName || 'NOMBRE APELLIDO'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-wider text-gray-300">Vence</p>
                <p className="font-mono font-semibold">{expiry || 'MM/AA'}</p>
              </div>
            </div>
          </div>

          {/* Botones de Prueba Rápida Culqi Oficial */}
          <div className="space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
              <span className="text-[11px] text-[#8E7C94] font-semibold">Tarjetas Oficiales Culqi Test:</span>
              <button
                type="button"
                onClick={() => fillTestCard('visa')}
                className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0072CE] font-bold text-[11px] border border-blue-200 transition cursor-pointer"
                title="Visa Débito de Prueba Culqi (4111 1111 1111 1111 - Vence 09/30 - CVV 123)"
              >
                💳 Visa Demo (4111 1111 1111 1111)
              </button>
              <button
                type="button"
                onClick={() => fillTestCard('mastercard')}
                className="px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#E05A2B] font-bold text-[11px] border border-orange-200 transition cursor-pointer"
                title="Mastercard Crédito de Prueba Culqi (5105 1051 0510 5100 - Vence 09/30 - CVV 123)"
              >
                💳 Mastercard Demo (5105...)
              </button>
            </div>
            <p className="text-[10px] text-[#8E7C94]">
              ℹ️ Integración oficial Culqi Sandbox: <strong>4111 1111 1111 1111</strong> • Vence: <strong>09/30</strong> • CVV: <strong>123</strong> (Débito)
            </p>
          </div>

          {/* Campos del Formulario */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#4A3B4E] mb-1">
                Número de Tarjeta
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="4111 1111 1111 1111"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="w-full bg-[#FFF8FA] border border-[#FCDCE7] rounded-2xl py-3 px-4 text-xs font-mono font-bold text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0072CE] bg-white px-2 py-0.5 rounded-md border border-gray-200">
                  {cardBrand}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4A3B4E] mb-1">
                  Vencimiento (MM/AA)
                </label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  className="w-full bg-[#FFF8FA] border border-[#FCDCE7] rounded-2xl py-3 px-4 text-xs font-mono font-bold text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition text-center"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B4E] mb-1 flex items-center justify-between">
                  <span>CVV / CVC</span>
                  <span className="text-[10px] font-normal text-[#8E7C94]">3 dígitos atrás</span>
                </label>
                <input
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="w-full bg-[#FFF8FA] border border-[#FCDCE7] rounded-2xl py-3 px-4 text-xs font-mono font-bold text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition text-center"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4A3B4E] mb-1">
                  Nombre en la Tarjeta
                </label>
                <input
                  type="text"
                  placeholder="Como figura en la tarjeta"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full bg-[#FFF8FA] border border-[#FCDCE7] rounded-2xl py-3 px-4 text-xs text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3B4E] mb-1">
                  Email para el Comprobante
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FFF8FA] border border-[#FCDCE7] rounded-2xl py-3 px-4 text-xs text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#00A9E0] focus:ring-2 focus:ring-[#00A9E0]/20 transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Botón Pagar con Tarjeta */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00A9E0] via-[#008CC9] to-[#0072CE] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{processingStep || 'Procesando con Culqi...'}</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>Pagar S/ {totalPagar.toFixed(2)} con Culqi</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* PAGO CON YAPE CULQI */}
      {activeTab === 'yape' && (
        <form onSubmit={handlePayYape} className="space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#742284]/10 via-purple-50 to-[#00D4B2]/10 border border-[#742284]/30 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">💜</span>
              <h4 className="font-bold text-sm text-[#742284]">
                Paga con Yape Directo Culqi (Sin Captura Manual)
              </h4>
            </div>
            <p className="text-xs text-[#746E8B] leading-relaxed">
              Ingresa tu número de celular registrado en Yape y el <strong>código de aprobación de 6 dígitos</strong> generado desde tu app Yape (Menú &gt; Código de aprobación). ¡Tu orden se aprueba al instante!
            </p>
          </div>

          {/* Botón Demo Yape */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-[11px] text-[#8E7C94] font-semibold">¿Quieres probar el flujo?</span>
            <button
              type="button"
              onClick={fillTestYape}
              className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#742284] font-bold text-[11px] border border-purple-200 transition cursor-pointer"
            >
              💜 Llenar Código Yape Demo
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#4A3B4E] mb-1">
                Número de Celular Yape
              </label>
              <input
                type="tel"
                placeholder="998 167 789"
                value={yapePhone}
                onChange={(e) => setYapePhone(e.target.value)}
                maxLength={12}
                className="w-full bg-[#FFF8FA] border border-[#FCDCE7] rounded-2xl py-3 px-4 text-xs font-mono font-bold text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#742284] focus:ring-2 focus:ring-[#742284]/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3B4E] mb-1 flex items-center justify-between">
                <span>Código de Aprobación Yape</span>
                <span className="text-[10px] text-[#742284] font-semibold">6 dígitos en tu app</span>
              </label>
              <input
                type="text"
                placeholder="123456"
                value={yapeCode}
                onChange={(e) => setYapeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full bg-[#FFF8FA] border border-[#FCDCE7] rounded-2xl py-3 px-4 text-base font-mono font-extrabold text-[#742284] tracking-widest placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#742284] focus:ring-2 focus:ring-[#742284]/20 transition text-center"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A3B4E] mb-1">
                Correo Electrónico para el Comprobante
              </label>
              <input
                type="email"
                placeholder="cliente@ejemplo.com"
                value={yapeEmail}
                onChange={(e) => setYapeEmail(e.target.value)}
                className="w-full bg-[#FFF8FA] border border-[#FCDCE7] rounded-2xl py-3 px-4 text-xs text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#742284] focus:ring-2 focus:ring-[#742284]/20 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#742284] to-[#50155E] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{processingStep || 'Validando con Yape Culqi...'}</span>
              </>
            ) : (
              <>
                <span>💜 Confirmar Pago de S/ {totalPagar.toFixed(2)} con Yape</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* PAGO CON PAGOEFECTIVO */}
      {activeTab === 'pagoefectivo' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏛️</span>
              <h4 className="font-bold text-sm text-[#B45309]">
                PagoEfectivo: Paga en Agentes o Banca por Internet
              </h4>
            </div>
            <p className="text-xs text-[#78350F] leading-relaxed">
              Genera tu código CIP y págalo a través de tu banca móvil (BCP, BBVA, Interbank, Scotiabank, BanBif) o en cualquier agente KasNet o Western Union.
            </p>
          </div>

          {/* Código CIP */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#8E7C94] tracking-widest block">
              Tu Código de Pago CIP:
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-black text-[#1E293B] tracking-wider">
                {cipCode}
              </span>
              <button
                type="button"
                onClick={copyCIP}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-[#4A3B4E] font-semibold text-xs border border-gray-200 transition flex items-center gap-1 cursor-pointer"
              >
                {copiedCIP ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedCIP ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#8E7C94]">
              Monto a pagar: <strong className="text-[#DE6978]">S/ {totalPagar.toFixed(2)}</strong> • Vence en 24 horas
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirmPagoEfectivo}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F39200] to-[#E07900] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{processingStep || 'Procesando CIP...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Simular Pago Bancario de este CIP (Culqi Demo)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Pie con información y garantía Culqi */}
      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8E7C94]">
        <div className="flex items-center gap-2">
          <span>🔒 Transacción 100% protegida por <strong>Culqi / BCP</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#5D4251]">
          <span>Garantía Nivalo Store</span>
          <span>•</span>
          <span>Reserva 24h</span>
        </div>
      </div>
    </div>
  );
};
