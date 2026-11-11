import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Package,
  Plus,
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Sparkles,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { getAssetUrl } from '../data/mockData';

export const P5CatalogManagement: React.FC = () => {
  const { productos, addProduct, deleteProduct, setViewMode } = useStore();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Form State
  const [nombre, setNombre] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('Sanrio');
  const [marca, setMarca] = useState<string>('SANRIO');
  const [precio, setPrecio] = useState<string>('');
  const [stock, setStock] = useState<string>('20');
  const [imagenUrl, setImagenUrl] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [medidas, setMedidas] = useState<string>('Estándar');
  const [color, setColor] = useState<string>('Pastel');
  const [talla, setTalla] = useState<string>('Única');
  const [badge, setBadge] = useState<string>('NUEVO');
  const [esOferta, setEsOferta] = useState<boolean>(false);
  const [esFavorito, setEsFavorito] = useState<boolean>(true);
  const [esRecomendado, setEsRecomendado] = useState<boolean>(false);

  const [formError, setFormError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Categorías predefinidas
  const CATEGORIES = [
    'Sanrio',
    'Papelería',
    'Maquillaje',
    'Accesorios',
    'Ropa',
    'K-pop',
    'Anime',
    'Hogar',
    'Tecnología',
    'Mochilas y Bolsos',
  ];

  // Imágenes de muestra rápidas
  const SAMPLE_IMAGES = [
    { label: 'Sanrio Pastel', url: './prod_memopads.jpg' },
    { label: 'Portaminas 3D', url: './prod_portaminas.jpg' },
    { label: 'Paleta Glitter', url: './prod_paleta.jpg' },
    { label: 'Peluche Tostada', url: './prod_tostada.jpg' },
    { label: 'Lazo Coquette', url: './prod_lazo.jpg' },
    { label: 'Trébol Charm', url: './llavero_trebol.jpg' },
    { label: 'Vestido Fairy', url: './prod_vestido.jpg' },
    { label: 'Washi Tapes', url: 'https://colourbiranga.com/cdn/shop/files/rn-image_picker_lib_temp_58ec5e58-a219-4c36-8b10-eee5d8badcdb.jpg?v=1769869736' },
  ];

  // Manejar subida de archivo local y convertir a Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setFormError('La imagen es muy pesada (máx. 2.5 MB). Intenta con una imagen más pequeña o usa una URL.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImagenUrl(event.target.result);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar nuevo producto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nombre.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setFormError('Ingresa un precio válido mayor a 0 soles.');
      return;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Ingresa una cantidad de stock válida.');
      return;
    }

    if (!imagenUrl.trim()) {
      setFormError('Debes colocar una URL de foto o subir una imagen para el producto.');
      return;
    }

    setIsSaving(true);

    const res = await addProduct({
      nombre: nombre.trim(),
      categoria,
      marca,
      precio: precioNum,
      stock: stockNum,
      imagen: imagenUrl.trim(),
      descripcion: descripcion.trim() || 'Nuevo producto importado exclusivo de Nivalo Store.',
      medidas,
      color,
      talla,
      badge,
      esOferta,
      esFavorito,
      esRecomendado,
    });

    setIsSaving(false);

    if (res.success) {
      // Limpiar formulario y cerrar modal
      setNombre('');
      setPrecio('');
      setStock('20');
      setImagenUrl('');
      setDescripcion('');
      setShowAddModal(false);
    } else {
      setFormError(res.error || 'Ocurrió un error al guardar el producto.');
    }
  };

  // Filtrado de productos en la lista
  const filteredProducts = productos.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'Todas' || prod.categoria.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      prod.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F4A7C1] to-[#C9B6F2] text-white flex items-center justify-center shadow-md">
            <Package size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#4A3B4E]">
                Gestión de Catálogo y Productos
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF0F6] text-[#DE6978] border border-[#FCDCE7]">
                {productos.length} items activos
              </span>
            </div>
            <p className="text-xs text-[#8E7C94]">
              Agrega nuevos artículos con fotos, gestiona stocks y sincroniza con la base de datos en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setViewMode('storefront');
              window.location.hash = '#/';
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-[#FFF8FA] hover:bg-[#FFF0F6] border border-[#FCDCE7] text-[#4A3B4E] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ExternalLink size={14} />
            <span>Ver Tienda</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#EE8EAF] hover:from-[#EE8EAF] hover:to-[#E0799E] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-kawaii transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>+ Nuevo Producto Kawaii</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-3xl shadow-kawaii-sm border border-[#C9B6F2]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7C94]" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] placeholder:text-[#BAA0AC] focus:outline-none focus:border-[#F4A7C1] transition"
          />
        </div>

        {/* Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              selectedCategory === 'Todas'
                ? 'bg-[#F4A7C1] text-white shadow-xs'
                : 'bg-[#FFF8FA] text-[#8E7C94] hover:bg-[#FFF0F6]'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.slice(0, 6).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#F4A7C1] text-white shadow-xs'
                  : 'bg-[#FFF8FA] text-[#8E7C94] hover:bg-[#FFF0F6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-3xl border border-[#FCDCE7] p-3.5 shadow-kawaii-sm flex flex-col justify-between group hover:shadow-kawaii transition-all"
          >
            <div>
              {/* Foto del Producto */}
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 relative mb-3">
                <img
                  src={getAssetUrl(prod.imagen)}
                  alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = getAssetUrl('prod_memopads.jpg');
                  }}
                />
                {prod.badge && (
                  <span className="absolute top-2 left-2 bg-[#F4A7C1] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {prod.badge}
                  </span>
                )}
                <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-lg">
                  {prod.id}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9B6F2] block">
                  {prod.categoria} • {prod.marca}
                </span>
                <h4 className="text-xs font-bold text-[#4A3B4E] line-clamp-2 leading-tight">
                  {prod.nombre}
                </h4>
              </div>
            </div>

            {/* Precios y Stock */}
            <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#8E7C94] block">Precio:</span>
                  <span className="text-sm font-extrabold text-[#742284] font-mono">
                    S/ {prod.precio.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8E7C94] block">Stock Disp.:</span>
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                      prod.stockDisponible > 5
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {prod.stockDisponible} unids
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-1.5 pt-1 text-[11px]">
                <span className="text-[10px] text-[#8E7C94]">
                  Total Físico: <strong>{prod.stockTotalFisico}</strong>
                </span>
                <button
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de eliminar "${prod.nombre}" del catálogo?`)) {
                      deleteProduct(prod.id);
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  title="Eliminar producto"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: AGREGAR NUEVO PRODUCTO ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#FCDCE7] shadow-2xl p-6 text-left relative overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Franja superior kawaii */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F4A7C1] to-[#C9B6F2]" />

            {/* Cabecera del modal */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-bold text-base text-[#4A3B4E]">
                    Agregar Nuevo Producto al Catálogo
                  </h3>
                  <p className="text-[11px] text-[#8E7C94]">
                    Registra los detalles y la foto oficial para la tienda y base de datos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-[#8E7C94] hover:bg-[#FFF0F6] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sección Foto del Producto con Previsualización */}
              <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] space-y-3">
                <label className="block text-xs font-bold text-[#4A3B4E] uppercase tracking-wider">
                  Foto del Producto <span className="text-[#DE6978]">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* Previsualización en vivo */}
                  <div className="w-full aspect-square rounded-2xl bg-white border-2 border-dashed border-[#F4A7C1]/50 overflow-hidden flex items-center justify-center relative shadow-xs">
                    {imagenUrl ? (
                      <img
                        src={getAssetUrl(imagenUrl)}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = getAssetUrl('prod_memopads.jpg');
                        }}
                      />
                    ) : (
                      <div className="text-center p-3 text-[#8E7C94]">
                        <ImageIcon size={28} className="mx-auto mb-1 text-[#F4A7C1]" />
                        <span className="text-[10px] block">Sin foto seleccionada</span>
                      </div>
                    )}
                  </div>

                  {/* Inputs de Imagen */}
                  <div className="sm:col-span-2 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#746E8B] block mb-1">
                        Opción 1: Pegar URL de Imagen Web (HTTPS)
                      </span>
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/foto-kawaii.jpg"
                        value={imagenUrl}
                        onChange={(e) => setImagenUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#746E8B] block mb-1">
                        Opción 2: Subir archivo desde tu dispositivo
                      </span>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-pink-50 border border-[#FCDCE7] text-xs text-[#E2678D] font-semibold cursor-pointer transition">
                        <Upload size={14} />
                        <span>Examinar imagen local</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Fotos de muestra con 1 click */}
                    <div>
                      <span className="text-[10px] font-bold text-[#746E8B] block mb-1">
                        O elige una foto kawaii de muestra:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {SAMPLE_IMAGES.map((sample) => (
                          <button
                            key={sample.label}
                            type="button"
                            onClick={() => setImagenUrl(sample.url)}
                            className="px-2 py-0.5 rounded-lg bg-white border border-pink-100 text-[10px] text-[#4A3B4E] hover:bg-pink-100 transition cursor-pointer"
                          >
                            🌸 {sample.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nombre y Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                    Nombre del Producto <span className="text-[#DE6978]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Set de Washi Tapes Sanrio Foil Gold"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                    Categoría <span className="text-[#DE6978]">*</span>
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                    Precio (S/ Soles) <span className="text-[#DE6978]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    placeholder="Ej. 24.00"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] font-mono font-bold focus:outline-none focus:border-[#F4A7C1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                    Stock Inicial <span className="text-[#DE6978]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej. 20"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] font-mono focus:outline-none focus:border-[#F4A7C1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                    Insignia / Badge
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                  >
                    <option value="NUEVO">NUEVO</option>
                    <option value="OFERTA">OFERTA</option>
                    <option value="TOP">TOP</option>
                    <option value="ÚLTIMAS">ÚLTIMAS</option>
                  </select>
                </div>
              </div>

              {/* Marca, Medidas, Color y Talla */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. SANRIO"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                    Medidas
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 10cm x 15cm"
                    value={medidas}
                    onChange={(e) => setMedidas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Rosa pastel"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                    Talla
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Única o M"
                    value={talla}
                    onChange={(e) => setTalla(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A3B4E] uppercase tracking-wider mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre materiales, uso y estilo..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl bg-[#FFF8FA] border border-[#FCDCE7] text-xs text-[#4A3B4E] focus:outline-none focus:border-[#F4A7C1]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4A3B4E]">
                  <input
                    type="checkbox"
                    checked={esOferta}
                    onChange={(e) => setEsOferta(e.target.checked)}
                    className="rounded text-[#F4A7C1] focus:ring-[#F4A7C1]"
                  />
                  <span>¿Es Oferta?</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4A3B4E]">
                  <input
                    type="checkbox"
                    checked={esFavorito}
                    onChange={(e) => setEsFavorito(e.target.checked)}
                    className="rounded text-[#F4A7C1] focus:ring-[#F4A7C1]"
                  />
                  <span>¿Destacar en Favoritos?</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4A3B4E]">
                  <input
                    type="checkbox"
                    checked={esRecomendado}
                    onChange={(e) => setEsRecomendado(e.target.checked)}
                    className="rounded text-[#F4A7C1] focus:ring-[#F4A7C1]"
                  />
                  <span>¿Recomendado?</span>
                </label>
              </div>

              {/* Botón de Enviar */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#4A3B4E] text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#EE8EAF] hover:from-[#EE8EAF] hover:to-[#E0799E] text-white font-bold text-xs shadow-kawaii flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <span>Guardando en base de datos...</span>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Guardar Producto en Catálogo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
