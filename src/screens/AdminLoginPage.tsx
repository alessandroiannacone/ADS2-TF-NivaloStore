import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccess,
  onBackToStore,
}) => {
  const { signInWithEmail, signOut } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales administrativas inválidas.');
      return;
    }

    // Comprobación ESTRICTA de rol administrativo
    if (res.role !== 'ADMIN') {
      // Si el usuario es un cliente común, REVOCAR acceso y cerrar sesión de inmediato
      await signOut();
      setErrorMessage(
        'ACCESO DENEGADO: Esta cuenta está registrada como CLIENTE y no cuenta con privilegios de Administrador. Solo el personal autorizado de Nivalo Store puede acceder.'
      );
      return;
    }

    // Acceso permitido
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D2233] via-[#3B2C42] to-[#1F1824] text-white flex flex-col justify-center items-center p-4 font-['Poppins',sans-serif]">
      {/* Botón de retorno a la tienda */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <button
          onClick={onBackToStore}
          className="text-xs text-white/70 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Volver a la tienda</span>
        </button>
        <span className="text-[10px] text-white/40 font-mono">PORTAL DE SEGURIDAD</span>
      </div>

      <div className="w-full max-w-md bg-[#251D2B]/90 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Barra superior de acento */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DE6978] via-[#F4A7C1] to-[#C9B6F2]" />

        {/* Encabezado Administrativo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DE6978] to-[#9A7BB0] text-white flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            Portal de Administración
          </h2>
          <p className="text-xs text-white/60">
            Nivalo Store • Autenticación Segura mediante Supabase
          </p>
        </div>

        {/* Alerta de Error / Acceso Denegado */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <ShieldAlert size={18} className="shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-red-300">Autenticación Fallida</span>
              <span className="text-[11px] leading-relaxed block text-red-200">
                {errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-white/80 block mb-1 uppercase tracking-wider">
              Correo Electrónico de Administrador
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nivalostore.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:outline-none focus:border-[#F4A7C1] text-white placeholder-white/30 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/80 block mb-1 uppercase tracking-wider">
              Contraseña Administrativa
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:outline-none focus:border-[#F4A7C1] text-white placeholder-white/30 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#DE6978] via-[#E2678D] to-[#9A7BB0] hover:opacity-95 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verificando permisos...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Panel de Control</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Nota de seguridad al pie */}
        <div className="pt-2 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/40 leading-relaxed">
            Área restringida. Todos los accesos no autorizados son bloqueados por políticas RLS y registrados por auditoría en PostgreSQL.
          </p>
        </div>
      </div>
    </div>
  );
};