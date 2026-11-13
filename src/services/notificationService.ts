import type { NotificacionSistema } from '../types';

/**
 * Servicio para estandarizar la creación de notificaciones del sistema
 */
export class NotificationService {
  public static createNotification(
    tipo: 'success' | 'warning' | 'error' | 'info',
    titulo: string,
    mensaje: string
  ): NotificacionSistema {
    return {
      id: `NOT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tipo,
      titulo,
      mensaje,
      fechaHora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      leida: false,
    };
  }
}
