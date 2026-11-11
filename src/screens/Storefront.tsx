import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  X,
  ChevronDown,
  Check,
  Eye,
  SlidersHorizontal,
  RotateCcw,
  Truck,
  Gift,
  ShieldCheck,
  Shield,
  Lightbulb,
  ExternalLink,
  Play,
  Pause,
  Send,
  LogOut,
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { NivieBotChat } from '../components/NivieBotChat';
import { getAssetUrl } from '../data/mockData';
import type { Producto, DetallePedido } from '../types';

// Mascota oficial kawaii de Nivalo Store (Pastel Pink Ultra Kawaii)
const NivaloCatMascot: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Orejitas pastel suaves */}
    <path d="M14 26L20 12C20 12 28 17 28 24" fill="#FFE2EC" stroke="#F4A7C1" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M17 24L21 15C21 15 26 19 26 23" fill="#F8B6CC" />
    <path d="M50 26L44 12C44 12 36 17 36 24" fill="#FFE2EC" stroke="#F4A7C1" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M47 24L43 15C43 15 38 19 38 23" fill="#F8B6CC" />
    {/* Florcita de sakura en la cabecita */}
    <circle cx="32" cy="14" r="3.5" fill="#FFAEC9" />
    <circle cx="28.5" cy="13" r="3" fill="#FFC2D5" />
    <circle cx="35.5" cy="13" r="3" fill="#FFC2D5" />
    <circle cx="30" cy="17" r="3" fill="#FFC2D5" />
    <circle cx="34" cy="17" r="3" fill="#FFC2D5" />
    <circle cx="32" cy="14" r="1.8" fill="#FFF275" />
    {/* Cabeza redondita suave */}
    <rect x="10" y="18" width="44" height="38" rx="19" fill="#FFF7FA" stroke="#F4A7C1" strokeWidth="2.2" />
    {/* Ojitos tiernos con brillo */}
    <ellipse cx="23" cy="34" rx="2.8" ry="3.5" fill="#4B3B48" />
    <ellipse cx="41" cy="34" rx="2.8" ry="3.5" fill="#4B3B48" />
    <circle cx="24.2" cy="32.8" r="1.2" fill="#FFFFFF" />
    <circle cx="42.2" cy="32.8" r="1.2" fill="#FFFFFF" />
    <circle cx="22" cy="35.5" r="0.6" fill="#FFFFFF" />
    <circle cx="40" cy="35.5" r="0.6" fill="#FFFFFF" />
    {/* Mejillas sonrojadas super cute */}
    <ellipse cx="16" cy="38" rx="4" ry="2.6" fill="#FFAEC9" opacity="0.9" />
    <ellipse cx="48" cy="38" rx="4" ry="2.6" fill="#FFAEC9" opacity="0.9" />
    {/* Naricita y boquita kawaii */}
    <ellipse cx="32" cy="37" rx="1.6" ry="1.2" fill="#E6688E" />
    <path d="M29 39.5C30.5 41.5 32 41.5 32 39.5C32 41.5 33.5 41.5 35 39.5" stroke="#E6688E" strokeWidth="1.8" strokeLinecap="round" />
    {/* Bigotitos rosas */}
    <path d="M7 35L14 36" stroke="#F4A7C1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 39L14 39" stroke="#F4A7C1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 36L57 35" stroke="#F4A7C1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 39L57 39" stroke="#F4A7C1" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const Storefront: React.FC = () => {
  const {
    productos,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartShippingCost,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    wishlist,
    toggleWishlist,
    transferCartToP1,
    createOrder,
    clearCart,
  } = useStore();

  const { user, profile, isAdmin, signOut } = useAuth();

  // Control de vista: 'inicio' (Pantalla Principal scrollable completa) vs 'tienda' (Catálogo con filtros laterales)
  const [currentView, setCurrentView] = useState<'inicio' | 'tienda'>('inicio');

  // Estados de búsqueda y filtros
  const [topSearch, setTopSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'novedades' | 'precio-asc' | 'precio-desc' | 'puntos'>('novedades');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Reproductor oficial Nivalo Music: NewJeans - Super Shy
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [musicDuration, setMusicDuration] = useState(155);

  const formatMusicTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch((err) => {
        console.warn('Audio play error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setMusicProgress(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setMusicDuration(audioRef.current.duration);
      }
    }
  };

  // Modales
  const [selectedProductQuickView, setSelectedProductQuickView] = useState<Producto | null>(null);
  const [showSheinModal, setShowSheinModal] = useState(false);
  const [showCustomOrderModal, setShowCustomOrderModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNivaPointsModal, setShowNivaPointsModal] = useState(false);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaText, setIdeaText] = useState('');
  const [ideaSubmitted, setIdeaSubmitted] = useState(false);
  const [showNivieBotModal, setShowNivieBotModal] = useState(false);

  // Modal de checkout directo con Yape / Plin desde el carrito
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutNombre, setCheckoutNombre] = useState('');
  const [checkoutTelefono, setCheckoutTelefono] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const handleOpenCheckout = () => {
    if (user) {
      setCheckoutNombre(profile?.nombres || user.email?.split('@')[0] || '');
      setCheckoutTelefono(profile?.telefono || '');
    }
    setCheckoutError('');
    setShowCheckoutModal(true);
  };

  const handleConfirmDirectPayment = () => {
    if (!checkoutNombre.trim()) {
      setCheckoutError('Por favor ingresa tu nombre o usuario.');
      return;
    }
    if (!checkoutTelefono.trim() || checkoutTelefono.trim().length < 8) {
      setCheckoutError('Ingresa un número de celular/WhatsApp válido (mínimo 8 dígitos).');
      return;
    }
    if (cart.length === 0) {
      setCheckoutError('Tu bolsa kawaii está vacía.');
      return;
    }

    setIsProcessingCheckout(true);
    setCheckoutError('');

    const detalles: DetallePedido[] = cart.map((item, idx) => ({
      id: `DET-${Date.now()}-${idx}`,
      productoId: item.producto.id,
      productoNombre: item.producto.nombre,
      productoImagen: item.producto.imagen,
      precioUnitario: item.producto.precio,
      cantidad: item.cantidad,
      subtotal: item.producto.precio * item.cantidad,
    }));

    const res = createOrder({
      clienteNombre: checkoutNombre.trim(),
      clienteTelefono: checkoutTelefono.trim(),
      canal: 'WhatsApp',
      detalles,
      costoEnvio: cartShippingCost,
    });

    setIsProcessingCheckout(false);

    if (res.success && res.pedido) {
      clearCart();
      setIsCartOpen(false);
      setShowCheckoutModal(false);
      // Redirigir directamente a la pantalla de pago seguro con código QR de Yape
      window.location.hash = `#/pago/${res.pedido.id.replace('PED-', '')}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCheckoutError(res.error || 'Ocurrió un error al generar tu pedido.');
    }
  };

  // Lista de categorías para filtros y explorador
  const CATEGORIES = [
    'Ropa',
    'Accesorios',
    'Maquillaje',
    'Sanrio',
    'K-pop',
    'Anime',
    'Papelería',
    'Hogar',
    'Tecnología',
    'Mochilas y Bolsos',
  ];

  // Categorías destacadas con fotos para la sección "¿Qué estás buscando hoy?"
  const EXPLORER_CATEGORIES = [
    {
      id: 'Papelería',
      name: 'Papelería',
      image: getAssetUrl('prod_memopads.jpg'),
      desc: 'Libretas, stickers, washi tapes',
    },
    {
      id: 'Ropa',
      name: 'Ropa',
      image: getAssetUrl('prod_vestido.jpg'),
      desc: 'Moda coreana, faldas, vestidos',
    },
    {
      id: 'Maquillaje',
      name: 'Maquillaje',
      image: getAssetUrl('prod_paleta.jpg'),
      desc: 'Lip tints, sombras, rubores',
    },
    {
      id: 'Accesorios',
      name: 'Accesorios',
      image: getAssetUrl('prod_lazo.jpg'),
      desc: 'Lazos, ganchitos, scrunchies',
    },
    {
      id: 'Accesorios',
      name: 'Keychains & Trinkets',
      image: getAssetUrl('prod_tostada.jpg'),
      desc: 'Peluches, phone straps, dijes',
    },
    {
      id: 'Hogar',
      name: 'Snacks y dulces',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80',
      desc: 'Pocky, Pepero, mochis kawaii',
    },
  ];

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Única'];

  const COLORS = [
    '01#',
    '02#',
    '03#',
    '04#',
    '05#',
    '06#',
    'Azul',
    'Azul claro',
    'Beige',
    'Black',
    'Blanco',
    'Café',
    'Cream White',
    'Dark',
    'Dark Brown',
    'Degradado',
    'Dorado',
    'Estampado floral',
    'Gray brown',
    'Gris',
  ];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const toggleColor = (clr: string) => {
    setSelectedColors((prev) =>
      prev.includes(clr) ? prev.filter((c) => c !== clr) : [...prev, clr]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setTopSearch('');
    setCatalogSearch('');
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    topSearch.trim().length > 0 ||
    catalogSearch.trim().length > 0;

  // Filtrado de productos para el catálogo general
  const filteredProducts = useMemo(() => {
    const term = (catalogSearch || topSearch).toLowerCase().trim();

    const list = productos.filter((prod) => {
      const matchesText =
        !term ||
        prod.nombre.toLowerCase().includes(term) ||
        prod.categoria.toLowerCase().includes(term) ||
        (prod.marca && prod.marca.toLowerCase().includes(term)) ||
        (prod.descripcion && prod.descripcion.toLowerCase().includes(term));

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((cat) => {
          if (cat === 'Sanrio' && (prod.categoria === 'Sanrio' || prod.nombre.includes('Sanrio') || prod.marca === 'SANRIO')) return true;
          if (cat === 'Mochilas y Bolsos' && (prod.categoria.includes('Mochilas') || prod.nombre.includes('Bag') || prod.nombre.includes('Mochila'))) return true;
          if (cat === 'K-pop' && (prod.categoria.includes('K-pop') || prod.categoria.includes('Packs'))) return true;
          if (cat === 'Hogar' && (prod.categoria.includes('Hogar') || prod.categoria.includes('Decoración') || prod.categoria.includes('Snacks'))) return true;
          return prod.categoria.toLowerCase() === cat.toLowerCase();
        });

      const matchesSize =
        selectedSizes.length === 0 ||
        (prod.talla && selectedSizes.includes(prod.talla)) ||
        (!prod.talla && selectedSizes.includes('Única'));

      const matchesColor =
        selectedColors.length === 0 ||
        (prod.color && selectedColors.includes(prod.color));

      return matchesText && matchesCategory && matchesSize && matchesColor;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'precio-asc') return a.precio - b.precio;
      if (sortBy === 'precio-desc') return b.precio - a.precio;
      if (sortBy === 'puntos') return (b.puntos || 0) - (a.puntos || 0);
      return 0;
    });
  }, [productos, topSearch, catalogSearch, selectedCategories, selectedSizes, selectedColors, sortBy]);

  // Secciones limpias y seleccionadas para la Pantalla Principal (Inicio)
  const masVendidosHome = useMemo(() => {
    // 4 productos estrella que más se venden
    return productos
      .filter((p) => p.badge === 'TOP' || p.esFavorito || ['PROD-12', 'PROD-13', 'PROD-15', 'PROD-39'].includes(p.id))
      .slice(0, 4);
  }, [productos]);

  const ofertasHome = useMemo(() => {
    // 4 productos con ofertas y descuentos destacados
    return productos
      .filter((p) => p.esOferta || p.badge === 'OFERTA' || p.descuento || ['PROD-28', 'PROD-31', 'PROD-02', 'PROD-33'].includes(p.id))
      .slice(0, 4);
  }, [productos]);

  const totalCartItems = cart.reduce((acc, curr) => acc + curr.cantidad, 0);

  // Mensaje de WhatsApp para pedido
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

  // Renderizador unificado de Card de Producto (Rosa Pastel Suave)
  const renderProductCard = (prod: Producto) => {
    const isWish = wishlist.includes(prod.id);
    const inCart = cart.find((item) => item.producto.id === prod.id);

    return (
      <div
        key={prod.id}
        className="bg-white rounded-[22px] border border-[#FCE1ED] overflow-hidden shadow-[0_4px_16px_rgba(244,167,193,0.14)] hover:shadow-[0_12px_28px_rgba(244,167,193,0.26)] hover:border-[#F4A7C1] transition-all duration-300 flex flex-col group relative"
      >
        {/* Imagen */}
        <div className="aspect-square relative overflow-hidden bg-[#FFF5F8] p-1.5">
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
              toggleWishlist(prod.id);
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
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setSelectedProductQuickView(prod)}
              className="flex-1 py-1.5 bg-white/95 backdrop-blur-xs hover:bg-[#FFF0F6] text-[11px] font-semibold text-[#543D4E] hover:text-[#E2678D] rounded-xl shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#FCE1ED]"
            >
              <Eye size={12} />
              <span>Ver</span>
            </button>
            <button
              onClick={() => addToCart(prod)}
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
              onClick={() => setSelectedProductQuickView(prod)}
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
              onClick={() => addToCart(prod)}
              disabled={prod.stockDisponible <= 0}
              className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                inCart
                  ? 'bg-[#FFF0F6] text-[#E2678D] border border-[#FCDCE7]'
                  : 'text-[#E2678D] hover:bg-[#FFF0F6]'
              }`}
            >
              {inCart ? (
                <>
                  <Check size={12} />
                  <span>({inCart.cantidad})</span>
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

  return (
    <div className="min-h-screen bg-[#FFF5F8] text-[#4A3B4E] font-['Poppins',sans-serif] selection:bg-[#FCDCE7] selection:text-[#C74872]">
      {/* Reproductor de audio persistente global: NewJeans - Super Shy (canción completa) */}
      <audio
        ref={audioRef}
        src={getAssetUrl('super_shy.mp3')}
        loop
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlayingMusic(true)}
        onPause={() => setIsPlayingMusic(false)}
      />

      {/* 1. TOP ANNOUNCEMENT BAR (Ancho completo, mensaje central y enlaces al extremo derecho) */}
      <div className="bg-gradient-to-r from-[#FFF0F6] via-[#FFEAF2] to-[#FFF0F6] border-b border-[#FCDCE7] text-[11px] py-1.5 px-3 sm:px-6 text-[#A85B77] w-full">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Espaciador invisible para centrado matemático en desktop */}
          <div className="hidden lg:flex flex-1" />

          {/* Mensaje principal centrado */}
          <div className="flex items-center justify-center gap-2 text-center shrink-0">
            <span>🌸</span>
            <span>
              ¡Envíos a todo el Perú por <strong>Olva Courier & Shalom</strong>! Regalito sorpresa en todas tus compras kawaii ✨
            </span>
          </div>

          {/* Enlaces de acceso al extremo derecho */}
          <div className="flex items-center justify-center md:justify-end gap-3 shrink-0 lg:flex-1 w-full md:w-auto">
            <button
              onClick={() => {
                window.location.hash = '#/tracking';
              }}
              className="font-bold text-[#002F6C] hover:text-[#E30613] flex items-center gap-1 cursor-pointer transition-colors"
              title="Rastrear pedido con Olva Courier"
            >
              <span>🚚 Rastrear Pedido (Olva)</span>
            </button>
            <span className="opacity-30">•</span>
            <button
              onClick={() => setShowSheinModal(true)}
              className="hover:text-[#D4547B] transition-colors cursor-pointer"
            >
              🎀 Pedidos Shein
            </button>
            <span className="opacity-30">•</span>
            <button
              onClick={() => setShowCustomOrderModal(true)}
              className="hover:text-[#D4547B] transition-colors cursor-pointer"
            >
              ✈️ Importaciones
            </button>
            <span className="opacity-30">•</span>
            <button
              onClick={() => {
                window.location.hash = isAdmin ? '#/admin' : '#/admin/login';
              }}
              className="font-bold text-[#7E5E6E] hover:text-[#DE6978] flex items-center gap-1 cursor-pointer transition-colors"
              title="Portal de Acceso Administrativo Seguro"
            >
              <Shield size={12} className="text-[#DE6978]" />
              <span>{isAdmin ? 'Panel Admin 🛡️' : 'Acceso Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="sticky top-0 z-40 bg-[#FFF7FA]/95 backdrop-blur-md border-b border-[#FCE1ED] shadow-[0_2px_12px_rgba(244,167,193,0.12)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
          {/* Logo */}
          <div
            onClick={() => {
              setCurrentView('inicio');
              clearAllFilters();
            }}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
          >
            <NivaloCatMascot className="w-10 h-10 group-hover:scale-105 transition-transform drop-shadow-xs" />
            <div className="flex items-center">
              <span className="font-display font-extrabold text-2xl tracking-tight text-[#E2678D]">
                NIVALO
              </span>
              <span className="font-display font-extrabold text-2xl tracking-tight text-[#F4A7C1] ml-1.5">
                STORE
              </span>
              <span className="text-sm ml-1 animate-pulse">💖</span>
            </div>
          </div>

          {/* Buscador superior */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative flex items-center">
              <Search size={17} className="absolute left-4 text-[#BA8D9E]" />
              <input
                type="text"
                placeholder="Buscar productos... (ropa, papelería, llaveros, maquillaje)"
                value={topSearch}
                onChange={(e) => {
                  setTopSearch(e.target.value);
                  if (currentView !== 'tienda') setCurrentView('tienda');
                }}
                className="w-full bg-[#FFF0F6] border border-[#FCDCE7] rounded-full py-2.5 pl-11 pr-10 text-xs text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#F4A7C1] focus:ring-2 focus:ring-[#F4A7C1]/30 transition-all shadow-inner"
              />
              {topSearch && (
                <button
                  onClick={() => setTopSearch('')}
                  className="absolute right-3.5 text-[#BA8D9E] hover:text-[#4A3B4E] p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Iconos de acción */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => {
                if (user) {
                  window.location.hash = '#/mi-cuenta';
                } else {
                  window.location.hash = '#/login';
                }
              }}
              className="p-1.5 text-[#7E5E6E] hover:text-[#E2678D] hover:bg-[#FFF0F6] rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
              title={user ? `Mi Cuenta (${profile?.nombres || user.email})` : 'Iniciar Sesión / Registrarse'}
            >
              {user ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F4A7C1] to-[#C9B6F2] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-pink-200">
                  {profile?.nombres?.charAt(0).toUpperCase() || 'U'}
                </div>
              ) : (
                <div className="p-1">
                  <User size={20} strokeWidth={1.8} />
                </div>
              )}
              {user && (
                <span className="text-xs font-semibold text-[#4A3B4E] hidden md:inline max-w-[100px] truncate">
                  {profile?.nombres || 'Mi Cuenta'}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentView('tienda');
                setCatalogSearch('');
                setTopSearch('');
              }}
              className="p-2 text-[#7E5E6E] hover:text-[#E2678D] hover:bg-[#FFF0F6] rounded-full transition-colors relative cursor-pointer"
              title="Lista de Deseos"
            >
              <Heart
                size={20}
                strokeWidth={1.8}
                className={wishlist.length > 0 ? 'fill-[#F4A7C1] text-[#F4A7C1]' : ''}
              />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F4A7C1] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#7E5E6E] hover:text-[#E2678D] hover:bg-[#FFF0F6] rounded-full transition-colors relative cursor-pointer"
              title="Bolsa de Compras"
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#F4A7C1] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {totalCartItems}
              </span>
            </button>
          </div>
        </div>

        {/* 3. SUBNAV HORIZONTAL (Conmutador Inicio vs Tienda) */}
        <nav className="border-t border-[#FCE1ED] bg-[#FFF7FA] py-2">
          <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-[#7E5E6E]">
            {/* Botón Inicio: Ahora va a la pantalla principal scrollable */}
            <button
              onClick={() => {
                setCurrentView('inicio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                currentView === 'inicio'
                  ? 'bg-[#F4A7C1] text-white font-bold shadow-xs'
                  : 'hover:text-[#E2678D] hover:bg-[#FFF0F6]'
              }`}
            >
              Inicio
            </button>

            {/* Botón Tienda: Conmuta al catálogo completo con filtros laterales */}
            <div className="relative group">
              <button
                onClick={() => {
                  setCurrentView('tienda');
                  clearAllFilters();
                }}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  currentView === 'tienda'
                    ? 'bg-[#F4A7C1] text-white font-bold shadow-xs'
                    : 'hover:text-[#E2678D] hover:bg-[#FFF0F6]'
                }`}
              >
                <span>Tienda</span>
                <ChevronDown size={13} className="opacity-70" />
              </button>
              {/* Dropdown de categorías */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white rounded-2xl border border-[#FCDCE7] shadow-kawaii p-2 hidden group-hover:block z-50">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCurrentView('tienda');
                      setSelectedCategories([cat]);
                      setCatalogSearch('');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#5D4251] hover:bg-[#FFF0F6] hover:text-[#E2678D] rounded-xl transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (currentView === 'inicio') {
                  const el = document.getElementById('seccion-mas-vendidos');
                  el?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setCurrentView('inicio');
                  setTimeout(() => {
                    document.getElementById('seccion-mas-vendidos')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="hover:text-[#E2678D] transition-colors cursor-pointer"
            >
              Más Vendidos 👑
            </button>

            <button
              onClick={() => {
                if (currentView === 'inicio') {
                  const el = document.getElementById('seccion-ofertas');
                  el?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setCurrentView('inicio');
                  setTimeout(() => {
                    document.getElementById('seccion-ofertas')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="hover:text-[#E2678D] transition-colors cursor-pointer"
            >
              Ofertas 🎀
            </button>

            <button
              onClick={() => {
                if (currentView === 'inicio') {
                  const el = document.getElementById('seccion-categorias');
                  el?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setCurrentView('inicio');
                  setTimeout(() => {
                    document.getElementById('seccion-categorias')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="hover:text-[#E2678D] transition-colors cursor-pointer"
            >
              Colecciones
            </button>

            <button
              onClick={() => setShowNivaPointsModal(true)}
              className="flex items-center gap-1 hover:text-[#E2678D] transition-colors cursor-pointer text-[#E2678D] font-semibold"
            >
              <span>Nivalo 💖</span>
              <ChevronDown size={13} className="opacity-70" />
            </button>
          </div>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* VISTA 1: PANTALLA PRINCIPAL (INICIO) CON SCROLL COMPLETO HASTA EL FOOTER  */}
      {/* ========================================================================= */}
      {currentView === 'inicio' && (
        <div className="space-y-12 pb-16 animate-in fade-in duration-300">
          {/* 1. HERO SECTION (Exacto a Imagen 1) */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-8 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Columna Izquierda: Titulares y Botones */}
              <div className="lg:col-span-5 space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F6] border border-[#FCDCE7] text-xs font-semibold text-[#E2678D]">
                  <span>✨ 🎀 Ropa • Papelería • K-pop • Lifestyle</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#4A3B4E] leading-[1.1] tracking-tight">
                  Todo lo que te <br />
                  <span className="text-[#E2678D] relative inline-block">
                    encanta,
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" fill="none">
                      <path d="M2 8C30 2 70 2 98 8" stroke="#F4A7C1" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>{' '}
                  en un solo lugar{' '}
                  <span className="text-[#F4A7C1] inline-block animate-bounce">★</span>
                </h1>

                <p className="text-[#8E7C94] text-sm sm:text-base leading-relaxed max-w-md">
                  Descubre ropa, maquillaje, accesorios, papelería, K-pop y mucho más.
                  ¡Encuentra tus nuevos favoritos importados con amor! ✨
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setCurrentView('tienda');
                      clearAllFilters();
                    }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-[#F4A7C1] to-[#EE8EAF] hover:from-[#EE8EAF] hover:to-[#E0799E] text-white font-semibold text-sm shadow-kawaii-hover flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Comprar ahora</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={() => {
                      document.getElementById('seccion-ofertas')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3 rounded-full bg-white hover:bg-[#FFF0F6] border border-[#FCDCE7] text-[#4A3B4E] font-medium text-sm transition-all shadow-xs cursor-pointer"
                  >
                    Ver ofertas 🎀
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Bento Collage Shein & Importaciones */}
              <div className="lg:col-span-7 space-y-4">
                <div
                  onClick={() => setShowCustomOrderModal(true)}
                  className="bg-gradient-to-r from-[#FFF5F8] to-[#FFF0F6] border border-[#FCDCE7] rounded-3xl p-5 shadow-kawaii-hover relative overflow-hidden cursor-pointer group text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#F4A7C1] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Pedidos Personalizados
                    </span>
                    <div className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded-full text-[11px] font-bold text-[#E2678D] border border-[#FCDCE7]">
                      <span>+1000 clientes felices</span>
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg sm:text-xl text-[#4A3B4E] group-hover:text-[#E2678D] transition-colors">
                    ¿Buscas algo exclusivo de Corea o Japón?
                  </h3>
                  <p className="text-xs text-[#8E7C94] mt-1 leading-relaxed">
                    PEDIDOS PERSONALIZADOS DIRECTOS DESDE ASIA. ¡NOSOTROS LO IMPORTAMOS POR TI CON GARANTÍA!
                  </p>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <img src={getAssetUrl('prod_memopads.jpg')} alt="Sanrio" className="h-16 w-full object-cover rounded-xl border border-[#FCDCE7]" />
                    <img src={getAssetUrl('prod_tostada.jpg')} alt="Plush" className="h-16 w-full object-cover rounded-xl border border-[#FCDCE7]" />
                    <img src={getAssetUrl('prod_paleta.jpg')} alt="Makeup" className="h-16 w-full object-cover rounded-xl border border-[#FCDCE7]" />
                    <img src={getAssetUrl('prod_lazo.jpg')} alt="Ribbon" className="h-16 w-full object-cover rounded-xl border border-[#FCDCE7]" />
                  </div>
                </div>

                <div
                  onClick={() => setShowSheinModal(true)}
                  className="bg-gradient-to-r from-[#FFF0F6] to-[#FFEAF2] border border-[#FCDCE7] rounded-3xl p-4 shadow-kawaii-hover flex items-center justify-between gap-4 cursor-pointer text-left"
                >
                  <div className="space-y-1">
                    <span className="bg-[#E2678D] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Pedidos Grupales Shein
                    </span>
                    <h4 className="font-display font-bold text-base text-[#4A3B4E]">
                      Participa y ahorra los S/ 50 de envío internacional 🛍️
                    </h4>
                    <p className="text-xs text-[#8E7C94]">Cierre todos los domingos 11:59 PM</p>
                  </div>
                  <button className="px-4 py-2 rounded-2xl bg-white text-[#E2678D] border border-[#F4A7C1] text-xs font-bold shadow-xs whitespace-nowrap">
                    Unirme al grupo →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. VALUE PROPS (4 Pastillas de Confianza) */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-white border border-[#FCDCE7] shadow-xs flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#4A3B4E]">Envíos a todo Perú</h4>
                  <p className="text-[10px] text-[#8E7C94]">Olva Courier & Shalom</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#FCDCE7] shadow-xs flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center shrink-0">
                  <Gift size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#4A3B4E]">Sorpresitas en tus pedidos</h4>
                  <p className="text-[10px] text-[#8E7C94]">Stickers y dulces de regalo</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#FCDCE7] shadow-xs flex items-center gap-3 text-left cursor-pointer" onClick={() => setShowNivaPointsModal(true)}>
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#4A3B4E]">Gana NivaPuntos</h4>
                  <p className="text-[10px] text-[#8E7C94]">Canjea por regalos kawaii</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#FCDCE7] shadow-xs flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#4A3B4E]">Compra fácil y segura</h4>
                  <p className="text-[10px] text-[#8E7C94]">Yape, Plin y tarjetas</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. SECCIÓN: "¿QUÉ ESTÁS BUSCANDO HOY?" (Categorías circulares de Imagen 1) */}
          <section id="seccion-categorias" className="max-w-[1440px] mx-auto px-4 sm:px-8 text-center pt-4">
            <div className="space-y-1 mb-6">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#4A3B4E] flex items-center justify-center gap-2">
                <span>✨</span>
                <span>¿Qué estás buscando hoy?</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#8E7C94]">
                Encuentra todo lo que amas en un solo lugar
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {EXPLORER_CATEGORIES.map((cat, idx) => (
                <div
                  key={`${cat.id}-${idx}`}
                  onClick={() => {
                    setCurrentView('tienda');
                    setSelectedCategories([cat.id]);
                    setCatalogSearch('');
                  }}
                  className="group rounded-3xl p-2.5 bg-white border border-[#FCE1ED] hover:border-[#F4A7C1] shadow-xs hover:shadow-kawaii transition-all duration-300 cursor-pointer text-center relative overflow-hidden"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden mb-2 bg-[#FFF0F6] relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center p-2">
                      <span className="text-xs font-bold text-white drop-shadow-sm">
                        {cat.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#8E7C94] truncate px-1">{cat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. SECCIÓN: LO QUE MÁS SE VENDE (Best Sellers Destacados) */}
          <section id="seccion-mas-vendidos" className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-4">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#FCE1ED]">
              <div className="text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF0F6] text-[#DE6978] text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>👑 Top Ventas</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#4A3B4E] flex items-center gap-2">
                  <span>Lo que más se vende</span>
                  <span className="text-sm font-normal text-[#8E7C94] hidden sm:inline">• Los favoritos de la comunidad</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setCurrentView('tienda');
                  clearAllFilters();
                }}
                className="text-xs font-semibold text-[#E2678D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver catálogo completo</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {masVendidosHome.map((prod) => renderProductCard(prod))}
            </div>
          </section>

          {/* 5. SECCIÓN: OFERTAS DESTACADAS (Precios Rebajados) */}
          <section id="seccion-ofertas" className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-4">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#FCE1ED]">
              <div className="text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF0F6] text-[#DE6978] text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span>🏷️ Descuentos Especiales</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#4A3B4E] flex items-center gap-2">
                  <span>Ofertas Imperdibles</span>
                  <span className="text-sm font-normal text-[#8E7C94] hidden sm:inline">• Hasta agotar stock</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setCurrentView('tienda');
                  setSortBy('precio-asc');
                }}
                className="text-xs font-semibold text-[#E2678D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas las ofertas</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ofertasHome.map((prod) => renderProductCard(prod))}
            </div>
          </section>

          {/* 6. BANNER DESTACADO: EXPLORAR TODO EL CATÁLOGO */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-2">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FFF5F8] via-[#FFF0F6] to-[#FCEBF2] border border-[#FCDCE7] flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left shadow-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#DE6978]">
                  ✨ Catálogo Completo Nivalo Store
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#4A3B4E]">
                  ¿Buscas más cositas lindas? 💖
                </h3>
                <p className="text-xs text-[#8E7C94] max-w-xl">
                  Tenemos más de 30 productos organizados por Sanrio, K-pop, Papelería, Ropa, Maquillaje y Hogar esperando por ti.
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentView('tienda');
                  clearAllFilters();
                }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] hover:opacity-95 text-white text-xs font-bold shadow-kawaii flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <ShoppingBag size={15} />
                <span>Explorar todo el catálogo</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </section>

          {/* 7. WIDGETS INTERACTIVOS: REPRODUCTOR NEWJEANS SUPER SHY Y WHATSAPP */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-4 space-y-4">
            {/* Widget Oficial Nivalo Music: NewJeans - Super Shy */}
            <div className="bg-gradient-to-r from-[#FFF0F6] via-[#FFEAF2] to-[#FFF0F6] border border-[#FCDCE7] rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-left relative overflow-hidden">
              {/* Adorno superior sutil */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DE6978] via-[#F4A7C1] to-[#C9B6F2]" />

              <div className="flex items-center gap-3.5 w-full md:w-auto">
                {/* Carátula del Single Super Shy de NewJeans */}
                <div className="relative group shrink-0">
                  <img
                    src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/63/e5/e2/63e5e2e4-829b-924d-a1dc-8058a1d69bd4/196922462702_Cover.jpg/120x120bb.jpg"
                    alt="NewJeans - Super Shy"
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-[#FCDCE7]"
                  />
                  {isPlayingMusic && (
                    <div className="absolute inset-0 bg-black/25 rounded-2xl flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-3" />
                        <span className="w-1 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-4" />
                        <span className="w-1 bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite] h-2" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] uppercase font-bold text-white px-2 py-0.5 rounded-full bg-[#E2678D] tracking-wider">
                      🎧 Nivalo Soundtrack
                    </span>
                    <span className="text-[10px] text-[#8E7C94] font-medium hidden sm:inline">
                      K-Pop Vibes (Canción Completa)
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-[#4A3B4E] truncate flex items-center gap-2">
                    <span>Super Shy</span>
                    <span className="text-xs font-normal text-[#8E7C94]">— NewJeans (뉴진스)</span>
                  </h4>
                  <p className="text-xs text-[#8E7C94] flex items-center gap-1.5">
                    {isPlayingMusic ? (
                      <span className="text-[#DE6978] font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#DE6978] animate-ping" />
                        Reproduciendo ahora mientras compras ✨
                      </span>
                    ) : (
                      <span>Dale play para escuchar música continua mientras recorres la tienda 🎶</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Controles de Reproducción */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {/* Barra de progreso */}
                <div className="hidden sm:flex flex-col items-end gap-1 w-32">
                  <div className="w-full bg-pink-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#DE6978] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${(musicProgress / (musicDuration || 155)) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#BAA0AC] font-mono">
                    {formatMusicTime(musicProgress)} / {formatMusicTime(musicDuration || 155)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleMusic}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] hover:opacity-95 text-white text-xs font-bold shadow-kawaii flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  {isPlayingMusic ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isPlayingMusic ? 'Pausar Música' : 'Escuchar "Super Shy"'}</span>
                </button>
              </div>
            </div>

            {/* Widget 2: Canal de WhatsApp */}
            <div className="bg-white border border-[#FCDCE7] rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E8F8EE] text-[#25D366] flex items-center justify-center shadow-xs shrink-0">
                  <WhatsAppIcon size={22} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-[#4A3B4E]">
                    📲 Únete a nuestro canal de WhatsApp
                  </h4>
                  <p className="text-xs text-[#8E7C94]">
                    Entérate primero de novedades, preventas de Sanrio, promociones y sorteos mensuales 💖 ✨
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/51998167789?text=Hola%20Nivalo%20Store!%20Quiero%20unirme%20al%20canal%20de%20novedades%20y%20ofertas%20kawaii%20🌸"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
              >
                <span>Seguir canal de WhatsApp</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Widget 3: Ideabox Feedback */}
            <div className="bg-gradient-to-r from-[#FFF5F8] to-[#FFF0F6] border border-[#FCDCE7] rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center shadow-xs border border-[#FCDCE7] shrink-0">
                  <Lightbulb size={22} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-[#4A3B4E]">
                    💖 Ayúdanos a hacer Nivalo aún más tú
                  </h4>
                  <p className="text-xs text-[#8E7C94]">
                    ¿Qué producto quieres que traigamos de Asia? ¿Qué mejorarías? ¡Te leemos siempre!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIdeaModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#F4A7C1] hover:bg-[#EE8EAF] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <span>💡 Déjanos tu idea</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </section>

          {/* 9. FOOTER COMPLETO (Exacto a Imagen 4 en Rosa Muted Suave) */}
          <footer className="mt-16 bg-[#574450] text-[#E9DFE4] pt-12 pb-8 text-left border-t border-[#FCDCE7]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-white/10 text-xs">
                {/* Columna Marca */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <NivaloCatMascot className="w-9 h-9" />
                    <span className="font-display font-extrabold text-xl text-white">NIVALO STORE</span>
                  </div>
                  <p className="text-[#D3C1CB] text-xs leading-relaxed max-w-sm">
                    Tu tienda de estilo de vida kawaii en Perú. Ropa, accesorios, maquillaje, K-pop, Sanrio, anime y mucho más con stock verificado 💕
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase text-[#F4A7C1] tracking-wider block mb-2">
                      SÍGUENOS
                    </span>
                    <div className="flex items-center gap-2.5">
                      <a href="https://instagram.com" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] transition-colors">
                        Instagram @nivalo_store
                      </a>
                      <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] transition-colors">
                        TikTok @nivalostore
                      </a>
                    </div>
                  </div>
                </div>

                {/* Columna Comprar */}
                <div className="space-y-2">
                  <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">COMPRAR</h5>
                  <ul className="space-y-1.5 text-[#D3C1CB]">
                    <li><button onClick={() => { setCurrentView('tienda'); clearAllFilters(); }} className="hover:text-white transition-colors cursor-pointer">Catálogo general</button></li>
                    <li><button onClick={() => { setCurrentView('inicio'); document.getElementById('seccion-mas-vendidos')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Más Vendidos</button></li>
                    <li><button onClick={() => { setCurrentView('inicio'); document.getElementById('seccion-ofertas')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Ofertas especiales</button></li>
                    <li><button onClick={() => { setCurrentView('inicio'); document.getElementById('seccion-categorias')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Colecciones</button></li>
                  </ul>
                </div>

                {/* Columna Ayuda */}
                <div className="space-y-2">
                  <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">AYUDA</h5>
                  <ul className="space-y-1.5 text-[#D3C1CB]">
                    <li><span className="hover:text-white transition-colors cursor-pointer">Centro de ayuda</span></li>
                    <li><span className="hover:text-white transition-colors cursor-pointer">Envíos Olva & Shalom</span></li>
                    <li><span className="hover:text-white transition-colors cursor-pointer">Cambios / devoluciones</span></li>
                    <li><a href="https://wa.me/51998167789" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Contacto directo (WhatsApp)</a></li>
                  </ul>
                </div>

                {/* Columna Contacto */}
                <div className="space-y-2">
                  <h5 className="font-bold text-white uppercase text-[11px] tracking-wider">CONTACTO</h5>
                  <ul className="space-y-1.5 text-[#D3C1CB]">
                    <li>✉️ nivalostore@gmail.com</li>
                    <li>📞 +51 998 167 789</li>
                    <li>📍 Lima, Perú (Envíos a nivel nacional)</li>
                    <li>💳 Yape • Plin • Visa • Mastercard</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#BAA0AC]">
                <p>© 2026 Nivalo Store. Todos los derechos reservados. 💖</p>
                <p>Hecho con 💕 en Perú para los NivaloLovers</p>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: CATÁLOGO COMPLETO CON FILTROS LATERALES Y 5 COLUMNAS             */}
      {/* ========================================================================= */}
      {currentView === 'tienda' && (
        <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 animate-in fade-in duration-300">
          {/* Título de sección */}
          <div className="mb-4 text-left flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-[#BA8D9E] uppercase">
                TIENDA
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#4A3B4E] tracking-tight mt-0.5 flex items-center gap-2">
                <span>Catálogo</span>
                <span className="text-xl">🌸</span>
              </h1>
            </div>

            <button
              onClick={() => {
                setCurrentView('inicio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FFF0F6] border border-[#FCDCE7] text-xs font-semibold text-[#E2678D] shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>← Volver a Inicio</span>
            </button>
          </div>

          {/* Buscador dentro del catálogo */}
          <div className="mb-6 relative">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-5 text-[#BA8D9E]" />
              <input
                type="text"
                placeholder="Buscar dentro del catálogo..."
                value={catalogSearch}
                onChange={(e) => {
                  setCatalogSearch(e.target.value);
                  setTopSearch('');
                }}
                className="w-full bg-[#FFF0F6] border border-[#FCDCE7] rounded-full py-3.5 pl-12 pr-10 text-xs sm:text-sm text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#F4A7C1] focus:ring-2 focus:ring-[#F4A7C1]/30 transition-all shadow-inner"
              />
              {catalogSearch && (
                <button
                  onClick={() => setCatalogSearch('')}
                  className="absolute right-4 text-[#BA8D9E] hover:text-[#4A3B4E] p-1 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Barra de conteo y ordenación */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#FCE1ED] gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-medium text-[#7E5E6E]">
                <strong className="text-[#4A3B4E] font-bold">
                  {hasActiveFilters ? filteredProducts.length : '314'}
                </strong>{' '}
                productos kawaii
              </span>

              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="md:hidden flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#FFF0F6] border border-[#FCDCE7] text-[#7E5E6E]"
              >
                <SlidersHorizontal size={13} />
                <span>Filtros</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="hidden sm:flex items-center gap-1 text-[11px] text-[#E2678D] hover:underline cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>

            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-[#FCDCE7] rounded-full py-1.5 pl-4 pr-9 text-xs text-[#5D4251] font-medium focus:outline-none focus:border-[#F4A7C1] shadow-xs cursor-pointer"
              >
                <option value="novedades">Novedades</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
                <option value="puntos">Más Puntos ✨</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 text-[#BA8D9E] pointer-events-none" />
            </div>
          </div>

          {/* CUERPO: FILTROS LATERALES + GRILLA DE 5 COLUMNAS */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Barra lateral */}
            <aside
              className={`w-full md:w-60 shrink-0 space-y-6 text-left ${
                mobileFiltersOpen ? 'block' : 'hidden md:block'
              }`}
            >
              <div>
                <h3 className="text-xs font-bold text-[#543D4E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span>Categoría</span>
                  <span className="text-[10px] text-[#F4A7C1]">🎀</span>
                </h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className="flex items-center gap-2.5 text-xs text-[#6F5262] hover:text-[#E2678D] cursor-pointer group select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-[#F4A7C1] border-[#F4A7C1] text-white shadow-xs'
                              : 'border-[#FCDCE7] bg-white group-hover:border-[#F4A7C1]'
                          }`}
                          onClick={() => toggleCategory(cat)}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span onClick={() => toggleCategory(cat)}>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#FCE1ED]">
                <h3 className="text-xs font-bold text-[#543D4E] uppercase tracking-wider mb-3">
                  Talla
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map((sz) => {
                    const isSelected = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#F4A7C1] text-white font-semibold shadow-xs'
                            : 'bg-white border border-[#FCDCE7] text-[#6F5262] hover:border-[#F4A7C1] hover:bg-[#FFF0F6]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#FCE1ED]">
                <h3 className="text-xs font-bold text-[#543D4E] uppercase tracking-wider mb-3">
                  Color
                </h3>
                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {COLORS.map((clr) => {
                    const isSelected = selectedColors.includes(clr);
                    return (
                      <button
                        key={clr}
                        onClick={() => toggleColor(clr)}
                        className={`px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#F4A7C1] text-white font-semibold shadow-xs'
                            : 'bg-white border border-[#FCDCE7] text-[#6F5262] hover:border-[#F4A7C1] hover:bg-[#FFF0F6]'
                        }`}
                      >
                        {clr}
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 rounded-2xl bg-[#FFF0F6] hover:bg-[#FFE5EF] text-[#E2678D] text-xs font-semibold border border-[#FCDCE7] transition-colors cursor-pointer"
                >
                  Restablecer todos los filtros
                </button>
              )}
            </aside>

            {/* Grilla de 5 columnas del catálogo */}
            <section className="flex-1 w-full">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#FCDCE7] p-12 text-center space-y-3 shadow-kawaii-sm">
                  <div className="text-4xl animate-bounce">🌸</div>
                  <h3 className="text-base font-bold text-[#4A3B4E]">
                    No se encontraron productos con estos filtros
                  </h3>
                  <p className="text-xs text-[#8E7C94] max-w-sm mx-auto">
                    Prueba seleccionando otras categorías o borra el término de búsqueda para ver más artículos kawaii.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F4A7C1] to-[#EE8EAF] hover:from-[#EE8EAF] hover:to-[#E0799E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Ver todo el catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {filteredProducts.map((prod) => renderProductCard(prod))}
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* ================= DRAWER SLIDE-OUT DEL CARRITO ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-[#FCDCE7] shadow-2xl flex flex-col text-left">
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
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] hover:text-[#4A3B4E] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Barra de envío gratis */}
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
                    <NivaloCatMascot className="w-16 h-16 opacity-85" />
                    <h4 className="font-bold text-sm text-[#4A3B4E]">Tu bolsa está vacía</h4>
                    <p className="text-xs text-[#8E7C94] max-w-xs">
                      Explora nuestro catálogo kawaii de papelería, maquillaje, peluches y ropa coreana.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
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
                              onClick={() => updateCartQuantity(item.producto.id, item.cantidad - 1)}
                              className="p-1 text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-bold text-[#4A3B4E]">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.producto.id, item.cantidad + 1)}
                              disabled={item.cantidad >= item.producto.stockDisponible}
                              className="p-1 text-[#8E7C94] hover:bg-[#FFF0F6] disabled:opacity-40 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.producto.id)}
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
                    onClick={handleOpenCheckout}
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

                  {isAdmin && (
                    <button
                      onClick={() => {
                        transferCartToP1();
                        setIsCartOpen(false);
                      }}
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
      )}

      {/* ================= MODAL VISTA RÁPIDA ================= */}
      {selectedProductQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#FCDCE7] shadow-2xl p-6 text-left relative overflow-hidden">
            <button
              onClick={() => setSelectedProductQuickView(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#FFF5F8] border border-[#FCDCE7]">
                <img
                  src={selectedProductQuickView.imagen}
                  alt={selectedProductQuickView.nombre}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-[#E2678D] uppercase tracking-wider">
                    {selectedProductQuickView.marca || selectedProductQuickView.categoria}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#4A3B4E] mt-0.5">
                    {selectedProductQuickView.nombre}
                  </h3>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#E2678D]">
                    S/ {selectedProductQuickView.precio.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#D17796] font-semibold">
                    +{selectedProductQuickView.puntos || Math.round(selectedProductQuickView.precio * 5)} pts ✨
                  </span>
                </div>

                <p className="text-xs text-[#8E7C94] leading-relaxed">
                  {selectedProductQuickView.descripcion ||
                    'Producto exclusivo importado directamente por Nivalo Store con stock físico verificado.'}
                </p>

                {selectedProductQuickView.medidas && (
                  <div className="text-xs text-[#6F5262]">
                    <span className="font-semibold">Medidas/Detalle:</span>{' '}
                    <span>{selectedProductQuickView.medidas}</span>
                  </div>
                )}

                <div className="pt-2">
                  <span className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-[#FFF0F6] text-[#E2678D] font-semibold border border-[#FCDCE7]">
                    ✓ Stock disponible en almacén: {selectedProductQuickView.stockDisponible}
                  </span>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProductQuickView);
                    setSelectedProductQuickView(null);
                  }}
                  disabled={selectedProductQuickView.stockDisponible <= 0}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#EE8EAF] hover:from-[#EE8EAF] hover:to-[#E0799E] text-white font-bold text-xs shadow-xs transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  Añadir a la bolsa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL PEDIDOS SHEIN ================= */}
      {showSheinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#FCDCE7] shadow-2xl p-6 text-left relative overflow-hidden">
            <button
              onClick={() => setShowSheinModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center text-2xl">
                🛍️
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#4A3B4E]">Pedidos Grupales Shein</h3>
                <p className="text-xs text-[#8E7C94]">Ahorra los costos de flete internacional</p>
              </div>
            </div>

            <img
              src={getAssetUrl('shein_banner.jpg')}
              alt="Shein Banner"
              className="w-full h-36 object-cover rounded-2xl mb-4 border border-[#FCDCE7]"
            />

            <div className="space-y-3 text-xs text-[#4A3B4E]">
              <div className="p-3 rounded-xl bg-[#FFF0F6] border border-[#FCDCE7]">
                <h4 className="font-bold text-[#E2678D] mb-1">¿Cómo unirte al grupo?</h4>
                <ol className="list-decimal list-inside space-y-1 text-[#8E7C94]">
                  <li>Elige tus prendas en la aplicación o página de Shein.</li>
                  <li>Envíanos los enlaces o capturas por WhatsApp.</li>
                  <li>Cotizamos al tipo de cambio oficial sin costos sorpresa.</li>
                  <li>Recibimos en almacén y despachamos a tu ciudad por Olva.</li>
                </ol>
              </div>

              <a
                href="https://wa.me/51998167789?text=Hola%20Nivalo%20Store!%20Quiero%20unirme%20al%20pedido%20grupal%20de%20Shein%20🛍️"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <WhatsAppIcon size={15} />
                <span>Unirme al grupo por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL IMPORTACIONES / PEDIDOS PERSONALIZADOS ================= */}
      {showCustomOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#FCDCE7] shadow-2xl p-6 text-left relative overflow-hidden">
            <button
              onClick={() => setShowCustomOrderModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center text-2xl">
                ✈️
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#4A3B4E]">Pedidos Personalizados</h3>
                <p className="text-xs text-[#8E7C94]">Importamos de Corea, Japón, EE. UU. y China</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#4A3B4E]">
              <p className="text-[#8E7C94] leading-relaxed">
                ¿Buscas un álbum K-pop, un peluche Sanrio oficial o papelería japonesa que no ves en el catálogo?
                ¡Nosotros lo compramos e importamos por ti con seguimiento garantizado!
              </p>

              <div className="p-3 rounded-xl bg-[#FFF8FA] border border-[#FCDCE7] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8E7C94]">Tiempo estimado de llegada:</span>
                  <p className="font-bold text-[#E2678D]">12 a 20 días hábiles</p>
                </div>
                <a
                  href="https://wa.me/51998167789?text=Hola%20Nivalo%20Store!%20Quisiera%20cotizar%20un%20artículo%20importado%20✈️"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#F4A7C1] hover:bg-[#EE8EAF] text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <WhatsAppIcon size={14} />
                  <span>Cotizar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL PERFIL USUARIO ================= */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-[#FCDCE7] shadow-2xl p-6 text-center relative overflow-hidden">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
            >
              <X size={18} />
            </button>

            <NivaloCatMascot className="w-16 h-16 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-[#4A3B4E]">
              {user ? (profile?.nombres || 'Cliente Nivalo') : 'Bienvenido a Nivalo Store'}
            </h3>
            <p className="text-xs text-[#8E7C94] mb-4">
              {user ? user.email : 'Inicia sesión para consultar tus pedidos'}
            </p>

            {user ? (
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    window.location.hash = '#/mi-cuenta';
                  }}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] text-white text-xs font-bold shadow-xs transition"
                >
                  Ir a Mi Cuenta y Pedidos
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      window.location.hash = '#/admin';
                    }}
                    className="w-full py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#742284] text-xs font-bold border border-purple-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Shield size={13} />
                    <span>Abrir Panel de Control Admin</span>
                  </button>
                )}
                <button
                  onClick={async () => {
                    await signOut();
                    setShowUserModal(false);
                  }}
                  className="w-full py-2 rounded-2xl bg-gray-50 hover:bg-gray-100 text-[#8E7C94] text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <LogOut size={13} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-2">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    window.location.hash = '#/login';
                  }}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] text-white text-xs font-bold shadow-xs transition"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    window.location.hash = '#/register';
                  }}
                  className="w-full py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#DE6978] text-xs font-bold transition"
                >
                  Crear Cuenta Nueva
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL PUNTOS NIVALO ================= */}
      {showNivaPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-[#FCDCE7] shadow-2xl p-6 text-center relative overflow-hidden">
            <button
              onClick={() => setShowNivaPointsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center mx-auto text-2xl mb-3">
              ✨
            </div>
            <h3 className="font-display font-bold text-lg text-[#4A3B4E]">Club de Puntos Nivalo</h3>
            <p className="text-xs text-[#8E7C94] mb-4 leading-relaxed">
              Por cada S/ 1.00 de compra acumulas 5 Puntos Nivalo para canjear por stickers, peluches o descuentos directos.
            </p>

            <div className="p-3 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-left space-y-2 mb-4">
              <div className="flex justify-between text-[#6F5262]">
                <span>100 pts</span>
                <strong>Sticker holográfico gratis</strong>
              </div>
              <div className="flex justify-between text-[#6F5262]">
                <span>300 pts</span>
                <strong>Cupón de S/ 15 de descuento</strong>
              </div>
              <div className="flex justify-between text-[#6F5262]">
                <span>600 pts</span>
                <strong>Envío gratis en cualquier pedido</strong>
              </div>
            </div>

            <button
              onClick={() => setShowNivaPointsModal(false)}
              className="w-full py-2.5 rounded-full bg-[#F4A7C1] hover:bg-[#EE8EAF] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              ¡Entendido! 🌸
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL DÉJANOS TU IDEA / FEEDBACK ================= */}
      {showIdeaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#FCDCE7] shadow-2xl p-6 text-left relative overflow-hidden">
            <button
              onClick={() => {
                setShowIdeaModal(false);
                setIdeaSubmitted(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0F6] text-[#E2678D] flex items-center justify-center">
                <Lightbulb size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#4A3B4E]">Buzón de Ideas Nivalo</h3>
                <p className="text-xs text-[#8E7C94]">¡Queremos saber qué te encantaría ver!</p>
              </div>
            </div>

            {ideaSubmitted ? (
              <div className="p-6 text-center space-y-3">
                <div className="text-4xl">💌 ✨</div>
                <h4 className="font-bold text-sm text-[#4A3B4E]">¡Muchas gracias por tu propuesta!</h4>
                <p className="text-xs text-[#8E7C94]">
                  Revisamos cada recomendación con el equipo de compras e importaciones en Asia.
                </p>
                <button
                  onClick={() => {
                    setShowIdeaModal(false);
                    setIdeaSubmitted(false);
                    setIdeaText('');
                  }}
                  className="px-5 py-2 rounded-full bg-[#F4A7C1] text-white text-xs font-semibold"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder="Escribe aquí tu recomendación: producto anime, grupo k-pop, accesorio o canción..."
                  rows={4}
                  className="w-full p-3 rounded-2xl border border-[#FCDCE7] bg-[#FFF8FA] text-xs text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#F4A7C1] focus:ring-2 focus:ring-[#F4A7C1]/30 resize-none"
                />
                <button
                  onClick={() => {
                    if (ideaText.trim()) setIdeaSubmitted(true);
                  }}
                  disabled={!ideaText.trim()}
                  className="w-full py-2.5 rounded-2xl bg-[#F4A7C1] hover:bg-[#EE8EAF] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Enviar sugerencia</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= REPRODUCTOR FLOTANTE PERSISTENTE EN TIENDA ================= */}
      {(isPlayingMusic || currentView === 'tienda') && (
        <div className="fixed bottom-5 left-5 z-40 bg-white/95 backdrop-blur-md border border-[#FCDCE7] rounded-full py-1.5 pl-2 pr-3 shadow-kawaii flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
          <div className="relative shrink-0">
            <img
              src="https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/63/e5/e2/63e5e2e4-829b-924d-a1dc-8058a1d69bd4/196922462702_Cover.jpg/120x120bb.jpg"
              alt="Super Shy"
              className="w-8 h-8 rounded-full object-cover border border-[#FCDCE7]"
            />
            {isPlayingMusic && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#E2678D] animate-ping" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-[#4A3B4E] leading-tight flex items-center gap-1">
              <span>Super Shy</span>
              <span className="text-[9px] text-[#E2678D] font-normal">뉴진스</span>
            </span>
            <span className="text-[9px] text-[#8E7C94] font-mono leading-tight">
              {formatMusicTime(musicProgress)} / {formatMusicTime(musicDuration || 155)}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleMusic}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] hover:opacity-95 text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform"
            title={isPlayingMusic ? 'Pausar música' : 'Reproducir Super Shy'}
          >
            {isPlayingMusic ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
        </div>
      )}

      {/* ================= BOTONES FLOTANTES: NIVIEBOT Y WHATSAPP ================= */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5 items-end">
        {/* Niviebot Pill */}
        <button
          onClick={() => setShowNivieBotModal(!showNivieBotModal)}
          className="px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md border border-[#FCDCE7] shadow-kawaii flex items-center gap-2 hover:bg-[#FFF0F6] transition-all cursor-pointer group"
        >
          <NivaloCatMascot className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-[#E2678D]">Niviebot 💖 💬</span>
        </button>

        {/* Floating WhatsApp Bubble */}
        <a
          href="https://wa.me/51998167789"
          target="_blank"
          rel="noreferrer"
          className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center shadow-lg transition-transform active:scale-90"
          title="Hablar por WhatsApp con Nivalo Store"
        >
          <WhatsAppIcon size={26} />
        </a>
      </div>

      {/* ================= MODAL DE CHECKOUT DIRECTO (DATOS PARA PAGO) ================= */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#FCDCE7] shadow-2xl p-6 text-left relative overflow-hidden space-y-4">
            {/* Franja superior kawaii */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#F4A7C1]" />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <h3 className="font-display font-bold text-base text-[#4A3B4E]">
                  Finalizar Compra Directa
                </h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#8E7C94]">
              Ingresa tus datos de contacto para emitir tu boleta con el <strong>código QR de Yape</strong> y reservar tu stock por 24 horas:
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
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FCDCE7] text-xs text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#F4A7C1] focus:ring-2 focus:ring-[#F4A7C1]/30 transition"
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
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FCDCE7] text-xs text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#F4A7C1] focus:ring-2 focus:ring-[#F4A7C1]/30 transition"
                />
                <span className="text-[10px] text-[#BAA0AC] block mt-1">
                  Te contactaremos aquí para coordinar la entrega por Olva Courier o Shalom.
                </span>
              </div>
            </div>

            {/* Lista de productos a comprar con fotos respectivas */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 border border-[#FCDCE7] rounded-2xl p-2.5 bg-[#FFFDFE]">
              <span className="text-[10px] uppercase font-bold text-[#8E7C94] tracking-wider block mb-1">
                Artículos en tu orden ({cart.reduce((a, c) => a + c.cantidad, 0)} items):
              </span>
              <div className="divide-y divide-[#FCE6F0]">
                {cart.map((item) => (
                  <div key={item.producto.id} className="py-1.5 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={getAssetUrl(item.producto.imagen)}
                        alt={item.producto.nombre}
                        className="w-10 h-10 rounded-xl object-cover border border-[#FCDCE7] shrink-0 bg-pink-50"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = getAssetUrl('prod_memopads.jpg');
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#4A3B4E] truncate">
                          {item.producto.nombre}
                        </p>
                        <p className="text-[10px] text-[#8E7C94]">
                          {item.cantidad} x S/ {item.producto.precio.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#742284] font-mono shrink-0">
                      S/ {(item.producto.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen express con cálculo exacto de subtotal, envío y total */}
            <div className="p-3.5 rounded-2xl bg-[#FFF0F6] border border-[#FCDCE7] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#8E7C94]">
                <span>Subtotal ({cart.reduce((a, c) => a + c.cantidad, 0)} items):</span>
                <span className="font-mono font-semibold text-[#4A3B4E]">S/ {cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#8E7C94] items-center">
                <span>Envío (Olva Courier / Shalom):</span>
                {cartSubtotal >= 80 ? (
                  <span className="text-[11px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Envío Gratis ✨
                  </span>
                ) : (
                  <span className="font-mono font-bold text-[#4A3B4E]">
                    S/ 15.00
                  </span>
                )}
              </div>
              {cartSubtotal < 80 && (
                <div className="text-[10px] text-[#E2678D] font-medium bg-white/80 p-2 rounded-xl border border-pink-100 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>¡Te faltan <strong>S/ {(80 - cartSubtotal).toFixed(2)}</strong> para que tu <strong>envío sea GRATIS</strong>!</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-[#FCDCE7]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8E7C94] block">
                    Total a Pagar
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-[#742284] font-mono">
                    S/ {cartTotal.toFixed(2)}
                  </span>
                </div>
                {cartSubtotal >= 80 && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Ahorraste S/ 15 🎉
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleConfirmDirectPayment}
              disabled={isProcessingCheckout}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#742284] via-[#631B72] to-[#50155E] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <img
                src={getAssetUrl('yape_logo.png')}
                alt="Yape"
                className="w-5 h-5 rounded-md object-contain bg-white p-0.5"
              />
              <span>
                {isProcessingCheckout
                  ? 'Generando tu boleta...'
                  : 'Ver Boleta y Código QR de Yape ➔'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Niviebot Chat Interactivo */}
      <NivieBotChat
        isOpen={showNivieBotModal}
        onClose={() => setShowNivieBotModal(false)}
        productos={productos}
        onOpenSheinModal={() => setShowSheinModal(true)}
        onOpenNivaPointsModal={() => setShowNivaPointsModal(true)}
        onAddToCart={addToCart}
      />
    </div>
  );
};
