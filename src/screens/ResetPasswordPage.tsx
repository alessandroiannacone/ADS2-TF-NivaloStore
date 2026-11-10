import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsSubmitting(true);
    const res = await updatePassword(password);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMessage(res.error || 'No se pudo actualizar la contraseña.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] via-[#FFF9FB] to-white flex flex-col justify-center items-center p-4 font-['Poppins',sans-serif]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-kawaii border border-[#FCDCE7] p-6 sm:p-8 space-y-5 relative overflow-hidden">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F6] text-2xl flex items-center justify-center mx-auto shadow-inner">
            🔑
          </div>
          <h2 className="text-xl font-bold font-['Fredoka',sans-serif] text-[#4A3B4E]">
            Restablecer Contraseña
          </h2>
          <p className="text-xs text-[#8E7C94]">
            Ingresa tu nueva contraseña para acceder a tu cuenta de Nivalo Store.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#4A3B4E]">
              ¡Contraseña Actualizada con Éxito!
            </h4>
            <p className="text-xs text-[#8E7C94]">
              Tu nueva contraseña ya se encuentra activa. Puedes iniciar sesión ahora.
            </p>
            <a
              href="#/login"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl bg-[#F4A7C1] hover:bg-[#DE6978] text-white text-xs font-bold transition shadow-md"
            >
              <span>Ir al Inicio de Sesión</span>
              <ArrowRight size={14} />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                Nueva Contraseña <span className="text-[#DE6978]">*</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3 text-[#BAA0AC]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full text-xs pl-8 pr-9 py-2.5 rounded-xl border border-pink-100 bg-pink-50/30 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#BAA0AC] hover:text-[#4A3B4E]"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                Confirmar Nueva Contraseña <span className="text-[#DE6978]">*</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3 text-[#BAA0AC]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full text-xs pl-8 pr-9 py-2.5 rounded-xl border border-pink-100 bg-pink-50/30 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-[#BAA0AC] hover:text-[#4A3B4E]"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] hover:opacity-95 text-white font-bold text-xs shadow-kawaii-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <span>Guardar Nueva Contraseña</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};