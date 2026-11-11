import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { DetallePedido, CanalVenta, Producto } from '../types';
import {
  Search,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export const P1RegisterOrder: React.FC = () => {
  const {
    productos,
    createOrder,
    setActiveScreen,
    setSelectedOrderId,
  } = useStore();

  // Campos de Cliente
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [canal, setCanal] = useState<CanalVenta>('WhatsApp');

  // Errores de validación en línea
  const [errors, setErrors] = useState<{
    clienteNombre?: string;
    clienteTelefono?: string;
    productos?: string;
    general?: string;
  }>({});

  // Búsqueda y selección de producto para agregar
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [cantidadInput, setCantidadInput] = useState<number>(1);
  const [catalogFilter, setCatalogFilter] = useState('');

  // Carrito / Detalle del pedido
  const [detalles, setDetalles] = useState<DetallePedido[]>([]);

  // Feedback tras guardar exitosamente
  const [savedOrderResult, setSavedOrderResult] = useState<{
    id: string;
    total: number;
    clienteNombre: string;
    vencimiento: string;
  } | null>(null);

  // Autocompletado de productos según búsqueda
  const matchingProducts = searchTerm.trim()
    ? productos.filter((p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Productos mostrados en el catálogo derecho
  const displayedCatalog = catalogFilter.trim()
    ? productos.filter((p) =>
        p.nombre.toLowerCase().includes(catalogFilter.toLowerCase()) ||
        p.categoria.toLowerCase().includes(catalogFilter.toLowerCase())
      )
    : productos;

  // Total del pedido en tiempo real
  const totalPedido = detalles.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalUnidades = detalles.reduce((acc, curr) => acc + curr.cantidad, 0);
  const envioCosto = totalPedido >= 80 || totalPedido === 0 ? 0 : 15;
  const totalConEnvio = totalPedido + envioCosto;

  // Manejar selección de producto
  const handleSelectProduct = (prod: Producto) => {
    setSelectedProduct(prod);
    setSearchTerm(prod.nombre);
    setCantidadInput(1);
    setErrors((prev) => ({ ...prev, productos: undefined }));
  };

  // Validación de cantidad frente a stock disponible
  const isQuantityValid =
    selectedProduct &&
    Number.isInteger(cantidadInput) &&
    cantidadInput > 0 &&
    cantidadInput <= selectedProduct.stockDisponible;

  // Agregar producto a la tabla
  const handleAddProduct = () => {
    if (!selectedProduct) {
      setErrors((prev) => ({ ...prev, productos: 'Selecciona un producto del catálogo o buscador.' }));
      return;
    }

    if (!Number.isInteger(cantidadInput) || cantidadInput <= 0) {
      setErrors((prev) => ({
        ...prev,
        productos: 'La cantidad debe ser un número entero mayor que cero.',
      }));
      return;
    }

    // Comprobar stock ya existente en el carrito
    const existingInCart = detalles.find((d) => d.productoId === selectedProduct.id);
    const currentQtyInCart = existingInCart ? existingInCart.cantidad : 0;
    const requestedTotal = currentQtyInCart + cantidadInput;

    if (requestedTotal > selectedProduct.stockDisponible) {
      setErrors((prev) => ({
        ...prev,
        productos: `Stock insuficiente. Stock disponible: ${selectedProduct.stockDisponible}. Ya tienes ${currentQtyInCart} en el pedido.`,
      }));
      return;
    }

    if (existingInCart) {
      // Actualizar cantidad
      setDetalles((prev) =>
        prev.map((d) =>
          d.productoId === selectedProduct.id
            ? {
                ...d,
                cantidad: d.cantidad + cantidadInput,
                subtotal: (d.cantidad + cantidadInput) * d.precioUnitario,
              }
            : d
        )
      );
    } else {
      // Agregar nuevo detalle
      const newDetalle: DetallePedido = {
        id: `DET-${Date.now()}`,
        productoId: selectedProduct.id,
        productoNombre: selectedProduct.nombre,
        productoImagen: selectedProduct.imagen,
        precioUnitario: selectedProduct.precio,
        cantidad: cantidadInput,
        subtotal: cantidadInput * selectedProduct.precio,
      };
      setDetalles((prev) => [...prev, newDetalle]);
    }

    // Resetear selector
    setSelectedProduct(null);
    setSearchTerm('');
    setCantidadInput(1);
    setErrors((prev) => ({ ...prev, productos: undefined }));
  };

  // Modificar cantidad en la tabla
  const handleUpdateQuantity = (productoId: string, delta: number) => {
    const prod = productos.find((p) => p.id === productoId);
    if (!prod) return;

    setDetalles((prev) =>
      prev
        .map((item) => {
          if (item.productoId === productoId) {
            const newQty = item.cantidad + delta;
            if (newQty <= 0) return null;
            if (newQty > prod.stockDisponible) {
              alert(`No puedes exceder el stock disponible (${prod.stockDisponible} unidades) para ${prod.nombre}.`);
              return item;
            }
            return {
              ...item,
              cantidad: newQty,
              subtotal: newQty * item.precioUnitario,
            };
          }
          return item;
        })
        .filter(Boolean) as DetallePedido[]
    );
  };

  const handleRemoveItem = (productoId: string) => {
    setDetalles((prev) => prev.filter((d) => d.productoId !== productoId));
  };

  // Guardar Pedido (CUS-01)
  const handleSaveOrder = () => {
    const newErrors: {
      clienteNombre?: string;
      clienteTelefono?: string;
      productos?: string;
    } = {};

    if (!clienteNombre.trim()) {
      newErrors.clienteNombre = 'Completa el nombre o usuario del cliente.';
    }
    if (!clienteTelefono.trim() || clienteTelefono.trim().length < 8) {
      newErrors.clienteTelefono = 'Ingresa un teléfono de contacto válido (mínimo 8 dígitos).';
    }
    if (detalles.length === 0) {
      newErrors.productos = 'Agrega al menos un producto al pedido antes de guardar.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = createOrder({
      clienteNombre,
      clienteTelefono,
      canal,
      detalles,
      costoEnvio: envioCosto,
    });

    if (result.success && result.pedido) {
      setSavedOrderResult({
        id: result.pedido.id,
        total: result.pedido.total,
        clienteNombre: result.pedido.cliente.nombreOIdentificador,
        vencimiento: result.pedido.fechaVencimientoReserva,
      });

      // Limpiar formulario
      setClienteNombre('');
      setClienteTelefono('');
      setDetalles([]);
      setSelectedProduct(null);
      setSearchTerm('');
      setErrors({});
    } else {
      setErrors({ general: result.error || 'Ocurrió un error al registrar el pedido.' });
    }
  };

  const handleResetForm = () => {
    if (confirm('¿Deseas limpiar todos los campos del pedido actual?')) {
      setClienteNombre('');
      setClienteTelefono('');
      setDetalles([]);
      setSelectedProduct(null);
      setSearchTerm('');
      setErrors({});
      setSavedOrderResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Título de la pantalla */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4A7C1]/30">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#343047] font-['Quicksand',sans-serif] m-0">
              Registrar Pedido
            </h2>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FFF0F6] text-[#F4A7C1] border border-[#F4A7C1]/40">
              Nueva Orden
            </span>
          </div>
          <p className="text-xs text-[#746E8B] m-0 mt-0.5">
            Registro de ventas por Instagram y WhatsApp con reserva automática de stock por 24 horas.
          </p>
        </div>

        <button
          onClick={handleResetForm}
          className="text-xs font-medium text-[#746E8B] hover:text-[#DE6978] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Limpiar formulario</span>
        </button>
      </div>

      {/* Banner de Éxito tras Guardar Pedido */}
      {savedOrderResult && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#2D9D78]/15 via-[#FFF0F6] to-[#F3EEFF] border border-[#2D9D78]/40 shadow-kawaii-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2D9D78] text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#343047]">
                  Pedido registrado correctamente. Stock reservado temporalmente durante 24 horas
                </h4>
                <p className="text-xs text-[#746E8B] mt-0.5">
                  Pedido <strong>{savedOrderResult.id}</strong> para <strong>{savedOrderResult.clienteNombre}</strong> por <strong>S/ {savedOrderResult.total.toFixed(2)}</strong>.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[#746E8B] mt-1">
                  <span className="flex items-center gap-1 text-[#E9B44C] font-semibold">
                    <Clock size={12} /> Estado: Pendiente de pago (24h de reserva activa)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setSavedOrderResult(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#746E8B] hover:bg-white transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setSelectedOrderId(savedOrderResult.id);
                  setActiveScreen('P2');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F4A7C1] hover:bg-[#F4A7C1]/90 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Generar cobro (P2)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid en 2 Columnas Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: Formulario, Agregar Producto y Detalle */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. Datos del Cliente */}
          <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#343047] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#FFF0F6] text-[#F4A7C1] flex items-center justify-center text-xs font-bold">
                  A
                </span>
                <span>Datos del Cliente</span>
              </h3>
              <span className="text-[11px] text-[#746E8B]">
                Campos con <span className="text-[#DE6978] font-bold">*</span> son obligatorios
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre o Red Social */}
              <div>
                <label className="block text-xs font-semibold text-[#343047] mb-1">
                  Nombre o usuario de red social <span className="text-[#DE6978]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ej. @sakura_peru o Valeria Mendoza"
                  value={clienteNombre}
                  onChange={(e) => {
                    setClienteNombre(e.target.value);
                    if (errors.clienteNombre) setErrors((prev) => ({ ...prev, clienteNombre: undefined }));
                  }}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none transition ${
                    errors.clienteNombre
                      ? 'border-[#DE6978] ring-1 ring-[#DE6978]/30'
                      : 'border-gray-200 focus:border-[#C9B6F2]'
                  }`}
                />
                {errors.clienteNombre && (
                  <p className="text-[11px] text-[#DE6978] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.clienteNombre}
                  </p>
                )}
              </div>

              {/* Teléfono de contacto */}
              <div>
                <label className="block text-xs font-semibold text-[#343047] mb-1">
                  Teléfono de contacto <span className="text-[#DE6978]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#746E8B] text-xs">
                    +51
                  </div>
                  <input
                    type="tel"
                    placeholder="998167789"
                    value={clienteTelefono}
                    onChange={(e) => {
                      setClienteTelefono(e.target.value);
                      if (errors.clienteTelefono) setErrors((prev) => ({ ...prev, clienteTelefono: undefined }));
                    }}
                    className={`w-full text-xs pl-10 pr-2.5 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none transition ${
                      errors.clienteTelefono
                        ? 'border-[#DE6978] ring-1 ring-[#DE6978]/30'
                        : 'border-gray-200 focus:border-[#C9B6F2]'
                    }`}
                  />
                </div>
                {errors.clienteTelefono && (
                  <p className="text-[11px] text-[#DE6978] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.clienteTelefono}
                  </p>
                )}
              </div>
            </div>

            {/* Canal de venta */}
            <div>
              <label className="block text-xs font-semibold text-[#343047] mb-1.5">
                Canal de venta:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCanal('WhatsApp')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    canal === 'WhatsApp'
                      ? 'bg-[#2D9D78]/10 border-[#2D9D78] text-[#2D9D78] font-bold shadow-xs'
                      : 'border-gray-200 text-[#746E8B] hover:bg-gray-50'
                  }`}
                >
                  <WhatsAppIcon size={14} className="text-[#2D9D78]" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCanal('Instagram')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    canal === 'Instagram'
                      ? 'bg-[#FFF0F6] border-[#F4A7C1] text-[#F4A7C1] font-bold shadow-xs'
                      : 'border-gray-200 text-[#746E8B] hover:bg-gray-50'
                  }`}
                >
                  <InstagramIcon size={14} className="text-[#F4A7C1]" />
                  <span>Instagram</span>
                </button>

              </div>
            </div>
          </div>

          {/* C. Agregar Producto */}
          <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#343047] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#F3EEFF] text-[#C9B6F2] flex items-center justify-center text-xs font-bold">
                  C
                </span>
                <span>Agregar Producto con Verificación de Stock</span>
              </h3>
            </div>

            <div className="space-y-3">
              {/* Buscador con Autocompletado */}
              <div className="relative">
                <label className="block text-xs font-semibold text-[#343047] mb-1">
                  Buscar producto en catálogo:
                </label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-3 text-[#746E8B]" />
                  <input
                    type="text"
                    placeholder="Escribe el nombre del producto (ej. Llavero, Peluche, Pack...)"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedProduct(null);
                    }}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#C9B6F2] transition"
                  />
                </div>

                {/* Dropdown de coincidencias de autocompletado */}
                {searchTerm.trim() && !selectedProduct && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-kawaii border border-[#C9B6F2]/40 z-30 max-h-56 overflow-y-auto p-1.5">
                    {matchingProducts.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[#746E8B]">
                        No se encontraron productos coincidentes en el catálogo
                      </div>
                    ) : (
                      matchingProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p)}
                          className="p-2 hover:bg-[#FFF0F6] rounded-xl flex items-center justify-between cursor-pointer transition text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-semibold text-[#343047]">{p.nombre}</div>
                              <div className="text-[10px] text-[#746E8B]">{p.categoria}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#F4A7C1] block">
                              S/ {p.precio.toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                                p.stockDisponible > 5
                                  ? 'bg-[#2D9D78]/10 text-[#2D9D78]'
                                  : p.stockDisponible > 0
                                  ? 'bg-[#E9B44C]/15 text-[#E9B44C]'
                                  : 'bg-[#DE6978]/10 text-[#DE6978]'
                              }`}
                            >
                              Stock: {p.stockDisponible} disp.
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Producto seleccionado para agregar */}
              {selectedProduct && (
                <div className="p-3 rounded-2xl bg-[#FFF0F6]/60 border border-[#F4A7C1]/40 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedProduct.imagen}
                      alt={selectedProduct.nombre}
                      className="w-10 h-10 rounded-xl object-cover border border-[#F4A7C1]/30"
                    />
                    <div>
                      <div className="font-bold text-[#343047]">{selectedProduct.nombre}</div>
                      <div className="text-[11px] text-[#746E8B]">
                        Precio: <strong className="text-[#F4A7C1]">S/ {selectedProduct.precio.toFixed(2)}</strong> •
                        Stock disponible actual: <strong className="text-[#2D9D78]">{selectedProduct.stockDisponible}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setSearchTerm('');
                    }}
                    className="text-[11px] text-[#746E8B] hover:text-[#DE6978] cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
              )}

              {/* Fila Cantidad y Botón Agregar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
                <div className="w-full sm:w-40">
                  <label className="block text-xs font-semibold text-[#343047] mb-1">
                    Cantidad:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct ? selectedProduct.stockDisponible : 99}
                    value={cantidadInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCantidadInput(val);
                      if (errors.productos) setErrors((prev) => ({ ...prev, productos: undefined }));
                    }}
                    className={`w-full text-xs font-semibold p-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none transition ${
                      selectedProduct && cantidadInput > selectedProduct.stockDisponible
                        ? 'border-[#DE6978] text-[#DE6978]'
                        : 'border-gray-200 focus:border-[#C9B6F2]'
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    disabled={!isQuantityValid}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isQuantityValid
                        ? 'bg-gradient-to-r from-[#F4A7C1] to-[#C9B6F2] text-white shadow-xs hover:opacity-95'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={15} />
                    <span>Agregar al pedido</span>
                  </button>
                </div>
              </div>

              {/* Mensaje de validación de cantidad / stock */}
              {selectedProduct && cantidadInput > selectedProduct.stockDisponible && (
                <p className="text-[11px] text-[#DE6978] font-medium flex items-center gap-1">
                  <ShieldAlert size={12} />
                  Stock insuficiente. Reduce la cantidad solicitada (Máximo: {selectedProduct.stockDisponible}).
                </p>
              )}
              {errors.productos && (
                <p className="text-[11px] text-[#DE6978] font-medium flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.productos}
                </p>
              )}
            </div>
          </div>

          {/* D. Detalle del Pedido (Tabla Dinámica) */}
          <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#343047] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#FFF0F6] text-[#F4A7C1] flex items-center justify-center text-xs font-bold">
                  D
                </span>
                <span>Detalle del Pedido ({detalles.length} productos agregados)</span>
              </h3>
            </div>

            {detalles.length === 0 ? (
              <div className="text-center py-8 text-[#746E8B] text-xs">
                <ShoppingBag size={28} className="mx-auto mb-2 text-[#C9B6F2]/60" />
                <p className="font-semibold text-[#343047]">El pedido está vacío</p>
                <p className="text-[11px] text-[#746E8B] mt-0.5">
                  Selecciona productos desde el catálogo para agregarlos aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[#746E8B] text-[11px] font-semibold">
                      <th className="py-2 px-1">Producto</th>
                      <th className="py-2 px-2 text-center">Cant.</th>
                      <th className="py-2 px-2 text-right">P. Unit.</th>
                      <th className="py-2 px-2 text-right">Subtotal</th>
                      <th className="py-2 px-1 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {detalles.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition">
                        <td className="py-2.5 px-1 font-medium text-[#343047]">
                          {item.productoNombre}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.productoId, -1)}
                              className="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 text-[#343047] flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-bold w-6 text-center text-[#343047]">
                              {item.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.productoId, 1)}
                              className="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 text-[#343047] flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#746E8B]">
                          S/ {item.precioUnitario.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-[#343047]">
                          S/ {item.subtotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productoId)}
                            className="p-1 rounded-lg hover:bg-[#FFF0F6] text-gray-400 hover:text-[#DE6978] transition cursor-pointer"
                            title="Eliminar producto del pedido"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Destacado con Desglose */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF0F6] to-[#F3EEFF] border border-[#F4A7C1]/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#746E8B]">
                <span>Subtotal ({totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'}):</span>
                <span className="font-mono font-bold text-[#343047]">S/ {totalPedido.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#746E8B]">
                <span>Envío (Olva / Shalom):</span>
                {envioCosto === 0 ? (
                  <span className="font-bold text-emerald-600 bg-white/80 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                    GRATIS ✨
                  </span>
                ) : (
                  <span className="font-mono font-bold text-[#DE6978]">
                    S/ 15.00
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#F4A7C1]/20">
                <span className="text-sm font-bold text-[#343047] font-['Quicksand',sans-serif]">
                  Total a Cobrar: <span className="text-[#DE6978] text-base font-extrabold font-mono">S/ {totalConEnvio.toFixed(2)}</span>
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#C9B6F2] border border-[#C9B6F2]/40 shadow-xs">
                  🌸 PEN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Vista previa del Catálogo y Resumen de Reserva */}
        <div className="lg:col-span-5 space-y-6">
          {/* B. Vista Previa del Catálogo */}
          <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#343047] flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#FFF0F6] text-[#F4A7C1] flex items-center justify-center text-xs font-bold">
                  B
                </span>
                <span>Catálogo Nivalo Store</span>
              </h3>
              <span className="text-[10px] text-[#746E8B]">
                Stock en tiempo real
              </span>
            </div>

            {/* Filtro rápido de catálogo */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-[#746E8B]" />
              <input
                type="text"
                placeholder="Filtrar catálogo..."
                value={catalogFilter}
                onChange={(e) => setCatalogFilter(e.target.value)}
                className="w-full text-xs pl-8 pr-2.5 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none text-[#343047]"
              />
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {displayedCatalog.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                const isOutOfStock = prod.stockDisponible <= 0;
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      if (!isOutOfStock) handleSelectProduct(prod);
                    }}
                    className={`group p-2 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#F4A7C1] bg-[#FFF0F6] shadow-xs'
                        : isOutOfStock
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200/80 hover:border-[#C9B6F2] hover:bg-[#F3EEFF]/40 cursor-pointer shadow-xs'
                    }`}
                  >
                    <div className="relative mb-1.5 overflow-hidden rounded-xl h-20 bg-gray-100">
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                        S/ {prod.precio.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#343047] line-clamp-1 leading-snug">
                        {prod.nombre}
                      </h4>
                      <p className="text-[10px] text-[#746E8B] line-clamp-1">{prod.categoria}</p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-gray-100 flex items-center justify-between text-[10px]">
                      <span
                        className={`font-semibold ${
                          prod.stockDisponible > 5
                            ? 'text-[#2D9D78]'
                            : prod.stockDisponible > 0
                            ? 'text-[#E9B44C]'
                            : 'text-[#DE6978]'
                        }`}
                      >
                        {prod.stockDisponible > 0 ? `${prod.stockDisponible} disp.` : 'Agotado'}
                      </span>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className={`p-1 rounded-lg transition ${
                          isSelected
                            ? 'bg-[#F4A7C1] text-white'
                            : 'bg-[#F3EEFF] text-[#C9B6F2] group-hover:bg-[#F4A7C1] group-hover:text-white'
                        }`}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estado de la Reserva Temporal & Guardar (E y F) */}
          <div className="bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-6 h-6 rounded-lg bg-[#E9B44C]/15 text-[#E9B44C] flex items-center justify-center text-xs font-bold">
                E
              </span>
              <h3 className="text-sm font-bold text-[#343047]">
                Reserva Temporal de Inventario (24h)
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF0F6]/80 border border-[#F4A7C1]/30 text-xs text-[#746E8B] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#343047] font-semibold">
                <Clock size={14} className="text-[#F4A7C1]" />
                <span>Reserva de Stock:</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Al presionar <strong>"Guardar pedido"</strong> se reservará el stock temporalmente por <strong>24 horas</strong>. El stock disponible disminuirá para evitar sobreventas en redes sociales hasta la confirmación del pago.
              </p>
            </div>

            {errors.general && (
              <div className="p-3 rounded-2xl bg-[#FFF0F6] border border-[#DE6978] text-[#DE6978] text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-[#746E8B] hover:bg-gray-100 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={detalles.length === 0}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  detalles.length > 0
                    ? 'bg-gradient-to-r from-[#F4A7C1] to-[#C9B6F2] text-white shadow-kawaii-sm hover:opacity-95'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
              >
                <Sparkles size={15} />
                <span>Guardar pedido</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
