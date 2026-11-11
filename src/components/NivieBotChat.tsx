import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  X,
  RotateCcw,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import type { Producto } from '../types';
import { getAssetUrl, NIVALO_STORE_CONTACT } from '../data/mockData';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  products?: Producto[];
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

interface NivieBotChatProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  onOpenSheinModal?: () => void;
  onOpenNivaPointsModal?: () => void;
  onSelectProduct?: (prod: Producto) => void;
  onAddToCart?: (prod: Producto) => void;
}

// Mascota oficial kawaii de Nivalo Store
const NivieBotAvatar: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M14 26L20 12C20 12 28 17 28 24" fill="#FFE2EC" stroke="#F4A7C1" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M17 24L21 15C21 15 26 19 26 23" fill="#F8B6CC" />
    <path d="M50 26L44 12C44 12 36 17 36 24" fill="#FFE2EC" stroke="#F4A7C1" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M47 24L43 15C43 15 38 19 38 23" fill="#F8B6CC" />
    <circle cx="32" cy="14" r="3.5" fill="#FFAEC9" />
    <circle cx="28.5" cy="13" r="3" fill="#FFC2D5" />
    <circle cx="35.5" cy="13" r="3" fill="#FFC2D5" />
    <circle cx="30" cy="17" r="3" fill="#FFC2D5" />
    <circle cx="34" cy="17" r="3" fill="#FFC2D5" />
    <circle cx="32" cy="14" r="1.8" fill="#FFF275" />
    <rect x="10" y="18" width="44" height="38" rx="19" fill="#FFF7FA" stroke="#F4A7C1" strokeWidth="2.2" />
    <ellipse cx="23" cy="34" rx="2.8" ry="3.5" fill="#4B3B48" />
    <ellipse cx="41" cy="34" rx="2.8" ry="3.5" fill="#4B3B48" />
    <circle cx="24.2" cy="32.8" r="1.2" fill="#FFFFFF" />
    <circle cx="42.2" cy="32.8" r="1.2" fill="#FFFFFF" />
    <circle cx="22" cy="35.5" r="0.6" fill="#FFFFFF" />
    <circle cx="40" cy="35.5" r="0.6" fill="#FFFFFF" />
    <ellipse cx="16" cy="38" rx="4" ry="2.6" fill="#FFAEC9" opacity="0.9" />
    <ellipse cx="48" cy="38" rx="4" ry="2.6" fill="#FFAEC9" opacity="0.9" />
    <ellipse cx="32" cy="37" rx="1.6" ry="1.2" fill="#E6688E" />
    <path d="M29 39.5C30.5 41.5 32 41.5 32 39.5C32 41.5 33.5 41.5 35 39.5" stroke="#E6688E" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 35L14 36" stroke="#F4A7C1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 39L14 39" stroke="#F4A7C1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 36L57 35" stroke="#F4A7C1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 39L57 39" stroke="#F4A7C1" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const NivieBotChat: React.FC<NivieBotChatProps> = ({
  isOpen,
  onClose,
  productos,
  onOpenSheinModal,
  onOpenNivaPointsModal,
  onSelectProduct,
  onAddToCart,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: '¡Konichiwa! 🌸 Soy **Niviebot**, tu asistente virtual kawaii de Nivalo Store ✨',
      timestamp: 'Ahora',
    },
    {
      id: 'init-2',
      sender: 'bot',
      text: '¿En qué te puedo ayudar hoy? Puedes preguntarme sobre productos, stock, envíos por Olva, pagos con Yape o reservas de 24 horas 💖',
      timestamp: 'Ahora',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Preguntas sugeridas
  const QUICK_QUESTIONS = [
    { label: '🕒 Reserva de 24h', query: '¿Cómo funciona la reserva de stock por 24 horas?' },
    { label: '💳 ¿Cómo pagar con Yape?', query: '¿Cómo pago mi pedido por Yape o Plin?' },
    { label: '🚚 Envíos Olva Courier', query: '¿Cuánto cuesta y cómo es el envío por Olva Courier?' },
    { label: '🎀 Ver cosas de Sanrio', query: '¿Qué productos tienen de Sanrio?' },
    { label: '🛍️ Pedidos de Shein', query: '¿Cómo hago un pedido personalizado de Shein?' },
    { label: '✨ NivaPuntos', query: '¿Qué son los NivaPuntos y cómo los acumulo?' },
    { label: '📞 Hablar con humano', query: 'Quiero contactar a una asesora humana por WhatsApp' },
  ];

  // Motor inteligente de respuestas
  const processQuery = (rawQuery: string): { text: string; products?: Producto[]; actions?: any[] } => {
    const q = rawQuery.toLowerCase().trim();

    // 1. Saludos
    if (/^(hola|buenas|holis|ola|hello|hi|hey|buenos dias|buenas tardes)/.test(q)) {
      return {
        text: '¡Hola! 🌸 Qué alegría tenerte en Nivalo Store. ¿Buscas algún producto en especial o deseas información sobre pedidos y envíos?',
      };
    }

    // 2. Reserva de 24 horas
    if (q.includes('reserva') || q.includes('24 hora') || q.includes('24h') || q.includes('tiempo')) {
      return {
        text: '⏰ **Control de Reserva Estricto de 24 Horas:**\n\n' +
          '• Al registrar tu pedido en Nivalo Store, el stock físico se descuenta del catálogo y se guarda exclusivamente para ti durante **24 horas exactas**.\n' +
          '• Si completas el pago dentro del plazo, tu pedido pasa a estado **PAGADO** y se prepara tu paquete.\n' +
          '• Si vencen las 24 horas sin pago, el sistema **libera automáticamente el stock** y cancela la reserva para que otros clientes puedan adquirirlo.',
      };
    }

    // 3. Métodos de Pago / Yape / Plin / BCP
    if (q.includes('yape') || q.includes('plin') || q.includes('pago') || q.includes('pagar') || q.includes('cuenta') || q.includes('transferencia')) {
      return {
        text: '💳 **Métodos de Pago Seguros:**\n\n' +
          '• **Yape y Plin:** Al número oficial **' + NIVALO_STORE_CONTACT.telefonoDisplay + '** a nombre de *Alessandro Iannacone*.\n' +
          '• **Transferencias:** BCP, Interbank y BBVA.\n' +
          '• **Enlace Seguro:** Al generar tu orden, recibes un enlace donde puedes subir tu comprobante de pago. La validación se concilia de inmediato en el sistema.',
      };
    }

    // 4. Envíos / Olva Courier / Shalom / Destinos
    if (q.includes('envio') || q.includes('envío') || q.includes('olva') || q.includes('shalom') || q.includes('costo') || q.includes('provincia') || q.includes('lima')) {
      return {
        text: '🚚 **Información de Envíos Nacionales:**\n\n' +
          '• **Lima Metropolitana:** Envíos por motorizado express o Olva Courier (S/ 8.00 a S/ 10.00). Llega en 24 a 48 horas.\n' +
          '• **Provincias (Todo el Perú):** Vía **Olva Courier** a domicilio o agencia Shalom con pago en destino (S/ 15.00 a S/ 18.00). Llega en 2 a 4 días hábiles.\n' +
          '• ¡Todos los paquetes incluyen número de seguimiento (tracking) y regalitos kawaii sorpresa! 🎀',
      };
    }

    // 5. Pedidos de Shein
    if (q.includes('shein') || q.includes('importar') || q.includes('pedido personal')) {
      return {
        text: '🛍️ **Servicio de Pedidos Shein:**\n\n' +
          '¡Traemos cualquier prenda o accesorio de Shein que desees a precio súper accesible!\n' +
          '1. Copia el link o código SKU del producto en Shein.\n' +
          '2. Ingresa a nuestro modal de **Pedidos Shein** aquí en la tienda.\n' +
          '3. Te cotizamos en Soles (sin sorpresas de aduanas) y gestionamos todo el envío hasta tu puerta.',
        actions: onOpenSheinModal
          ? [
              {
                label: 'Abrir Cotizador Shein 📦',
                onClick: onOpenSheinModal,
              },
            ]
          : undefined,
      };
    }

    // 6. NivaPuntos
    if (q.includes('puntos') || q.includes('nivapuntos') || q.includes('recompensa') || q.includes('descuento')) {
      return {
        text: '✨ **Programa de NivaPuntos:**\n\n' +
          '• Por cada **S/ 1.00 de compra** acumulas **5 NivaPuntos** en tu cuenta.\n' +
          '• Puedes canjear tus puntos acumulados por descuentos directos en tu carrito, papelería gratis o pines exclusivos.',
        actions: onOpenNivaPointsModal
          ? [
              {
                label: 'Ver mis NivaPuntos 🌟',
                onClick: onOpenNivaPointsModal,
              },
            ]
          : undefined,
      };
    }

    // 7. Contacto Humano
    if (q.includes('asesor') || q.includes('humano') || q.includes('persona') || q.includes('whatsapp') || q.includes('telefono') || q.includes('contacto')) {
      return {
        text: '💖 **Atención Personalizada:**\n\n' +
          'Nuestras vendedoras están conectadas en WhatsApp para ayudarte con cualquier consulta o pedido especial.\n' +
          '📞 Teléfono oficial: **' + NIVALO_STORE_CONTACT.telefonoDisplay + '**\n' +
          '📸 Instagram: **' + NIVALO_STORE_CONTACT.instagram + '**',
        actions: [
          {
            label: 'Abrir WhatsApp (+51 998 167 789) 💬',
            onClick: () => window.open(NIVALO_STORE_CONTACT.whatsappUrl, '_blank'),
          },
        ],
      };
    }

    // 8. Búsqueda en el Catálogo de Productos
    const matchedProducts = productos.filter((p) => {
      const term = q;
      const marcaStr = p.marca ? p.marca.toLowerCase() : '';
      const descStr = p.descripcion ? p.descripcion.toLowerCase() : '';
      return (
        p.nombre.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term) ||
        marcaStr.includes(term) ||
        descStr.includes(term) ||
        (term.includes('sanrio') && p.categoria.toLowerCase() === 'sanrio') ||
        (term.includes('maquillaje') && p.categoria.toLowerCase() === 'maquillaje') ||
        (term.includes('ropa') && p.categoria.toLowerCase() === 'ropa') ||
        (term.includes('vestido') && p.nombre.toLowerCase().includes('vestido')) ||
        (term.includes('llavero') && p.nombre.toLowerCase().includes('llavero')) ||
        (term.includes('peluche') && p.nombre.toLowerCase().includes('peluche')) ||
        (term.includes('kpop') && p.categoria.toLowerCase() === 'k-pop') ||
        (term.includes('papeleria') && p.categoria.toLowerCase() === 'papelería') ||
        (term.includes('taza') && p.nombre.toLowerCase().includes('taza')) ||
        (term.includes('lampara') && p.nombre.toLowerCase().includes('lámpara')) ||
        (term.includes('sombras') && p.nombre.toLowerCase().includes('sombras'))
      );
    });

    if (matchedProducts.length > 0) {
      const topMatches = matchedProducts.slice(0, 3);
      return {
        text: `🌸 ¡Encontré **${matchedProducts.length}** producto(s) en nuestro catálogo que coinciden con tu búsqueda! Aquí tienes los destacados:`,
        products: topMatches,
      };
    }

    // 9. Agradecimientos
    if (q.includes('gracias') || q.includes('arigato') || q.includes('thank')) {
      return {
        text: '¡De nada, linda! 🌸 Estoy para servirte siempre que lo necesites. ¡Que tengas un día súper kawaii! ✨💖',
      };
    }

    // 10. Fallback / Ayuda general
    return {
      text: 'No estoy completamente segura de haber entendido tu consulta, pero te puedo ayudar con:\n\n' +
        '• 🛍️ Buscar productos en el catálogo (escribe *sanrio*, *maquillaje*, *vestidos*, etc.)\n' +
        '• ⏰ Reglas de reserva de stock de 24 horas\n' +
        '• 💳 Cómo pagar con Yape o Plin\n' +
        '• 🚚 Envíos por Olva Courier a Lima y provincias\n' +
        '• 💬 Contactar a una asesora humana por WhatsApp',
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Simular tiempo de respuesta natural
    setTimeout(() => {
      const response = processQuery(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        products: response.products,
        actions: response.actions,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'bot',
        text: '¡Conversación reiniciada! 🌸 ¿En qué te puedo ayudar ahora?',
        timestamp: 'Ahora',
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-w-[420px] h-[520px] max-h-[85vh] bg-white rounded-3xl border border-[#FCDCE7] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 font-['Poppins',sans-serif]">
      {/* Encabezado del Chat */}
      <div className="p-3.5 bg-gradient-to-r from-[#FFF0F6] via-[#FFEBF3] to-[#FFF5F8] border-b border-[#FCE1ED] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <NivieBotAvatar className="w-8 h-8" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-[#4A3B4E]">Niviebot ✨</h4>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#DE6978] text-white font-bold tracking-wider">
                IA KAWAII
              </span>
            </div>
            <p className="text-[10px] text-[#3E8E62] flex items-center gap-1 font-medium">
              En línea • Responde al instante
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            title="Reiniciar conversación"
            className="p-1.5 rounded-full text-[#8E7C94] hover:text-[#DE6978] hover:bg-white transition cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={onClose}
            title="Cerrar chat"
            className="p-1.5 rounded-full text-[#8E7C94] hover:text-[#DE6978] hover:bg-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FFFDFE] text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] text-white rounded-br-xs shadow-xs'
                  : 'bg-white border border-[#FCDCE7] text-[#4A3B4E] rounded-bl-xs shadow-xs'
              }`}
            >
              <div className="whitespace-pre-line">
                {msg.text.split('**').map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
                )}
              </div>

              {/* Tarjetas de Productos Recomendados dentro del chat */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-pink-100 space-y-2">
                  <p className="text-[10px] text-[#8E7C94] font-bold uppercase tracking-wider">
                    Sugerencias de nuestro catálogo:
                  </p>
                  <div className="space-y-1.5">
                    {msg.products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FFF8FA] border border-[#FCDCE7] hover:bg-[#FFF0F6] transition"
                      >
                        <img
                          src={getAssetUrl(p.imagen)}
                          alt={p.nombre}
                          className="w-10 h-10 object-cover rounded-lg border border-pink-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-[#4A3B4E] truncate">
                            {p.nombre}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-[#DE6978]">
                              S/ {p.precio.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-[#8E7C94]">
                              Stock: {p.stockDisponible}
                            </span>
                          </div>
                        </div>
                        {onAddToCart && (
                          <button
                            onClick={() => {
                              onAddToCart(p);
                              setMessages((prev) => [
                                ...prev,
                                {
                                  id: `sys-${Date.now()}`,
                                  sender: 'bot',
                                  text: `💖 ¡Agregué **${p.nombre}** a tu carrito de compras!`,
                                  timestamp: 'Ahora',
                                },
                              ]);
                            }}
                            className="p-1.5 rounded-lg bg-[#DE6978] text-white hover:bg-[#C95060] transition cursor-pointer shrink-0"
                            title="Añadir al carrito"
                          >
                            <ShoppingBag size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción dinámicos */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-pink-100 space-y-1.5">
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={act.onClick}
                      className="w-full text-center py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#FFF0F6] to-[#FFEBF3] hover:from-[#FFE5F0] hover:to-[#FFDCEB] border border-[#FCDCE7] text-[11px] font-bold text-[#DE6978] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>{act.label}</span>
                      <ChevronRight size={13} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[9px] text-[#B5A5BC] mt-0.5 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {/* Indicador de escritura animado */}
        {isTyping && (
          <div className="flex items-center gap-1.5 p-2 px-3 rounded-2xl bg-white border border-[#FCDCE7] w-fit shadow-2xs">
            <NivieBotAvatar className="w-4 h-4 animate-bounce" />
            <span className="text-[10px] text-[#8E7C94]">Niviebot está escribiendo</span>
            <div className="flex gap-0.5 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE6978] animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4A7C1] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9B6F2] animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preguntas Frecuentes Rápidas (Chips horizontales desplazables) */}
      <div className="px-3 py-2 bg-[#FFF8FA] border-t border-pink-100 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
        {QUICK_QUESTIONS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.query)}
            className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-pink-200 text-[#4A3B4E] hover:border-[#DE6978] hover:text-[#DE6978] hover:bg-[#FFF0F6] transition shrink-0 cursor-pointer shadow-2xs font-medium"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Formulario de Entrada */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-white border-t border-pink-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escribe tu consulta a Niviebot... 🌸"
          className="flex-1 text-xs px-3 py-2 rounded-2xl border border-pink-200 bg-[#FFFDFE] focus:outline-none focus:border-[#DE6978] focus:bg-white text-[#4A3B4E] placeholder-[#BAA0AC] transition"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] text-white hover:opacity-90 active:scale-95 transition disabled:opacity-40 cursor-pointer shadow-xs shrink-0"
          title="Enviar mensaje"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
