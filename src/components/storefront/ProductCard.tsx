import React from 'react';
import { Heart, Eye, Plus, Check } from 'lucide-react';
import type { Producto } from '../../types';

interface ProductCardProps {
  product: Producto;
  isWish: boolean;
  inCartQuantity?: number;
  onAddToCart: (prod: Producto) => void;
  onToggleWishlist: (prodId: string) => void;
  onQuickView: (prod: Producto) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product: prod,
  isWish,
  inCartQuantity = 0,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
}) => {
  const handleOpenDetail = () => {
    if (onQuickView) {
      onQuickView(prod);
    } else {
      window.location.hash = `#/producto/${prod.id}`;
    }
  };

  return (
    <div
      key={prod.id}
      className="bg-white rounded-[22px] border border-[#FCE1ED] overflow-hidden shadow-[0_4px_16px_rgba(244,167,193,0.14)] hover:shadow-[0_12px_28px_rgba(244,167,193,0.26)] hover:border-[#F4A7C1] transition-all duration-300 flex flex-col group relative"
    >
      {/* Imagen clicable que redirige al detalle */}
      <div
        onClick={handleOpenDetail}
        className="aspect-square relative overflow-hidden bg-[#FFF5F8] p-1.5 cursor-pointer"
        title={`Ver detalles de ${prod.nombre}`}
      >
        <img
          src={prod.imagen}
          alt={prod.nombre}
          className="w-full h-full object-cover rounded-[16px] group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges de Descuento y Estado */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {prod.descuento && (
            <span className="bg-[#FF9EB7] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              {prod.descuento}
            </span>
          )}
          {prod.badge && (
            <span className="bg-gradient-to-r from-[#F7A6BF] to-[#F9B7CB] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              {prod.badge}
            </span>
          )}
        </div>

        {/* Botón Favoritos */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(prod.id);
          }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#7E5E6E] hover:text-[#E2678D] shadow-xs transition-transform active:scale-90 cursor-pointer border border-[#FCE1ED]"
          title="Guardar en favoritos"
        >
          <Heart
            size={14}
            className={isWish ? 'fill-[#F4A7C1] text-[#F4A7C1]' : 'text-[#BA8D9E]'}
          />
        </button>

        {/* Botones de acción rápida al hover */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            onClick={handleOpenDetail}
            className="flex-1 py-1.5 bg-white/95 backdrop-blur-xs hover:bg-[#FFF0F6] text-[11px] font-semibold text-[#543D4E] hover:text-[#E2678D] rounded-xl shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#FCE1ED]"
            title="Ver especificaciones completas"
          >
            <Eye size={12} />
            <span>Ver</span>
          </button>
          <button
            onClick={() => onAddToCart(prod)}
            disabled={prod.stockDisponible <= 0}
            className="py-1.5 px-3 bg-[#F4A7C1] hover:bg-[#EE8EAF] text-white rounded-xl text-[11px] font-bold shadow-xs flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            title="Añadir a la bolsa"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between text-left">
        <div>
          <span className="text-[10px] text-[#BA8D9E] uppercase font-semibold tracking-wide block truncate">
            {prod.marca || prod.categoria}
          </span>

          <h4
            onClick={handleOpenDetail}
            className="text-xs font-semibold text-[#4A3B4E] mt-0.5 line-clamp-1 hover:text-[#E2678D] transition-colors cursor-pointer"
            title={prod.nombre}
          >
            {prod.nombre}
          </h4>

          {/* Precio y Precio Anterior */}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-[#E2678D]">
              S/ {prod.precio.toFixed(2)}
            </span>
            {prod.precioAnterior && (
              <span className="text-[10px] text-[#BAA0AC] line-through">
                S/ {prod.precioAnterior.toFixed(2)}
              </span>
            )}
          </div>

          {/* Puntos de recompensa ✨ */}
          <div className="text-[10px] text-[#D17796] font-semibold flex items-center gap-0.5 mt-0.5">
            <span>✨</span>
            <span>+{prod.puntos || Math.round(prod.precio * 5)} pts</span>
          </div>

          {/* Chip de Medidas */}
          {prod.medidas && (
            <div className="mt-1.5">
              <span className="inline-block text-[9px] px-2 py-0.5 rounded-md border border-[#FBD5E4] bg-[#FFF5F8] text-[#9C6E82] font-medium max-w-full truncate">
                {prod.medidas}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#FFF0F6] flex items-center justify-between">
          <span className="text-[10px] text-[#BAA0AC]">
            Stock: {prod.stockDisponible}
          </span>

          <button
            onClick={() => onAddToCart(prod)}
            disabled={prod.stockDisponible <= 0}
            className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              inCartQuantity > 0
                ? 'bg-[#FFF0F6] text-[#E2678D] border border-[#FCDCE7]'
                : 'text-[#E2678D] hover:bg-[#FFF0F6]'
            }`}
          >
            {inCartQuantity > 0 ? (
              <>
                <Check size={12} />
                <span>({inCartQuantity})</span>
              </>
            ) : (
              <span>+ Agregar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

