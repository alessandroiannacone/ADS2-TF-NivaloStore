import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchOrdersForUser } from '../services/supabaseService';
import type { Pedido } from '../types';
import {
  User,
  ShoppingBag,
  LogOut,
  Save,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Shield,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { getAssetUrl } from '../data/mockData';

export const CustomerAccountPage: React.FC<{ onBackToStore?: () => void }> = ({
  onBackToStore,
}) => {
  const { user, profile, updateProfile, signOut, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Formulario de edición de perfil
  const [nombres, setNombres] = useState(profile?.nombres || '');
  const [apellidos, setApellidos] = useState(profile?.apellidos || '');
  const [telefono, setTelefono] = useState(profile?.telefono || '');
  const [direccion, setDireccion] = useState(profile?.direccion || '');
  const [ciudad, setCiudad] = useState(profile?.ciudad || 'Lima');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setNombres(profile.nombres);
      setApellidos(profile.apellidos);
      setTelefono(profile.telefono || '');
      setDireccion(profile.direccion || '');
      setCiudad(profile.ciudad || 'Lima');
    }
  }, [profile]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      const data = await fetchOrdersForUser(user.id);
      setOrders(data || []);
      setLoadingOrders(false);
    };

    loadOrders();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    setSavingProfile(true);

    const res = await updateProfile({
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      ciudad: ciudad.trim(),
    });

    setSavingProfile(false);
    if (res.success) {
      setProfileSuccessMsg('¡Tus datos han sido actualizados correctamente!');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } else {
      setProfileErrorMsg(res.error || 'No se pudo guardar la información.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.hash = '#/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] via-[#FFF9FB] to-white font-['Poppins',sans-serif] pb-12">
      {/* Header Superior */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#FCDCE7] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBackToStore ? (
              <button
                onClick={onBackToStore}
                className="p-1.5 rounded-xl hover:bg-pink-50 text-[#8E7C94] hover:text-[#4A3B4E] transition flex items-center gap-1 text-xs"
              >
                <ArrowLeft size={16} />
                <span>Volver a la tienda</span>
              </button>
            ) : (
              <a
                href="#/"
                className="flex items-center gap-2 text-xs font-bold text-[#F4A7C1]"
              >
                <span>🌸 Nivalo Store</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#4A3B4E] hidden sm:inline">
              ¡Hola, {profile?.nombres || 'Cliente'}! ✨
            </span>
            <button
              onClick={handleSignOut}
              className="py-1.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#DE6978] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner de Bienvenida y Perfil */}
        <div className="bg-white p-6 rounded-3xl shadow-kawaii border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F4A7C1] to-[#C9B6F2] text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {profile?.nombres?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#4A3B4E]">
                  {profile?.nombres} {profile?.apellidos}
                </h2>
                <span className="text-[10px] bg-pink-100 text-[#DE6978] font-bold px-2 py-0.5 rounded-full border border-pink-200">
                  {role === 'ADMIN' ? '🛡️ Administrador' : '🛍️ Cliente'}
                </span>
              </div>
              <p className="text-xs text-[#8E7C94] mt-0.5 flex items-center gap-1">
                <Mail size={12} /> {user?.email}
              </p>
            </div>
          </div>

          {/* Navegación por pestañas */}
          <div className="flex items-center gap-2 bg-pink-50/60 p-1.5 rounded-2xl border border-pink-100">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white text-[#DE6978] shadow-xs'
                  : 'text-[#8E7C94] hover:text-[#4A3B4E]'
              }`}
            >
              <ShoppingBag size={14} />
              <span>Mis Pedidos ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-[#DE6978] shadow-xs'
                  : 'text-[#8E7C94] hover:text-[#4A3B4E]'
              }`}
            >
              <User size={14} />
              <span>Mis Datos</span>
            </button>
          </div>
        </div>

        {/* PESTAÑA: MIS PEDIDOS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#4A3B4E] flex items-center gap-2">
                <Package size={16} className="text-[#F4A7C1]" />
                <span>Historial de tus Pedidos</span>
              </h3>
              <span className="text-xs text-[#8E7C94]">
                Solo tú tienes acceso a tus pedidos
              </span>
            </div>

            {loadingOrders ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm text-center border border-pink-100 space-y-2">
                <div className="w-6 h-6 border-2 border-[#F4A7C1] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#8E7C94]">Cargando tus pedidos desde Supabase...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-pink-100 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-pink-50 text-3xl flex items-center justify-center mx-auto">
                  🛍️
                </div>
                <h4 className="text-sm font-bold text-[#4A3B4E]">
                  Aún no tienes pedidos registrados
                </h4>
                <p className="text-xs text-[#8E7C94] max-w-sm mx-auto">
                  Explora nuestro catálogo kawaii y realiza tu primer pedido con reserva exclusiva por 24 horas.
                </p>
                <a
                  href="#/"
                  className="inline-block py-2.5 px-5 rounded-2xl bg-[#F4A7C1] hover:bg-[#DE6978] text-white text-xs font-bold shadow-md transition"
                >
                  Explorar la Tienda
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((pedido) => {
                  const isPending = pedido.estado === 'PENDIENTE_PAGO';
                  const isPaid = pedido.estado === 'PAGADO';
                  const isCancelled = pedido.estado === 'CANCELADO';

                  return (
                    <div
                      key={pedido.id}
                      className="bg-white p-5 rounded-3xl shadow-sm border border-pink-100 space-y-3 hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs bg-pink-50 text-[#F4A7C1] px-2.5 py-1 rounded-xl border border-pink-100">
                            {pedido.id}
                          </span>
                          <span className="text-xs text-[#8E7C94]">
                            {new Date(pedido.fechaCreacion).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-700'
                                : isPending
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {isPaid && '✓ Pagado'}
                            {isPending && '⏳ Pendiente de Pago'}
                            {isCancelled && '✕ Cancelado'}
                          </span>

                          {isPending && (
                            <a
                              href={`#/pago/${pedido.id.replace('PED-', '')}`}
                              className="py-1 px-3 rounded-xl bg-gradient-to-r from-[#742284] to-[#50155E] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1"
                            >
                              <span>Pagar con Yape</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Lista de productos del pedido */}
                      <div className="divide-y divide-gray-50 text-xs">
                        {pedido.detalles.map((det) => (
                          <div key={det.id} className="py-2 flex items-center justify-between">
                            <span className="text-[#4A3B4E] font-medium">
                              {det.cantidad}x {det.productoNombre}
                            </span>
                            <span className="font-mono font-bold text-[#4A3B4E]">
                              S/ {det.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <span className="text-[#8E7C94]">Monto Total:</span>
                        <span className="text-sm font-extrabold text-[#DE6978]">
                          S/ {pedido.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: MIS DATOS */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#4A3B4E] flex items-center gap-2">
                <User size={16} className="text-[#F4A7C1]" />
                <span>Información Personal de tu Cuenta</span>
              </h3>
              <p className="text-xs text-[#8E7C94] mt-0.5">
                Mantén tus datos actualizados para agilizar tus envíos y compras.
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
                {profileErrorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-pink-100 bg-pink-50/20 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    required
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-pink-100 bg-pink-50/20 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                    Correo Electrónico (Solo Lectura)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={user?.email || ''}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[#8E7C94] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="998167789"
                    className="w-full text-xs p-2.5 rounded-xl border border-pink-100 bg-pink-50/20 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                    Dirección de Entrega
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Av. Los Jazmines 450, Dpto 301"
                    className="w-full text-xs p-2.5 rounded-xl border border-pink-100 bg-pink-50/20 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                    Ciudad / Distrito
                  </label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Lima"
                    className="w-full text-xs p-2.5 rounded-xl border border-pink-100 bg-pink-50/20 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                  />
                </div>
              </div>

              {/* Información de Rol y Seguridad */}
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-[#746E8B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[#9A7BB0]" />
                  <span>
                    Rol Asignado: <strong className="text-[#343047]">{role}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-[#9A7BB0] font-semibold">
                  Protegido por Supabase RLS
                </span>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] hover:opacity-95 text-white font-bold text-xs shadow-kawaii-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{savingProfile ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
