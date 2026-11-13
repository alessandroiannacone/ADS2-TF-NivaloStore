import React from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { Producto } from '../../types';
import { getAssetUrl } from '../../data/mockData';
import { WhatsAppIcon } from '../WhatsAppIcon';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Array<{ producto: Producto; cantidad: number }>;
  cartSubtotal: number;
  cartTotal: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenCheckout: () => void;
  onTransferToP1?: () => void;
  isAdmin?: boolean;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  cart,
  cartSubtotal,
  cartTotal,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  onTransferToP1,
  isAdmin = false,
}) => {
  if (!isOpen) return null;

  const totalCartItems = cart.reduce((acc, curr) => acc + curr.cantidad, 0);

  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return '';
    let msg = '¡Hola Nivalo Store! 🌸 Quisiera pedir los siguientes productos de mi bolsa kawaii:\n\n';
    cart.forEach((item, index) => {
      msg += `${index + 1}. ${item.producto.nombre} x${item.cantidad} - S/ ${(item.producto.precio * item.cantidad).toFixed(2)}\n`;
    });
    const envioTxt = cartSubtotal >= 80 ? 'GRATIS ✨' : 'S/ 15.00';
    msg += `\n*Subtotal:* S/ ${cartSubtotal.toFixed(2)}`;
    msg += `\n*Envío:* ${envioTxt} (Olva Courier / Shalom 🚚)`;
    msg += `\n*Total a Pagar:* S/ ${cartTotal.toFixed(2)}`;
    msg += '\n\n¿Tienen disponibilidad para enviarlo hoy? ✨';
    return encodeURIComponent(msg);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#FCDCE7] shadow-2xl flex flex-col text-left">
          {/* Header del carrito */}
          <div className="p-4 sm:p-5 border-b border-[#FCE1ED] flex items-center justify-between bg-[#FFF7FA]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#4A3B4E]">
                  Tu Bolsa Kawaii
                </h3>
                <p className="text-[11px] text-[#8E7C94]">
                  {totalCartItems} artículos seleccionados
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] hover:text-[#4A3B4E] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Barra de envío gratis (Regla de negocio: >= 80 soles es gratis, sino 15 soles) */}
          <div className="p-3 bg-[#FFF0F6] border-b border-[#FCDCE7] text-xs text-center text-[#7E5E6E]">
            {cartSubtotal >= 80 ? (
              <span className="text-[#3E8E62] font-bold flex items-center justify-center gap-1.5">
                🎉 ¡Felicidades! Tienes ENVÍO GRATIS a todo el Perú
              </span>
            ) : (
              <div>
                <span>
                  ¡Te faltan <strong>S/ {(80 - cartSubtotal).toFixed(2)}</strong> para <strong>Envío GRATIS</strong>! 🚚
                </span>
                <div className="w-full h-1.5 bg-[#FCDCE7] rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#F4A7C1] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (cartSubtotal / 80) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lista de productos en carrito */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="text-5xl">🛍️</div>
                <h4 className="font-bold text-sm text-[#4A3B4E]">Tu bolsa está vacía</h4>
                <p className="text-xs text-[#8E7C94] max-w-xs">
                  Explora nuestro catálogo kawaii de papelería, maquillaje, peluches y ropa coreana.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-[#F4A7C1] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Explorar tienda
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.producto.id}
                  className="p-3 rounded-2xl bg-[#FFF8FA] border border-[#FCE1ED] flex items-center gap-3"
                >
                  <img
                    src={getAssetUrl(item.producto.imagen)}
                    alt={item.producto.nombre}
                    className="w-14 h-14 rounded-xl object-cover border border-[#FCDCE7] shrink-0 bg-pink-50"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = getAssetUrl('prod_memopads.jpg');
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[#4A3B4E] truncate">
                      {item.producto.nombre}
                    </h5>
                    <span className="text-xs font-bold text-[#E2678D]">
                      S/ {item.producto.precio.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center border border-[#FCDCE7] rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.producto.id, item.cantidad - 1)}
                          className="p-1 text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#4A3B4E]">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.producto.id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.producto.stockDisponible}
                          className="p-1 text-[#8E7C94] hover:bg-[#FFF0F6] disabled:opacity-40 cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.producto.id)}
                        className="p-1 text-[#8E7C94] hover:text-[#DE6978] transition-colors ml-auto cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer del carrito */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#FCE1ED] bg-[#FFF7FA] space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#8E7C94]">
                  <span>Subtotal</span>
                  <span>S/ {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8E7C94] items-center">
                  <span>Envío (Olva Courier / Shalom)</span>
                  {cartSubtotal >= 80 ? (
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                      GRATIS ✨
                    </span>
                  ) : (
                    <span className="font-bold text-[#4A3B4E] font-mono">
                      S/ 15.00
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-sm font-bold text-[#4A3B4E] pt-2 border-t border-[#FCDCE7]">
                  <span>Total a Pagar</span>
                  <span className="text-base text-[#742284] font-extrabold font-mono">
                    S/ {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botón Principal: Pagar con Yape / Plin / Boleta de Pago */}
              <button
                onClick={onOpenCheckout}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#742284] via-[#631B72] to-[#50155E] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98 cursor-pointer group"
              >
                <img
                  src={getAssetUrl('yape_logo.png')}
                  alt="Yape"
                  className="w-5 h-5 rounded-md object-contain bg-white p-0.5"
                />
                <span>Comprar con Yape / Plin (Pagar Aquí)</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={`https://wa.me/51998167789?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
              >
                <WhatsAppIcon size={15} />
                <span>Pedir por WhatsApp (Atención Asistida)</span>
              </a>

              {isAdmin && onTransferToP1 && (
                <button
                  onClick={onTransferToP1}
                  className="w-full py-2 rounded-2xl bg-white hover:bg-[#FFF0F6] border border-[#F4A7C1] text-[#E2678D] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Cargar en Panel Vendedor (P1)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
