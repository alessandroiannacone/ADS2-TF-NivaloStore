import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Share2,
  Check,
  Truck,
  Gift,
  Clock,
  Plus,
  Minus,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useCart, useProducts } from '../hooks';
import { useStore } from '../context/StoreContext';
import { getAssetUrl } from '../data/mockData';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { ProductCard, CartSidebar } from '../components/storefront';

interface ProductDetailPageProps {
  productId: string;
  onBackToStore: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBackToStore,
}) => {
  const { productos } = useProducts();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    wishlist,
    toggleWishlist,
    transferCartToP1,
    clearCart,
  } = useCart();
  const { createOrder } = useStore();

  // Buscar el producto por ID exacto
  const product = useMemo(() => {
    return productos.find((p) => p.id === productId);
  }, [productos, productId]);

  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Modal de checkout directo desde la vista de detalle
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutNombre, setCheckoutNombre] = useState('');
  const [checkoutTelefono, setCheckoutTelefono] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Productos relacionados de la misma categoría o recomendados
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return productos
      .filter((p) => p.id !== product.id && (p.categoria === product.categoria || p.esRecomendado))
      .slice(0, 4);
  }, [productos, product]);

  const isWish = product ? wishlist.includes(product.id) : false;
  const inCartItem = product ? cart.find((item) => item.producto.id === product.id) : undefined;

  // Manejador para agregar con la cantidad seleccionada
  const handleAddToCart = () => {
    if (!product || product.stockDisponible <= 0) return;
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Manejador para comprar ahora mismo
  const handleBuyNow = () => {
    if (!product || product.stockDisponible <= 0) return;
    if (!inCartItem) {
      addToCart(product, quantity);
    }
    setShowCheckoutModal(true);
  };

  // Copiar enlace del producto
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Mensaje para consulta directa por WhatsApp
  const generateWhatsAppInquiry = () => {
    if (!product) return '';
    const msg = `🌸 ¡Hola Nivalo Store! ✨ Estoy viendo en la tienda: *${product.nombre}* (Código: ${product.id}) por *S/ ${product.precio.toFixed(2)}*.\n\n¿Tienen stock disponible para envío inmediato por Olva Courier? 🚚💖`;
    return encodeURIComponent(msg);
  };

  // Procesar orden directa desde el modal de checkout
  const handleProcessCheckout = () => {
    if (!product) return;
    if (!checkoutNombre.trim()) {
      setCheckoutError('Por favor ingresa tu nombre o usuario.');
      return;
    }
    if (!checkoutTelefono.trim() || checkoutTelefono.trim().length < 8) {
      setCheckoutError('Ingresa un número de celular válido para coordinar la entrega.');
      return;
    }

    const itemsToBuy = inCartItem
      ? cart.map((c) => ({
          id: `DET-${Date.now()}-${c.producto.id}`,
          productoId: c.producto.id,
          productoNombre: c.producto.nombre,
          precioUnitario: c.producto.precio,
          cantidad: c.cantidad,
          subtotal: c.producto.precio * c.cantidad,
          productoImagen: c.producto.imagen,
        }))
      : [
          {
            id: `DET-${Date.now()}-${product.id}`,
            productoId: product.id,
            productoNombre: product.nombre,
            precioUnitario: product.precio,
            cantidad: quantity,
            subtotal: product.precio * quantity,
            productoImagen: product.imagen,
          },
        ];

    const res = createOrder({
      clienteNombre: checkoutNombre.trim(),
      clienteTelefono: checkoutTelefono.trim(),
      canal: 'WhatsApp',
      detalles: itemsToBuy,
    });

    if (res.success && res.pedido) {
      clearCart();
      setShowCheckoutModal(false);
      window.location.hash = `#/pago/${res.pedido.id.replace('PED-', '')}`;
    } else {
      setCheckoutError(res.error || 'Error al generar la orden.');
    }
  };

  // Si el producto no existe en el catálogo
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF5F8] text-[#4A3B4E] font-['Poppins',sans-serif] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl animate-bounce mb-3">🌸</div>
        <h2 className="font-display text-2xl font-bold text-[#4A3B4E]">
          Producto no encontrado
        </h2>
        <p className="text-xs text-[#8E7C94] max-w-sm mt-1 mb-6">
          El producto con código <strong className="font-mono text-[#E2678D]">{productId}</strong> no se encuentra disponible o fue retirado del catálogo.
        </p>
        <button
          onClick={onBackToStore}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F4A7C1] to-[#EE8EAF] text-white text-xs font-bold shadow-kawaii flex items-center gap-2 cursor-pointer hover:opacity-95 transition"
        >
          <ArrowLeft size={16} />
          <span>Volver a la tienda</span>
        </button>
      </div>
    );
  }

  const puntosCalculados = product.puntos || Math.round(product.precio * 5);

  return (
    <div className="min-h-screen bg-[#FFF5F8] text-[#4A3B4E] font-['Poppins',sans-serif] selection:bg-[#FCDCE7] selection:text-[#C74872] pb-16">
      {/* Barra de anuncio superior */}
      <div className="bg-gradient-to-r from-[#FFF0F6] via-[#FFEAF2] to-[#FFF0F6] border-b border-[#FCDCE7] text-[11px] py-1.5 px-4 text-[#A85B77] text-center flex items-center justify-center gap-2">
        <span>🌸</span>
        <span>
          Envíos a todo el Perú por <strong>Olva Courier & Shalom</strong> • Envío <strong>GRATIS</strong> a partir de S/ 80.00
        </span>
      </div>

      {/* Navegación y Botón Retroceder */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Botón Retroceder explícito */}
          <button
            onClick={onBackToStore}
            className="group px-4 py-2 rounded-full bg-white border border-[#FCDCE7] text-xs font-bold text-[#4A3B4E] hover:text-[#E2678D] hover:bg-[#FFF0F6] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#E2678D]" />
            <span>Volver a la tienda</span>
          </button>

          {/* Breadcrumb */}
          <div className="text-[11px] text-[#8E7C94] flex items-center gap-1.5 overflow-hidden">
            <span
              onClick={onBackToStore}
              className="hover:text-[#E2678D] cursor-pointer"
            >
              Tienda
            </span>
            <span>/</span>
            <span className="font-semibold text-[#DE6978]">{product.categoria}</span>
            <span>/</span>
            <span className="text-[#4A3B4E] font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.nombre}
            </span>
          </div>

          {/* Botón Carrito superior */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 rounded-full bg-white border border-[#FCDCE7] text-[#4A3B4E] hover:text-[#E2678D] hover:bg-[#FFF0F6] shadow-xs relative transition cursor-pointer"
            title="Ver carrito de compras"
          >
            <ShoppingBag size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#DE6978] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cart.reduce((a, c) => a + c.cantidad, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL DEL PRODUCTO */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <div className="bg-white rounded-3xl border border-[#FCE1ED] shadow-kawaii p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ================= COLUMNA IZQUIERDA: IMAGEN DEL PRODUCTO ================= */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square rounded-3xl overflow-hidden bg-[#FFF5F8] border border-[#FCDCE7] relative group shadow-sm flex items-center justify-center p-3">
                <img
                  src={getAssetUrl(product.imagen)}
                  alt={product.nombre}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = getAssetUrl('prod_memopads.jpg');
                  }}
                />

                {/* Badges superiores */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                  {product.descuento && (
                    <span className="bg-[#FF9EB7] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {product.descuento}
                    </span>
                  )}
                  {product.badge && (
                    <span className="bg-gradient-to-r from-[#F7A6BF] to-[#F9B7CB] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {product.badge}
                    </span>
                  )}
                  {product.esOferta && (
                    <span className="bg-[#DE6978] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      🎀 OFERTA
                    </span>
                  )}
                </div>

                {/* Botón Favorito flotante sobre la foto */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#7E5E6E] hover:text-[#E2678D] shadow-md transition-transform active:scale-90 cursor-pointer border border-[#FCE1ED]"
                  title="Guardar en favoritos"
                >
                  <Heart
                    size={20}
                    className={isWish ? 'fill-[#F4A7C1] text-[#F4A7C1]' : 'text-[#BA8D9E]'}
                  />
                </button>
              </div>

              {/* Botón para compartir enlace */}
              <div className="flex items-center justify-between text-xs text-[#8E7C94] pt-1 px-1">
                <span className="font-mono text-[11px]">Código: <strong>{product.id}</strong></span>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-[#E2678D] hover:underline cursor-pointer font-semibold"
                >
                  <Share2 size={14} />
                  <span>{copiedLink ? '¡Enlace copiado!' : 'Compartir producto'}</span>
                </button>
              </div>
            </div>

            {/* ================= COLUMNA DERECHA: ESPECIFICACIONES & COMPRA ================= */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              {/* Categoría y Marca */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#FFF0F6] text-[#E2678D] text-xs font-bold uppercase tracking-wider border border-[#FCDCE7]">
                    {product.categoria}
                  </span>
                  {product.marca && (
                    <span className="px-3 py-1 rounded-full bg-purple-50 text-[#742284] text-xs font-bold uppercase tracking-wider border border-purple-200">
                      {product.marca}
                    </span>
                  )}
                  {product.stockDisponible > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                      <Check size={12} />
                      <span>{product.stockDisponible} disponibles</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                      Agotado temporalmente
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#4A3B4E] leading-tight">
                  {product.nombre}
                </h1>
              </div>

              {/* Precios y NivaPuntos */}
              <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-[#FCE1ED] flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-extrabold text-[#DE6978] font-mono">
                      S/ {product.precio.toFixed(2)}
                    </span>
                    {product.precioAnterior && (
                      <span className="text-sm text-[#BAA0AC] line-through font-mono">
                        S/ {product.precioAnterior.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.precioAnterior && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      ¡Ahorras S/ {(product.precioAnterior - product.precio).toFixed(2)} en esta compra!
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#FCDCE7] text-xs font-bold text-[#E2678D] shadow-2xs">
                  <Sparkles size={15} />
                  <span>+{puntosCalculados} NivaPuntos</span>
                </div>
              </div>

              {/* Descripción detallada */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#4A3B4E] uppercase tracking-wider">
                  Descripción del Producto
                </h3>
                <p className="text-xs sm:text-sm text-[#6F5262] leading-relaxed">
                  {product.descripcion ||
                    'Hermoso artículo exclusivo importado directamente desde Asia con acabados de alta calidad, stock verificado e inspección antes de despacho.'}
                </p>
              </div>

              {/* TABLA DE ESPECIFICACIONES TÉCNICAS */}
              <div className="space-y-2 pt-2 border-t border-[#FCE1ED]">
                <h3 className="text-xs font-bold text-[#4A3B4E] uppercase tracking-wider">
                  Especificaciones Técnicas
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {product.medidas && (
                    <div className="p-2.5 rounded-xl bg-[#FFF5F8] border border-[#FCDCE7]">
                      <span className="text-[10px] text-[#8E7C94] uppercase font-bold block">Medidas / Dimensiones:</span>
                      <span className="font-semibold text-[#4A3B4E]">{product.medidas}</span>
                    </div>
                  )}

                  {product.color && (
                    <div className="p-2.5 rounded-xl bg-[#FFF5F8] border border-[#FCDCE7]">
                      <span className="text-[10px] text-[#8E7C94] uppercase font-bold block">Color / Tono:</span>
                      <span className="font-semibold text-[#4A3B4E]">{product.color}</span>
                    </div>
                  )}

                  {product.talla && (
                    <div className="p-2.5 rounded-xl bg-[#FFF5F8] border border-[#FCDCE7]">
                      <span className="text-[10px] text-[#8E7C94] uppercase font-bold block">Talla:</span>
                      <span className="font-semibold text-[#4A3B4E]">{product.talla}</span>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-[#FFF5F8] border border-[#FCDCE7]">
                    <span className="text-[10px] text-[#8E7C94] uppercase font-bold block">Garantía de Reserva:</span>
                    <span className="font-semibold text-[#4A3B4E]">24 horas temporales</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FFF5F8] border border-[#FCDCE7]">
                    <span className="text-[10px] text-[#8E7C94] uppercase font-bold block">Courier Oficial:</span>
                    <span className="font-semibold text-[#002F6C]">Olva Courier & Shalom</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FFF5F8] border border-[#FCDCE7]">
                    <span className="text-[10px] text-[#8E7C94] uppercase font-bold block">Estado de Stock:</span>
                    <span className="font-semibold text-[#3E8E62]">Stock Físico Inmediato</span>
                  </div>
                </div>
              </div>

              {/* SELECTOR DE CANTIDAD Y BOTONES DE ACCIÓN */}
              <div className="space-y-3 pt-3 border-t border-[#FCE1ED]">
                {/* Selector de cantidad */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#4A3B4E]">Cantidad:</span>
                  <div className="flex items-center border border-[#FCDCE7] rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-[#8E7C94] hover:bg-[#FFF0F6] disabled:opacity-40 cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 text-xs font-bold text-[#4A3B4E] min-w-[2.5rem] text-center font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockDisponible, q + 1))}
                      disabled={quantity >= product.stockDisponible}
                      className="p-2 text-[#8E7C94] hover:bg-[#FFF0F6] disabled:opacity-40 cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-[11px] text-[#8E7C94]">
                    (Máximo: {product.stockDisponible} unidades)
                  </span>
                </div>

                {/* Feedback al agregar */}
                {addedSuccess && (
                  <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
                    <Check size={16} />
                    <span>¡Agregado a tu bolsa kawaii! Puedes abrir el carrito para finalizar tu compra.</span>
                  </div>
                )}

                {/* Botones principales de compra */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Botón 1: Añadir a la bolsa */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stockDisponible <= 0}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#FFF0F6] border-2 border-[#F4A7C1] text-[#E2678D] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingBag size={17} />
                    <span>Añadir a la bolsa</span>
                  </button>

                  {/* Botón 2: Comprar con Yape / Plin Directo */}
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stockDisponible <= 0}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#742284] via-[#631B72] to-[#50155E] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <img
                      src={getAssetUrl('yape_logo.png')}
                      alt="Yape"
                      className="w-5 h-5 rounded-md object-contain bg-white p-0.5"
                    />
                    <span>Comprar con Yape</span>
                  </button>
                </div>

                {/* Botón WhatsApp para atención asistida */}
                <a
                  href={`https://wa.me/51998167789?text=${generateWhatsAppInquiry()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer"
                >
                  <WhatsAppIcon size={16} />
                  <span>Consultar este producto por WhatsApp</span>
                </a>
              </div>

              {/* Beneficios de compra Nivalo Store */}
              <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] space-y-2 text-xs text-[#7E5E6E]">
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-[#DE6978] shrink-0" />
                  <span>
                    Envíos a todo el Perú con <strong>Olva Courier</strong> (24h - 48h hábiles).
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Gift size={16} className="text-[#DE6978] shrink-0" />
                  <span>
                    Tu paquete incluye un <strong>regalito sorpresa kawaii</strong> en todas las compras.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-[#DE6978] shrink-0" />
                  <span>
                    Stock asegurado: Se mantiene <strong>reserva exclusiva por 24 horas</strong> al emitir tu orden.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ================= PRODUCTOS RELACIONADOS ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCE1ED]">
              <div>
                <span className="text-[10px] font-bold text-[#DE6978] uppercase tracking-wider">
                  Recomendados para ti
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#4A3B4E]">
                  También te podría gustar 💖
                </h3>
              </div>
              <button
                onClick={onBackToStore}
                className="text-xs font-semibold text-[#E2678D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver catálogo completo</span>
                <ExternalLink size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => {
                const pWish = wishlist.includes(p.id);
                const pInCart = cart.find((item) => item.producto.id === p.id);
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isWish={pWish}
                    inCartQuantity={pInCart?.cantidad}
                    onAddToCart={addToCart}
                    onToggleWishlist={toggleWishlist}
                    onQuickView={(targetProd) => {
                      window.location.hash = `#/producto/${targetProd.id}`;
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Drawer del carrito lateral persistente */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        cartSubtotal={cartSubtotal}
        cartTotal={cartTotal}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setShowCheckoutModal(true);
        }}
        onTransferToP1={() => {
          transferCartToP1();
          setIsCartOpen(false);
        }}
      />

      {/* MODAL DE CHECKOUT DIRECTO CON YAPE */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#FCDCE7] shadow-2xl p-6 text-left relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#F4A7C1]" />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <h3 className="font-display font-bold text-base text-[#4A3B4E]">
                  Comprar con Yape / Plin
                </h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#8E7C94]">
              Ingresa tus datos de entrega para generar tu boleta con el <strong>QR oficial de Yape</strong> y reservar tu stock por 24 horas:
            </p>

            {checkoutError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                ⚠️ {checkoutError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                  Tu Nombre o Usuario <span className="text-[#DE6978]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Valeria Mendoza o @sakura_peru"
                  value={checkoutNombre}
                  onChange={(e) => setCheckoutNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                  Celular / WhatsApp <span className="text-[#DE6978]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 998167789"
                  value={checkoutTelefono}
                  onChange={(e) => setCheckoutTelefono(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                />
              </div>
            </div>

            {/* Resumen del producto */}
            <div className="p-3 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={getAssetUrl(product.imagen)}
                  alt={product.nombre}
                  className="w-10 h-10 rounded-xl object-cover border border-[#FCDCE7]"
                />
                <div>
                  <p className="font-bold text-[#4A3B4E] truncate max-w-[180px]">{product.nombre}</p>
                  <p className="text-[10px] text-[#8E7C94]">{quantity} unidad(es)</p>
                </div>
              </div>
              <span className="font-bold font-mono text-[#742284]">
                S/ {(product.precio * quantity).toFixed(2)}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#4A3B4E] text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessCheckout}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#742284] to-[#50155E] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
              >
                <span>Generar Pago con QR Yape</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
