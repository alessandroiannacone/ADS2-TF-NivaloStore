import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { P1RegisterOrder } from './screens/P1RegisterOrder';
import { P2GenerateCharge } from './screens/P2GenerateCharge';
import { P3OrdersList } from './screens/P3OrdersList';
import { P4ReviewPayments } from './screens/P4ReviewPayments';
import { HistoryModal } from './components/HistoryModal';
import { NotificationToast } from './components/NotificationToast';
import { Storefront } from './screens/Storefront';
import { CustomerPaymentPage } from './screens/CustomerPaymentPage';
import { CustomerAuthPage } from './screens/CustomerAuthPage';
import { CustomerAccountPage } from './screens/CustomerAccountPage';
import { AdminLoginPage } from './screens/AdminLoginPage';
import { ResetPasswordPage } from './screens/ResetPasswordPage';

const MainLayout: React.FC = () => {
  const { activeScreen, viewMode, setViewMode } = useStore();
  const { user, isAdmin, isLoading } = useAuth();

  const [currentRoute, setCurrentRoute] = useState<string>(() => window.location.hash || '#/');
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentRoute(hash);

      const matchPayment = hash.match(/^#\/pago\/([a-zA-Z0-9_-]+)/);
      if (matchPayment) {
        setPaymentOrderId(matchPayment[1]);
      } else {
        setPaymentOrderId(null);
      }

      // Si se navega explícitamente a #/admin
      if (hash.startsWith('#/admin') && !hash.includes('/login')) {
        setViewMode('admin');
      } else if (hash === '#/' || hash === '' || hash.startsWith('#/tienda')) {
        setViewMode('storefront');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setViewMode]);

  // Redirigir a cuenta o panel si el usuario ya tiene sesión activa
  useEffect(() => {
    if (user && !isLoading) {
      if (currentRoute === '#/login' || currentRoute === '#/register') {
        if (isAdmin) {
          window.location.hash = '#/admin';
        } else {
          window.location.hash = '#/mi-cuenta';
        }
      } else if (currentRoute === '#/admin/login' && isAdmin) {
        setViewMode('admin');
        window.location.hash = '#/admin';
      }
    }
  }, [user, isAdmin, isLoading, currentRoute, setViewMode]);

  // 1. Pantalla de carga mientras se verifica la sesión en Supabase
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8FA] flex flex-col items-center justify-center p-4 font-['Poppins',sans-serif]">
        <div className="w-10 h-10 border-3 border-[#F4A7C1] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#8E7C94] mt-3 font-semibold tracking-wide">
          Verificando sesión segura...
        </p>
      </div>
    );
  }

  // 2. Ruta de Pasarela de Pago del Cliente (#/pago/:id)
  if (paymentOrderId) {
    return (
      <CustomerPaymentPage
        pedidoId={paymentOrderId}
        onBackToStore={() => {
          window.location.hash = '#/';
          setPaymentOrderId(null);
          setViewMode('storefront');
        }}
      />
    );
  }

  // 3. Rutas de Autenticación de Clientes
  if (currentRoute === '#/login' || currentRoute === '#/register') {
    if (user) {
      return null;
    }
    return (
      <CustomerAuthPage
        initialMode={currentRoute === '#/register' ? 'register' : 'login'}
        onSuccess={() => {
          window.location.hash = '#/mi-cuenta';
        }}
        onCancel={() => {
          window.location.hash = '#/';
        }}
      />
    );
  }

  if (currentRoute === '#/recuperar-password') {
    return (
      <CustomerAuthPage
        initialMode="forgot"
        onCancel={() => {
          window.location.hash = '#/login';
        }}
      />
    );
  }

  if (currentRoute === '#/reset-password') {
    return <ResetPasswordPage />;
  }

  // 4. Portal del Cliente (Mi Cuenta / Mis Pedidos)
  if (currentRoute === '#/mi-cuenta' || currentRoute === '#/mis-pedidos') {
    if (!user) {
      return (
        <CustomerAuthPage
          initialMode="login"
          onSuccess={() => {
            window.location.hash = '#/mi-cuenta';
          }}
          onCancel={() => {
            window.location.hash = '#/';
          }}
        />
      );
    }
    return (
      <CustomerAccountPage
        onBackToStore={() => {
          window.location.hash = '#/';
        }}
      />
    );
  }

  // 5. Login Administrativo Exclusivo (#/admin/login)
  if (currentRoute === '#/admin/login') {
    if (user && isAdmin) {
      return null;
    }
    return (
      <AdminLoginPage
        onSuccess={() => {
          setViewMode('admin');
          window.location.hash = '#/admin';
        }}
        onBackToStore={() => {
          setViewMode('storefront');
          window.location.hash = '#/';
        }}
      />
    );
  }

  // 6. Panel Administrativo Protegido (#/admin o viewMode === 'admin')
  // REGLA CRÍTICA: Solo usuarios con sesión activa Y rol ADMIN pueden acceder.
  if (viewMode === 'admin' || currentRoute.startsWith('#/admin')) {
    if (!user || !isAdmin) {
      // Bloquear acceso no autorizado y mostrar pantalla de autenticación administrativa
      return (
        <AdminLoginPage
          onSuccess={() => {
            setViewMode('admin');
            window.location.hash = '#/admin';
          }}
          onBackToStore={() => {
            setViewMode('storefront');
            window.location.hash = '#/';
          }}
        />
      );
    }

    // Acceso permitido exclusivamente para Administrador autenticado
    return (
      <div className="min-h-screen bg-[#FFF8FA] text-[#4A3E4E] flex flex-col font-['Poppins',sans-serif]">
        <Header />
        <div className="flex-1 flex flex-col lg:flex-row">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full transition-all">
            {activeScreen === 'P1' && <P1RegisterOrder />}
            {activeScreen === 'P2' && <P2GenerateCharge />}
            {activeScreen === 'P3' && <P3OrdersList />}
            {activeScreen === 'P4' && <P4ReviewPayments />}
          </main>
        </div>
        <HistoryModal />
        <NotificationToast />
      </div>
    );
  }

  // 7. Tienda Virtual (Vista Pública Principal)
  return (
    <>
      <Storefront />
      <NotificationToast />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainLayout />
      </StoreProvider>
    </AuthProvider>
  );
}