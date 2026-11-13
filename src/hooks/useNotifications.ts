import { useStore } from '../context/StoreContext';

/**
 * Hook personalizado para el sistema de alertas y notificaciones del sistema
 */
export function useNotifications() {
  const {
    notificaciones,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
  } = useStore();

  return {
    notificaciones,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    unreadCount: notificaciones.filter((n) => !n.leida).length,
  };
}

