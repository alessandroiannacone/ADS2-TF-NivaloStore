import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';

interface CustomerAuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CustomerAuthPage: React.FC<CustomerAuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onCancel,
}) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPasswordForEmail,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');

  // Validaciones
  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validación de correo común
    if (!validateEmail(email)) {
      setErrorMessage('Por favor ingresa un correo electrónico válido (ejemplo: usuario@gmail.com).');
      return;
    }

    if (mode === 'login') {
      if (!password) {
        setErrorMessage('Ingresa tu contraseña.');
        return;
      }

      setIsSubmitting(true);
      const res = await signInWithEmail(email, password);
      setIsSubmitting(false);

      if (res.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.hash = '#/mi-cuenta';
        }
      } else {
        setErrorMessage(res.error || 'Credenciales incorrectas.');
      }
    } else if (mode === 'register') {
      if (!nombres.trim() || !apellidos.trim()) {
        setErrorMessage('Por favor completa tus nombres y apellidos.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden. Verifícalas cuidadosamente.');
        return;
      }

      setIsSubmitting(true);
      const res = await signUpWithEmail(email, password, {
        nombres,
        apellidos,
        telefono,
      });
      setIsSubmitting(false);

      if (res.success) {
        if (res.needsEmailVerification) {
          setSuccessMessage(
            '¡Registro completado! Hemos enviado un enlace de confirmación a tu correo electrónico. Por favor revísalo para activar tu cuenta.'
          );
        } else {
          setSuccessMessage('¡Cuenta creada con éxito! Bienvenido a Nivalo Store.');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else window.location.hash = '#/mi-cuenta';
          }, 1200);
        }
      } else {
        setErrorMessage(res.error || 'No se pudo completar el registro.');
      }
    } else if (mode === 'forgot') {
      setIsSubmitting(true);
      const res = await resetPasswordForEmail(email);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMessage(
          'Te hemos enviado un correo con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.'
        );
      } else {
        setErrorMessage(res.error || 'No se pudo enviar el correo de recuperación.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await signInWithGoogle();
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error || 'No se pudo conectar con Google.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] via-[#FFF9FB] to-white flex flex-col justify-center items-center p-4 font-['Poppins',sans-serif]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-kawaii border border-[#FCDCE7] p-6 sm:p-8 space-y-5 relative overflow-hidden">
        {/* Adorno estético superior */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F4A7C1] via-[#C9B6F2] to-[#F4A7C1]" />

        {/* Botón de volver */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-[#8E7C94] hover:text-[#DE6978] flex items-center gap-1 transition"
          >
            <ArrowLeft size={14} />
            <span>Volver a la tienda</span>
          </button>
        )}

        {/* Encabezado */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F6] text-2xl flex items-center justify-center mx-auto shadow-inner">
            🌸
          </div>
          <h2 className="text-xl font-bold font-['Fredoka',sans-serif] text-[#4A3B4E]">
            {mode === 'login' && '¡Hola de nuevo! ✨'}
            {mode === 'register' && 'Crea tu Cuenta Kawaii 💖'}
            {mode === 'forgot' && 'Recuperar Contraseña 🔑'}
          </h2>
          <p className="text-xs text-[#8E7C94]">
            {mode === 'login' && 'Ingresa tus credenciales para ver tus pedidos y perfil.'}
            {mode === 'register' && 'Únete a Nivalo Store y gestiona tus pedidos fácilmente.'}
            {mode === 'forgot' && 'Ingresa tu correo y te enviaremos un enlace de recuperación.'}
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                  Nombres <span className="text-[#DE6978]">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-[#BAA0AC]" />
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Valeria"
                    className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-pink-100 bg-pink-50/30 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                  Apellidos <span className="text-[#DE6978]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Mendoza"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-pink-100 bg-pink-50/30 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                />
              </div>
            </div>
          )}

          {/* Correo Electrónico */}
          <div>
            <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
              Correo Electrónico <span className="text-[#DE6978]">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-[#BAA0AC]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@gmail.com"
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-pink-100 bg-pink-50/30 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
              />
            </div>
          </div>

          {/* Teléfono opcional en registro */}
          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                Celular / WhatsApp <span className="text-[10px] text-[#8E7C94]">(Opcional)</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-[#BAA0AC]" />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="998167789"
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-pink-100 bg-pink-50/30 focus:bg-white focus:outline-none focus:border-[#F4A7C1] text-[#4A3B4E]"
                />
              </div>
            </div>
          )}

          {/* Contraseña */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#4A3B4E]">
                  Contraseña <span className="text-[#DE6978]">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[10px] text-[#F4A7C1] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
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
          )}

          {/* Confirmación de contraseña */}
          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-bold text-[#4A3B4E] block mb-1">
                Confirmar Contraseña <span className="text-[#DE6978]">*</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3 text-[#BAA0AC]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
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
          )}

          {/* Botón Principal */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#F4A7C1] to-[#DE6978] hover:opacity-95 text-white font-bold text-xs shadow-kawaii-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Iniciar Sesión'}
                  {mode === 'register' && 'Crear mi Cuenta'}
                  {mode === 'forgot' && 'Enviar Enlace de Recuperación'}
                </span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Separador */}
        {mode !== 'forgot' && (
          <>
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-pink-100 w-full" />
              <span className="bg-white px-3 text-[10px] text-[#BAA0AC] uppercase font-bold tracking-wider">
                o continúa con
              </span>
            </div>

            {/* Botón de Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-[#4A3B4E] shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>
          </>
        )}

        {/* Cambiar de modo */}
        <div className="text-center pt-2 border-t border-pink-50 text-xs text-[#8E7C94]">
          {mode === 'login' && (
            <p>
              ¿No tienes una cuenta aún?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#DE6978] hover:underline cursor-pointer"
              >
                Regístrate aquí
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#DE6978] hover:underline cursor-pointer"
              >
                Inicia sesión
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="font-bold text-[#DE6978] hover:underline cursor-pointer"
            >
              Volver al inicio de sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};