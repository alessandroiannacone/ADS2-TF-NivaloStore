import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';
import { fetchUserProfile, updateUserProfileInSupabase } from '../services/supabaseService';

interface SignUpData {
  nombres: string;
  apellidos: string;
  telefono?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signUpWithEmail: (email: string, password: string, data: SignUpData) => Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Omit<UserProfile, 'id' | 'role' | 'email'>>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadUserProfile = async (currentUser: User): Promise<UserProfile | null> => {
    let p = await fetchUserProfile(currentUser.id);
    const meta = currentUser.user_metadata || {};
    const isAdminEmail = currentUser.email?.trim().toLowerCase() === 'alex1400ahjulio@gmail.com';

    if (!p) {
      // Si el perfil aún no se creó en la tabla (ej. primer login con Google OAuth o delay del trigger),
      // generamos un perfil completo a partir de la metadata de Google o registro
      const fullName = (meta.full_name || meta.name || '').trim();
      const nameParts = fullName ? fullName.split(' ') : [];
      const nombres = meta.nombres || (nameParts.length > 0 ? nameParts[0] : (currentUser.email ? currentUser.email.split('@')[0] : 'Cliente'));
      const apellidos = meta.apellidos || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

      p = {
        id: currentUser.id,
        email: currentUser.email || '',
        nombres: nombres,
        apellidos: apellidos,
        role: isAdminEmail ? 'ADMIN' : (meta.role === 'ADMIN' ? 'ADMIN' : 'CLIENTE'),
      };

      // Intentar persistir el perfil en la base de datos para sincronización futura
      if (supabase) {
        supabase.from('profiles').upsert({
          id: currentUser.id,
          email: currentUser.email || '',
          nombres: p.nombres,
          apellidos: p.apellidos,
          role: p.role,
        }).then(({ error }) => {
          if (error) console.warn('Aviso sincronización de perfil:', error.message);
        });
      }
    } else if (isAdminEmail && p.role !== 'ADMIN') {
      // Garantizar que la cuenta oficial de administrador tenga siempre el rol ADMIN
      p.role = 'ADMIN';
      if (supabase) {
        supabase.from('profiles').update({ role: 'ADMIN' }).eq('id', currentUser.id).then();
      }
    }

    setProfile(p);
    setRole(p.role);
    return p;
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Detectar si hay errores de OAuth en la URL al regresar
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''));
      const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');
      const errorCode = searchParams.get('error') || hashParams.get('error');

      if (errorDesc || errorCode) {
        const readable = errorDesc
          ? decodeURIComponent(errorDesc).replace(/\+/g, ' ')
          : errorCode;
        setAuthError(`Aviso de inicio de sesión: ${readable}`);
        // Limpiar parámetros de error de la barra de direcciones
        const cleanUrl = window.location.origin + window.location.pathname + '#/login';
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {
      console.warn('Error al leer parámetros de URL:', e);
    }

    // 1. Obtener sesión activa al cargar la aplicación
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      setSession(currentSession);
      if (currentSession?.user) {
        setUser(currentSession.user);
        await loadUserProfile(currentSession.user);
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setIsLoading(false);
    });

    // 2. Escuchar cambios de estado en Auth (Login, Logout, OAuth callback, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      if (newSession?.user) {
        setUser(newSession.user);
        const p = await loadUserProfile(newSession.user);

        // Si regresamos de un flujo de OAuth o hay código de autorización en la URL
        const hadOAuthPending = sessionStorage.getItem('nivalo_oauth_pending');
        const hasAuthParamsInUrl = window.location.search.includes('code=') || window.location.hash.includes('access_token=');

        if (hadOAuthPending || hasAuthParamsInUrl || event === 'SIGNED_IN') {
          sessionStorage.removeItem('nivalo_oauth_pending');

          // Limpiar el query param ?code=... de la URL para dejarla limpia
          if (window.location.search.includes('code=')) {
            const cleanUrl = window.location.origin + window.location.pathname + (window.location.hash || '');
            window.history.replaceState({}, document.title, cleanUrl);
          }

          // Redireccionar al usuario si se encuentra en la pantalla de login o raíz
          const currentHash = window.location.hash;
          if (!currentHash || currentHash === '#/' || currentHash === '#/login' || currentHash === '#/register') {
            if (p?.role === 'ADMIN' || newSession.user.email?.trim().toLowerCase() === 'alex1400ahjulio@gmail.com') {
              window.location.hash = '#/admin';
            } else {
              window.location.hash = '#/mi-cuenta';
            }
          }
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Iniciar Sesión con Correo y Contraseña
  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase no está configurado.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg = error.message.includes('Invalid login credentials')
          ? 'Correo electrónico o contraseña incorrectos.'
          : error.message;
        setAuthError(msg);
        return { success: false, error: msg };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const p = await loadUserProfile(data.user);
        return { success: true, role: p?.role || 'CLIENTE' };
      }

      return { success: false, error: 'No se pudo iniciar sesión.' };
    } catch (err: any) {
      const msg = err.message || 'Error inesperado al iniciar sesión.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Registro de Clientes
  const signUpWithEmail = async (email: string, password: string, data: SignUpData) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase no está configurado.' };
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombres: data.nombres.trim(),
            apellidos: data.apellidos.trim(),
            telefono: data.telefono?.trim() || '',
            role: 'CLIENTE', // Rol mandatorio inicial
          },
          emailRedirectTo: `${window.location.origin}${window.location.pathname}#/login`,
        },
      });

      if (error) {
        const msg = error.message.includes('User already registered')
          ? 'Ya existe una cuenta registrada con este correo electrónico.'
          : error.message;
        setAuthError(msg);
        return { success: false, error: msg };
      }

      const needsVerification = Boolean(
        authData.user &&
        (!authData.session || authData.user.identities?.length === 0)
      );

      // Si inició sesión automáticamente, cargar perfil
      if (authData.user && authData.session) {
        setUser(authData.user);
        setSession(authData.session);
        await loadUserProfile(authData.user);
      }

      return {
        success: true,
        needsEmailVerification: needsVerification,
      };
    } catch (err: any) {
      const msg = err.message || 'Error inesperado durante el registro.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Iniciar Sesión con Google OAuth
  const signInWithGoogle = async () => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase no está configurado.' };
    }

    try {
      sessionStorage.setItem('nivalo_oauth_pending', 'true');

      // Redirigir a la URL base limpia sin el fragmento #
      // Cumple con la especificación RFC 6749 y evita errores de redirección
      const cleanRedirectUrl = window.location.origin + window.location.pathname;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: cleanRedirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        sessionStorage.removeItem('nivalo_oauth_pending');
        let errorMsg = error.message;
        if (
          errorMsg.toLowerCase().includes('provider is not enabled') ||
          errorMsg.toLowerCase().includes('unsupported provider')
        ) {
          errorMsg =
            'El inicio con Google aún no está activado en tu panel de Supabase. Activa Google en Supabase > Authentication > Providers > Google con tu Client ID y Secret.';
        }
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Si el navegador no redirige automáticamente con el SDK
      if (data?.url) {
        window.location.href = data.url;
      }

      return { success: true };
    } catch (err: any) {
      sessionStorage.removeItem('nivalo_oauth_pending');
      const msg = err.message || 'Error al conectar con Google.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Recuperar Contraseña
  const resetPasswordForEmail = async (email: string) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase no está configurado.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}${window.location.pathname}#/reset-password`,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Error al enviar enlace de recuperación.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Actualizar Contraseña (después del enlace de recuperación)
  const updatePassword = async (newPassword: string) => {
    setAuthError(null);
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase no está configurado.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Error al actualizar contraseña.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Actualizar Perfil de Usuario
  const updateProfile = async (data: Partial<Omit<UserProfile, 'id' | 'role' | 'email'>>) => {
    if (!user) return { success: false, error: 'No hay sesión activa.' };

    const ok = await updateUserProfileInSupabase(user.id, data);
    if (ok) {
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
      return { success: true };
    }
    return { success: false, error: 'No se pudo guardar la información del perfil.' };
  };

  // Cerrar Sesión
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error durante signOut:', err);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setAuthError(null);
  };

  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isAdmin,
        isLoading,
        authError,
        setAuthError,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPasswordForEmail,
        updatePassword,
        updateProfile,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
