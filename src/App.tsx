import React, { useState, useEffect } from 'react';
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

const MainLayout: React.FC = () => {
  const { activeScreen, viewMode, setViewMode } = useStore();
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/pago\/([a-zA-Z0-9_-]+)/);
      if (match) {
        setPaymentOrderId(match[1]);
      } else {
        setPaymentOrderId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Si se entra mediante un enlace de pago de cliente (#/pago/000123)
  if (paymentOrderId) {
    return (
      <CustomerPaymentPage
        pedidoId={paymentOrderId}
        onBackToStore={() => {
          window.location.hash = '';
          setPaymentOrderId(null);
          setViewMode('storefront');
        }}
      />
    );
  }

  if (viewMode === 'storefront') {
    return (
      <>
        <Storefront />
        <NotificationToast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8FA] text-[#4A3E4E] flex flex-col font-['Poppins',sans-serif]">
      {/* Header Principal */}
      <Header />

      {/* Contenedor Principal: Sidebar + Pantalla Activa */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {activeScreen === 'P1' && <P1RegisterOrder />}
          {activeScreen === 'P2' && <P2GenerateCharge />}
          {activeScreen === 'P3' && <P3OrdersList />}
          {activeScreen === 'P4' && <P4ReviewPayments />}
        </main>
      </div>

      {/* Modal de Trazabilidad e Historial */}
      <HistoryModal />

      {/* Notificaciones del Sistema */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
