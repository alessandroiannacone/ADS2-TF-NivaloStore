import { useStore } from '../context/StoreContext';

/**
 * Hook personalizado para la ejecución de escenarios de prueba y simulaciones ICONIX
 */
export function useDemoScenarios() {
  const {
    executeDemoScenario,
    resetDemoData,
    paymentSimulatorOpen,
    setPaymentSimulatorOpen,
  } = useStore();

  return {
    executeDemoScenario,
    resetDemoData,
    paymentSimulatorOpen,
    setPaymentSimulatorOpen,
  };
}
