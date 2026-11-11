import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Pedido,
  Producto,
  Vendedor,
  NotificacionSistema,
  DetallePedido,
  CanalVenta,
  HistorialEstado,
  Pago,
  IntentoCobro,
  TrackingEnvio,
} from '../types';
import { INITIAL_PEDIDOS, INITIAL_PRODUCTOS, INITIAL_VENDEDOR } from '../data/mockData';
import {
  fetchProductsFromSupabase,
  fetchOrdersFromSupabase,
  saveOrderToSupabase,
  updateOrderStatusInSupabase,
  savePaymentToSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  updateOrderTrackingInSupabase,
} from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface StoreContextType {
  // Estado general
  vendedor: Vendedor;
  pedidos: Pedido[];
  productos: Producto[];
  notificaciones: NotificacionSistema[];
  activeScreen: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  setActiveScreen: (screen: 'P1' | 'P2' | 'P3' | 'P4' | 'P5') => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  historyModalOrderId: string | null;
  setHistoryModalOrderId: (id: string | null) => void;
  paymentSimulatorOpen: boolean;
  setPaymentSimulatorOpen: (open: boolean) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;

  // Modo de visualización: Tienda Online (Cliente) vs Panel Vendedor (ICONIX P1-P4)
  viewMode: 'storefront' | 'admin';
  setViewMode: (mode: 'storefront' | 'admin') => void;

  // Carrito de compras de la tienda
  cart: Array<{ producto: Producto; cantidad: number }>;
  addToCart: (producto: Producto, cantidad?: number) => void;
  removeFromCart: (productoId: string) => void;
  updateCartQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartSubtotal: number;
  cartShippingCost: number;
  cartTotal: number;
  wishlist: string[];
  toggleWishlist: (productoId: string) => void;
  transferCartToP1: () => void;
  
  // Acciones de negocio (ICONIX)
  createOrder: (data: {
    clienteNombre: string;
    clienteTelefono: string;
    canal: CanalVenta;
    detalles: DetallePedido[];
    costoEnvio?: number;
  }) => { success: boolean; pedido?: Pedido; error?: string };

  generatePaymentLink: (pedidoId: string, simulateFailure?: boolean) => {
    success: boolean;
    enlace?: string;
    error?: string;
  };

  processPaymentWebhook: (data: {
    pedidoId: string;
    referenciaExterna: string;
    montoRecibido: number;
  }) => {
    status: 'APROBADO' | 'POR_REVISAR' | 'IGNORADO_DUPLICADO' | 'ERROR';
    mensaje: string;
  };

  simulate24HoursExpiration: (pedidoId?: string) => {
    cancelledCount: number;
    mensaje: string;
  };

  approveObservedPayment: (pagoId: string) => {
    success: boolean;
    error?: string;
  };

  rejectObservedPayment: (
    pagoId: string,
    motivo: string,
    simulateRefundError?: boolean
  ) => {
    success: boolean;
    error?: string;
  };

  retryRefund: (pagoId: string, forceSuccess?: boolean) => {
    success: boolean;
    error?: string;
  };

  // Gestión de Catálogo y Productos (P5)
  addProduct: (productoData: {
    nombre: string;
    categoria: string;
    precio: number;
    stock: number;
    imagen: string;
    descripcion?: string;
    marca?: string;
    medidas?: string;
    color?: string;
    talla?: string;
    badge?: string;
    esOferta?: boolean;
    esFavorito?: boolean;
    esRecomendado?: boolean;
  }) => Promise<{ success: boolean; producto?: Producto; error?: string }>;

  deleteProduct: (productoId: string) => Promise<boolean>;

  // Gestión y Seguimiento de Envíos
  updateOrderTracking: (
    pedidoId: string,
    tracking: TrackingEnvio
  ) => Promise<{ success: boolean; error?: string }>;

  addNotification: (
    tipo: 'success' | 'warning' | 'error' | 'info',
    titulo: string,
    mensaje: string
  ) => void;

  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetDemoData: () => void;
  executeDemoScenario: (demoNumber: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_PEDIDOS = 'nivalo_v2_pedidos';
const STORAGE_KEY_PRODUCTOS = 'nivalo_v2_productos';
const STORAGE_KEY_NOTIFS = 'nivalo_v2_notificaciones';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendedor] = useState<Vendedor>(INITIAL_VENDEDOR);
  const [activeScreen, setActiveScreen] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'P5'>('P1');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [historyModalOrderId, setHistoryModalOrderId] = useState<string | null>(null);
  const [paymentSimulatorOpen, setPaymentSimulatorOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Modo Tienda Online vs Panel Vendedor
  const STORAGE_KEY_CART = 'nivalo_v2_cart';
  const STORAGE_KEY_WISHLIST = 'nivalo_v2_wishlist';
  const STORAGE_KEY_VIEWMODE = 'nivalo_v2_viewmode';

  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VIEWMODE);
      return (saved === 'admin' || saved === 'storefront') ? saved : 'storefront';
    } catch {
      return 'storefront';
    }
  });

  const [cart, setCart] = useState<Array<{ producto: Producto; cantidad: number }>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WISHLIST);
      return saved ? JSON.parse(saved) : ['PROD-01', 'PROD-07'];
    } catch {
      return ['PROD-01', 'PROD-07'];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VIEWMODE, viewMode);
    } catch (e) {
      console.error(e);
    }
  }, [viewMode]);

  // Pedidos con persistencia local
  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PEDIDOS);
      const rawPedidos: Pedido[] = saved ? JSON.parse(saved) : INITIAL_PEDIDOS;
      return rawPedidos.map((ped) => ({
        ...ped,
        detalles: (ped.detalles || []).map((det) => {
          const matchProd =
            INITIAL_PRODUCTOS.find((p) => p.id === det.productoId) ||
            INITIAL_PRODUCTOS.find(
              (p) => p.nombre.toLowerCase().trim() === det.productoNombre.toLowerCase().trim()
            );
          return {
            ...det,
            productoImagen: det.productoImagen || matchProd?.imagen || '',
          };
        }),
      }));
    } catch {
      return INITIAL_PEDIDOS;
    }
  });

  // Catálogo de productos con stock y reservas
  const [productos, setProductos] = useState<Producto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTOS);
      if (saved) {
        const parsed: Producto[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sincronizar siempre las imágenes y atributos oficiales de INITIAL_PRODUCTOS
          return INITIAL_PRODUCTOS.map((initProd) => {
            const found = parsed.find((p) => p.id === initProd.id);
            if (found) {
              return {
                ...found,
                imagen: initProd.imagen,
                nombre: initProd.nombre,
                categoria: initProd.categoria,
                marca: initProd.marca,
                precio: initProd.precio,
                descripcion: initProd.descripcion,
                badge: initProd.badge,
                esOferta: initProd.esOferta,
                esFavorito: initProd.esFavorito,
                esRecomendado: initProd.esRecomendado,
              };
            }
            return initProd;
          });
        }
      }
      return INITIAL_PRODUCTOS;
    } catch {
      return INITIAL_PRODUCTOS;
    }
  });

  // Notificaciones del sistema
  const [notificaciones, setNotificaciones] = useState<NotificacionSistema[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Limpiar cualquier notificación técnica o de bienvenida antigua
        return Array.isArray(parsed)
          ? parsed.filter(
              (n) =>
                n.titulo !== 'Backend Supabase Conectado' &&
                n.titulo !== 'Bienvenida a Nivalo Store Iteración 2'
            )
          : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PEDIDOS, JSON.stringify(pedidos));
    } catch (e) {
      console.error('Error saving pedidos to localStorage', e);
    }
  }, [pedidos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTOS, JSON.stringify(productos));
    } catch (e) {
      console.error('Error saving productos to localStorage', e);
    }
  }, [productos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notificaciones));
    } catch (e) {
      console.error('Error saving notifs to localStorage', e);
    }
  }, [notificaciones]);

  // Carga inicial y sincronización con Supabase Backend (PostgreSQL)
  useEffect(() => {
    if (isSupabaseConfigured) {
      // 1. Cargar catálogo de productos desde Supabase
      fetchProductsFromSupabase().then((supabaseProducts) => {
        if (supabaseProducts && supabaseProducts.length > 0) {
          // Fusionar con INITIAL_PRODUCTOS para garantizar imágenes oficiales actualizadas
          const merged = supabaseProducts.map((sp) => {
            const initMatch = INITIAL_PRODUCTOS.find((ip) => ip.id === sp.id);
            return {
              ...sp,
              imagen: initMatch?.imagen || sp.imagen,
            };
          });
          setProductos(merged);
        }
      });

      // 2. Cargar pedidos desde Supabase
      fetchOrdersFromSupabase().then((supabaseOrders) => {
        if (supabaseOrders && supabaseOrders.length > 0) {
          setPedidos(supabaseOrders);
        }
      });

      console.log('✅ Supabase conectado en tiempo real.');
    }
  }, []);

  // Temporizador para verificar pedidos vencidos (RNF06)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setPedidos((prevPedidos) => {
        let hasChanges = false;
        const updated = prevPedidos.map((ped) => {
          if (ped.estado === 'PENDIENTE_PAGO') {
            const expDate = new Date(ped.fechaVencimientoReserva);
            if (now > expDate) {
              hasChanges = true;
              // Cancelar pedido
              const nuevoHistorial: HistorialEstado = {
                id: `HIST-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                pedidoId: ped.id,
                fechaHora: new Date().toISOString(),
                estadoAnterior: 'Pendiente de pago',
                estadoNuevo: 'Cancelado',
                origen: 'Temporizador',
                observaciones: 'Vencimiento automático de 24 horas sin pago aprobado. Se libera la reserva de stock.',
              };

              // Devolver stock reservado al disponible
              setProductos((prevProds) =>
                prevProds.map((prod) => {
                  const detalle = ped.detalles.find((d) => d.productoId === prod.id);
                  if (detalle) {
                    return {
                      ...prod,
                      stockDisponible: prod.stockDisponible + detalle.cantidad,
                      stockReservado: Math.max(0, prod.stockReservado - detalle.cantidad),
                    };
                  }
                  return prod;
                })
              );

              return {
                ...ped,
                estado: 'CANCELADO' as const,
                motivoCancelacion: 'Cancelado (sin pago 24 h)',
                historial: [...ped.historial, nuevoHistorial],
              };
            }
          }
          return ped;
        });

        if (hasChanges) {
          addNotification(
            'warning',
            'Cancelación automática (24h)',
            'Se detectaron pedidos vencidos sin pago. El stock reservado fue liberado al catálogo.'
          );
        }
        return updated;
      });
    }, 15000); // Chequeo periódico simulado

    return () => clearInterval(interval);
  }, []);

  const addNotification = (
    tipo: 'success' | 'warning' | 'error' | 'info',
    titulo: string,
    mensaje: string
  ) => {
    const newNotif: NotificacionSistema = {
      id: `NOT-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      tipo,
      titulo,
      mensaje,
      fechaHora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      leida: false,
    };
    setNotificaciones((prev) => [newNotif, ...prev.slice(0, 19)]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotificaciones([]);
  };

  // Métodos del carrito y tienda online (Vista Cliente)
  const addToCart = (prod: Producto, cantidad = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.producto.id === prod.id);
      if (exists) {
        return prev.map((item) =>
          item.producto.id === prod.id
            ? { ...item, cantidad: Math.min(prod.stockDisponible, item.cantidad + cantidad) }
            : item
        );
      }
      return [...prev, { producto: prod, cantidad: Math.min(prod.stockDisponible, cantidad) }];
    });
    addNotification('success', '¡Añadido al carrito!', `Se agregó "${prod.nombre}" a tu bolsa kawaii.`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productoId: string) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== productoId));
  };

  const updateCartQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.producto.id === productoId) {
          const validQty = Math.min(item.producto.stockDisponible, cantidad);
          return { ...item, cantidad: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productoId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productoId)) {
        addNotification('info', 'Eliminado de favoritos', 'Producto quitado de tu lista de deseos.');
        return prev.filter((id) => id !== productoId);
      } else {
        addNotification('success', '¡Guardado en favoritos!', 'Producto añadido con éxito.');
        return [...prev, productoId];
      }
    });
  };

  const cartSubtotal = cart.reduce((acc, curr) => acc + curr.producto.precio * curr.cantidad, 0);
  const cartShippingCost = cartSubtotal >= 80 || cart.length === 0 ? 0 : 15;
  const cartTotal = cartSubtotal + cartShippingCost;

  const transferCartToP1 = () => {
    setViewMode('admin');
    setActiveScreen('P1');
    addNotification(
      'info',
      'Carrito cargado en P1',
      'Se transfirieron los artículos a la pantalla de Registrar Pedido (P1).'
    );
  };

  // CUS-01: Registrar Pedido
  const createOrder = (data: {
    clienteNombre: string;
    clienteTelefono: string;
    canal: CanalVenta;
    detalles: DetallePedido[];
    costoEnvio?: number;
  }) => {
    // Validaciones Regla 1
    if (!data.clienteNombre.trim()) {
      return { success: false, error: 'Completa el nombre o usuario del cliente.' };
    }
    if (!data.clienteTelefono.trim() || data.clienteTelefono.trim().length < 8) {
      return { success: false, error: 'Ingresa un teléfono de contacto válido (mínimo 8 dígitos).' };
    }
    if (!data.detalles || data.detalles.length === 0) {
      return { success: false, error: 'Agrega al menos un producto al pedido.' };
    }

    // Regla 2: Verificar stock disponible
    for (const item of data.detalles) {
      const prod = productos.find((p) => p.id === item.productoId);
      if (!prod) {
        return { success: false, error: `El producto ${item.productoNombre} no existe en catálogo.` };
      }
      if (item.cantidad <= 0) {
        return { success: false, error: `La cantidad de ${item.productoNombre} debe ser mayor a cero.` };
      }
      if (item.cantidad > prod.stockDisponible) {
        return {
          success: false,
          error: `Stock insuficiente para ${item.productoNombre}. Disponible: ${prod.stockDisponible}, Solicitado: ${item.cantidad}.`,
        };
      }
    }

    // Generar ID único incremental
    const nextNumber = pedidos.length + 121;
    const pedidoId = `PED-${String(nextNumber).padStart(6, '0')}`;
    const now = new Date();
    const fechaVencimiento = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const subtotal = data.detalles.reduce((acc, curr) => acc + curr.subtotal, 0);
    // Regla de envío: Si subtotal >= 80 es GRATIS (0 soles). Si es menor a 80, costo de envío es S/ 15.00
    const costoEnvio = data.costoEnvio !== undefined ? data.costoEnvio : (subtotal >= 80 ? 0 : 15);
    const total = subtotal + costoEnvio;

    const initialHistory: HistorialEstado = {
      id: `HIST-${Date.now()}-1`,
      pedidoId,
      fechaHora: now.toISOString(),
      estadoAnterior: 'Nuevo',
      estadoNuevo: 'Pendiente de pago',
      origen: 'Vendedor',
      observaciones: `Pedido registrado. Subtotal: S/ ${subtotal.toFixed(2)}, Envío: ${costoEnvio === 0 ? 'GRATIS' : `S/ ${costoEnvio.toFixed(2)}`}, Total: S/ ${total.toFixed(2)}. Reserva temporal de stock por 24 horas.`,
    };

    const sanitizedDetalles: DetallePedido[] = data.detalles.map((item) => {
      const prod =
        productos.find((p) => p.id === item.productoId) ||
        INITIAL_PRODUCTOS.find((p) => p.id === item.productoId) ||
        INITIAL_PRODUCTOS.find(
          (p) => p.nombre.toLowerCase().trim() === item.productoNombre.toLowerCase().trim()
        );
      return {
        ...item,
        productoImagen: item.productoImagen || prod?.imagen || '',
      };
    });

    const newPedido: Pedido = {
      id: pedidoId,
      cliente: {
        id: `CLI-${Date.now()}`,
        nombreOIdentificador: data.clienteNombre.trim(),
        telefono: data.clienteTelefono.trim(),
        canal: data.canal,
      },
      detalles: sanitizedDetalles,
      subtotal,
      costoEnvio,
      total,
      estado: 'PENDIENTE_PAGO',
      fechaCreacion: now.toISOString(),
      fechaVencimientoReserva: fechaVencimiento,
      intentosCobro: [],
      pagos: [],
      historial: [initialHistory],
      enlacePagoActivo: `https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/${String(nextNumber).padStart(6, '0')}`,
    };

    // Regla 3: Actualizar stock (disminuye disponible, aumenta reservado)
    setProductos((prev) =>
      prev.map((prod) => {
        const item = data.detalles.find((d) => d.productoId === prod.id);
        if (item) {
          return {
            ...prod,
            stockDisponible: prod.stockDisponible - item.cantidad,
            stockReservado: prod.stockReservado + item.cantidad,
          };
        }
        return prod;
      })
    );

    setPedidos((prev) => [newPedido, ...prev]);

    // Sincronización asíncrona con Supabase
    if (isSupabaseConfigured) {
      saveOrderToSupabase(newPedido).catch(console.error);
    }

    addNotification(
      'success',
      'Pedido registrado correctamente',
      `Pedido ${pedidoId} registrado para ${data.clienteNombre}. Stock reservado temporalmente durante 24 horas.`
    );

    return { success: true, pedido: newPedido };
  };

  // CUS-02: Generar Cobro
  const generatePaymentLink = (pedidoId: string, simulateFailure = false) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) {
      return { success: false, error: 'Pedido no encontrado.' };
    }

    // Regla 6: No permitir generar cobro si no está en Pendiente de pago o si está vencido
    if (pedido.estado === 'PAGADO') {
      return { success: false, error: 'Este pedido ya se encuentra PAGADO. No requiere nuevo enlace de cobro.' };
    }
    if (pedido.estado === 'CANCELADO') {
      return { success: false, error: 'Este pedido fue CANCELADO. No es posible generar cobro para pedidos cancelados.' };
    }

    const isExpired = new Date() > new Date(pedido.fechaVencimientoReserva);
    if (isExpired) {
      return { success: false, error: 'La reserva temporal de 24 horas ha vencido. No se puede generar cobro.' };
    }

    const numeroIntento = (pedido.intentosCobro?.length || 0) + 1;
    const now = new Date();

    if (simulateFailure) {
      // Simulación de error: Servicio de pago no responde
      const failedAttempt: IntentoCobro = {
        id: `INT-${Date.now()}`,
        pedidoId,
        numeroIntento,
        fechaHora: now.toISOString(),
        resultado: 'Sin respuesta',
        mensajeError: 'El servicio de pago no responde. No se pudo establecer comunicación con la pasarela.',
      };

      const updatedHistory: HistorialEstado = {
        id: `HIST-${Date.now()}`,
        pedidoId,
        fechaHora: now.toISOString(),
        estadoAnterior: 'Pendiente de pago',
        estadoNuevo: 'Pendiente de pago',
        origen: 'Servicio de Pago',
        observaciones: `Falla en intento #${numeroIntento}: El servicio de pago no responde. Se mantiene en espera de reintento.`,
      };

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId
            ? {
                ...p,
                intentosCobro: [...(p.intentosCobro || []), failedAttempt],
                historial: [...p.historial, updatedHistory],
              }
            : p
        )
      );

      addNotification(
        'error',
        'El servicio de pago no responde',
        `Intento #${numeroIntento} fallido para pedido ${pedidoId}. Puedes reintentar la operación.`
      );

      return { success: false, error: 'El servicio de pago no responde' };
    }

    // Éxito: Enlace generado
    const linkNumber = pedidoId.replace('PED-', '');
    const enlace = `https://alessandroiannacone.github.io/ADS2-TF-NivaloStore/#/pago/${linkNumber}`;

    const newAttempt: IntentoCobro = {
      id: `INT-${Date.now()}`,
      pedidoId,
      numeroIntento,
      fechaHora: now.toISOString(),
      resultado: 'Generado',
      enlaceGenerado: enlace,
    };

    const updatedHistory: HistorialEstado = {
      id: `HIST-${Date.now()}`,
      pedidoId,
      fechaHora: now.toISOString(),
      estadoAnterior: 'Pendiente de pago',
      estadoNuevo: 'Pendiente de pago',
      origen: 'Vendedor',
      observaciones: `Enlace de pago generado con éxito (Intento #${numeroIntento}): ${enlace}`,
    };

    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoId
          ? {
              ...p,
              enlacePagoActivo: enlace,
              intentosCobro: [...(p.intentosCobro || []), newAttempt],
              historial: [...p.historial, updatedHistory],
            }
          : p
      )
    );

    addNotification(
      'success',
      'Enlace de cobro generado',
      `Enlace generado para ${pedido.id}. Listo para enviar por WhatsApp o Instagram.`
    );

    return { success: true, enlace };
  };

  // CUS-03: Flujo de confirmación de pagos simulado (Escenarios A, B, C, D)
  const processPaymentWebhook = (data: {
    pedidoId: string;
    referenciaExterna: string;
    montoRecibido: number;
  }): {
    status: 'APROBADO' | 'POR_REVISAR' | 'IGNORADO_DUPLICADO' | 'ERROR';
    mensaje: string;
  } => {
    const pedido = pedidos.find((p) => p.id === data.pedidoId);
    if (!pedido) {
      return { status: 'ERROR' as const, mensaje: 'Pedido no encontrado en el sistema.' };
    }

    const ref = data.referenciaExterna.trim();

    // Regla 9: Escenario C - Notificación duplicada
    const allExistingPayments = pedidos.flatMap((p) => p.pagos || []);
    const isDuplicate = allExistingPayments.some(
      (p) => p.referenciaExterna.toLowerCase() === ref.toLowerCase()
    );

    if (isDuplicate) {
      addNotification(
        'warning',
        'Notificación duplicada ignorada (Regla 9)',
        `La referencia externa "${ref}" ya fue procesada anteriormente. Se ignora para evitar duplicación de reservas y estados.`
      );
      return {
        status: 'IGNORADO_DUPLICADO' as const,
        mensaje: `Referencia ${ref} duplicada. No se modificó el estado ni el stock.`,
      };
    }

    const now = new Date();
    const diferencia = Number((data.montoRecibido - pedido.total).toFixed(2));

    // Regla 10: Escenario D - Pago recibido después de la cancelación
    if (pedido.estado === 'CANCELADO') {
      const nuevoPago: Pago = {
        id: `PAG-${Date.now()}`,
        pedidoId: pedido.id,
        referenciaExterna: ref,
        fechaPago: now.toISOString(),
        totalPedido: pedido.total,
        montoRecibido: data.montoRecibido,
        diferencia,
        estadoPago: 'POR_REVISAR',
        motivoObservacion: `Pago recibido de forma posterior a la cancelación del pedido. No se puede reactivar automáticamente (Regla 10). Requiere trámite de rechazo y reembolso en P4.`,
      };

      const newHistory: HistorialEstado = {
        id: `HIST-${Date.now()}`,
        pedidoId: pedido.id,
        fechaHora: now.toISOString(),
        estadoAnterior: 'Cancelado',
        estadoNuevo: 'Cancelado',
        origen: 'Servicio de Pago',
        observaciones: `Notificación de pago ${ref} por S/ ${data.montoRecibido.toFixed(2)} recibida en pedido cancelado. Derivado a P4 para gestión de reembolso.`,
      };

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedido.id
            ? {
                ...p,
                pagos: [...(p.pagos || []), nuevoPago],
                historial: [...p.historial, newHistory],
              }
            : p
        )
      );

      if (isSupabaseConfigured) {
        savePaymentToSupabase(nuevoPago).catch(console.error);
      }

      addNotification(
        'error',
        'Pago en pedido cancelado (P4)',
        `Se recibió pago para el pedido cancelado ${pedido.id}. Enviado a "Pagos por revisar" (P4) para reembolso.`
      );

      return {
        status: 'POR_REVISAR' as const,
        mensaje: 'Pedido cancelado. Pago enviado a P4 para gestión de reembolso.',
      };
    }

    // Regla 7: Escenario B - Monto incorrecto (diferencia != 0)
    if (Math.abs(diferencia) > 0.001) {
      const nuevoPago: Pago = {
        id: `PAG-${Date.now()}`,
        pedidoId: pedido.id,
        referenciaExterna: ref,
        fechaPago: now.toISOString(),
        totalPedido: pedido.total,
        montoRecibido: data.montoRecibido,
        diferencia,
        estadoPago: 'POR_REVISAR',
        motivoObservacion: `Monto recibido (S/ ${data.montoRecibido.toFixed(2)}) difiere del total del pedido (S/ ${pedido.total.toFixed(2)}). Diferencia calculada: ${diferencia > 0 ? '+' : ''}S/ ${diferencia.toFixed(2)}.`,
      };

      const newHistory: HistorialEstado = {
        id: `HIST-${Date.now()}`,
        pedidoId: pedido.id,
        fechaHora: now.toISOString(),
        estadoAnterior: 'Pendiente de pago',
        estadoNuevo: 'Pendiente de pago',
        origen: 'Servicio de Pago',
        observaciones: `Pago observado por diferencia de importe (Ref: ${ref}). Monto esperado S/ ${pedido.total.toFixed(2)}, recibido S/ ${data.montoRecibido.toFixed(2)}. Derivado a P4.`,
      };

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedido.id
            ? {
                ...p,
                pagos: [...(p.pagos || []), nuevoPago],
                historial: [...p.historial, newHistory],
              }
            : p
        )
      );

      if (isSupabaseConfigured) {
        savePaymentToSupabase(nuevoPago).catch(console.error);
      }

      addNotification(
        'warning',
        'Pago observado por diferencia (P4)',
        `Monto recibido S/ ${data.montoRecibido.toFixed(2)} vs Total S/ ${pedido.total.toFixed(2)}. Enviado a P4 para revisión manual.`
      );

      return {
        status: 'POR_REVISAR' as const,
        mensaje: `Diferencia de S/ ${diferencia.toFixed(2)} detectada. Pago registrado como "Por revisar".`,
      };
    }

    // Escenario A: Pago correcto (coincide exactamente con el total)
    const nuevoPago: Pago = {
      id: `PAG-${Date.now()}`,
      pedidoId: pedido.id,
      referenciaExterna: ref,
      fechaPago: now.toISOString(),
      totalPedido: pedido.total,
      montoRecibido: data.montoRecibido,
      diferencia: 0,
      estadoPago: 'APROBADO',
    };

    const newHistory: HistorialEstado = {
      id: `HIST-${Date.now()}`,
      pedidoId: pedido.id,
      fechaHora: now.toISOString(),
      estadoAnterior: pedido.estado === 'PENDIENTE_PAGO' ? 'Pendiente de pago' : pedido.estado,
      estadoNuevo: 'Pagado',
      origen: 'Servicio de Pago',
      observaciones: `Pago confirmado por S/ ${data.montoRecibido.toFixed(2)} (Ref: ${ref}). Reserva de stock confirmada definitivamente.`,
    };

    // Regla 4: Confirmar reserva temporal de stock (se descuenta definitivamente del inventario físico)
    setProductos((prev) =>
      prev.map((prod) => {
        const item = pedido.detalles.find((d) => d.productoId === prod.id);
        if (item) {
          return {
            ...prod,
            stockReservado: Math.max(0, prod.stockReservado - item.cantidad),
            stockTotalFisico: Math.max(0, prod.stockTotalFisico - item.cantidad),
          };
        }
        return prod;
      })
    );

    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedido.id
          ? {
              ...p,
              estado: 'PAGADO',
              pagos: [...(p.pagos || []), nuevoPago],
              historial: [...p.historial, newHistory],
            }
          : p
      )
    );

    if (isSupabaseConfigured) {
      savePaymentToSupabase(nuevoPago).catch(console.error);
      updateOrderStatusInSupabase(pedido.id, 'PAGADO', newHistory).catch(console.error);
    }

    addNotification(
      'success',
      'Pago confirmado. Pedido listo para preparación',
      `Pago de S/ ${data.montoRecibido.toFixed(2)} verificado con éxito para ${pedido.id} (${pedido.cliente.nombreOIdentificador}).`
    );

    return {
      status: 'APROBADO' as const,
      mensaje: 'Pago confirmado. Pedido listo para preparación.',
    };
  };


  // CUS-04: Simulación de vencimiento de 24 horas
  const simulate24HoursExpiration = (targetOrderId?: string) => {
    let count = 0;
    const now = new Date();

    setPedidos((prev) =>
      prev.map((ped) => {
        const matches = targetOrderId ? ped.id === targetOrderId : ped.estado === 'PENDIENTE_PAGO';
        if (matches && ped.estado === 'PENDIENTE_PAGO') {
          count++;

          // Regla 5: Liberar reserva al cancelar pedido vencido
          setProductos((prevProds) =>
            prevProds.map((prod) => {
              const item = ped.detalles.find((d) => d.productoId === prod.id);
              if (item) {
                return {
                  ...prod,
                  stockDisponible: prod.stockDisponible + item.cantidad,
                  stockReservado: Math.max(0, prod.stockReservado - item.cantidad),
                };
              }
              return prod;
            })
          );

          const newHistory: HistorialEstado = {
            id: `HIST-${Date.now()}-${count}`,
            pedidoId: ped.id,
            fechaHora: now.toISOString(),
            estadoAnterior: 'Pendiente de pago',
            estadoNuevo: 'Cancelado',
            origen: 'Temporizador',
            observaciones: 'Cancelación automática tras 24 horas sin pago. Stock liberado y retornado a disponibilidad.',
          };

          return {
            ...ped,
            estado: 'CANCELADO' as const,
            motivoCancelacion: 'Cancelado (sin pago 24 h)',
            historial: [...ped.historial, newHistory],
          };
        }
        return ped;
      })
    );

    const msg = count > 0
      ? `Se simularon las 24 horas. ${count} pedido(s) cancelado(s) y su stock fue liberado.`
      : 'No se encontraron pedidos pendientes de pago para vencer.';

    addNotification('warning', 'Simulación de 24 horas ejecutada', msg);
    return { cancelledCount: count, mensaje: msg };
  };

  // CUS-06: P4 - Aprobar pago observado
  const approveObservedPayment = (pagoId: string) => {
    let errorMsg = '';
    let targetPedido: Pedido | null = null;
    let targetPago: Pago | null = null;

    for (const p of pedidos) {
      const match = (p.pagos || []).find((pg) => pg.id === pagoId);
      if (match) {
        targetPedido = p;
        targetPago = match;
        break;
      }
    }

    if (!targetPedido || !targetPago) {
      return { success: false, error: 'Pago no encontrado.' };
    }

    // Regla 10: No aprobar si el pedido está cancelado
    if (targetPedido.estado === 'CANCELADO') {
      errorMsg = 'Este pedido fue cancelado. No es posible aprobar el pago.';
      addNotification('error', 'Acción bloqueada (Regla 10)', errorMsg);
      return { success: false, error: errorMsg };
    }

    const now = new Date();

    // Actualizar pago a APROBADO
    // Actualizar pedido a PAGADO
    // Confirmar stock sin duplicar
    setProductos((prev) =>
      prev.map((prod) => {
        const item = targetPedido!.detalles.find((d) => d.productoId === prod.id);
        if (item) {
          return {
            ...prod,
            stockReservado: Math.max(0, prod.stockReservado - item.cantidad),
            stockTotalFisico: Math.max(0, prod.stockTotalFisico - item.cantidad),
          };
        }
        return prod;
      })
    );

    const newHistory: HistorialEstado = {
      id: `HIST-${Date.now()}`,
      pedidoId: targetPedido.id,
      fechaHora: now.toISOString(),
      estadoAnterior: targetPedido.estado === 'PENDIENTE_PAGO' ? 'Pendiente de pago' : targetPedido.estado,
      estadoNuevo: 'Pagado',
      origen: 'Vendedor',
      observaciones: `Aprobación manual por vendedora tras revisar pago observado (${targetPago.referenciaExterna}). Pedido listo para preparación.`,
    };

    setPedidos((prev) =>
      prev.map((p) => {
        if (p.id === targetPedido!.id) {
          return {
            ...p,
            estado: 'PAGADO',
            pagos: p.pagos.map((pg) =>
              pg.id === pagoId ? { ...pg, estadoPago: 'APROBADO' as const } : pg
            ),
            historial: [...p.historial, newHistory],
          };
        }
        return p;
      })
    );

    addNotification(
      'success',
      'Pago aprobado manualmente',
      `Pago ${targetPago.referenciaExterna} aprobado. Pedido listo para preparación.`
    );

    return { success: true };
  };

  // CUS-06: P4 - Rechazar pago observado y gestionar reembolso
  const rejectObservedPayment = (
    pagoId: string,
    motivo: string,
    simulateRefundError = false
  ) => {
    if (!motivo.trim()) {
      return { success: false, error: 'El motivo del rechazo es obligatorio.' };
    }

    let targetPedido: Pedido | null = null;
    let targetPago: Pago | null = null;

    for (const p of pedidos) {
      const match = (p.pagos || []).find((pg) => pg.id === pagoId);
      if (match) {
        targetPedido = p;
        targetPago = match;
        break;
      }
    }

    if (!targetPedido || !targetPago) {
      return { success: false, error: 'Pago no encontrado.' };
    }

    const now = new Date();

    if (simulateRefundError) {
      // Simular fallo en pasarela de reembolso
      const errorHistory: HistorialEstado = {
        id: `HIST-${Date.now()}`,
        pedidoId: targetPedido.id,
        fechaHora: now.toISOString(),
        estadoAnterior: targetPedido.estado === 'PENDIENTE_PAGO' ? 'Pendiente de pago' : targetPedido.estado,
        estadoNuevo: targetPedido.estado === 'PENDIENTE_PAGO' ? 'Pendiente de pago' : targetPedido.estado,
        origen: 'Servicio de Pago',
        observaciones: `Falla técnica al procesar reembolso para ${targetPago.referenciaExterna}. Motivo: Timeout de conexión con pasarela. El pago permanece "Por revisar" para reintento.`,
      };

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === targetPedido!.id
            ? {
                ...p,
                pagos: p.pagos.map((pg) =>
                  pg.id === pagoId
                    ? {
                        ...pg,
                        resultadoReembolso: 'Fallido',
                        motivoRechazo: motivo,
                      }
                    : pg
                ),
                historial: [...p.historial, errorHistory],
              }
            : p
        )
      );

      addNotification(
        'error',
        'Falla en reembolso simulado',
        `No se pudo completar el reembolso para la referencia ${targetPago.referenciaExterna}. Intente nuevamente.`
      );

      return { success: false, error: 'Falla al procesar el reembolso en el Servicio de Pago.' };
    }

    // Rechazo y reembolso exitosos
    const refundHistory: HistorialEstado = {
      id: `HIST-${Date.now()}`,
      pedidoId: targetPedido.id,
      fechaHora: now.toISOString(),
      estadoAnterior: targetPedido.estado === 'PENDIENTE_PAGO' ? 'Pendiente de pago' : targetPedido.estado,
      estadoNuevo: targetPedido.estado === 'PENDIENTE_PAGO' ? 'Pendiente de pago' : targetPedido.estado,
      origen: 'Vendedor',
      observaciones: `Pago ${targetPago.referenciaExterna} RECHAZADO por vendedora. Motivo: "${motivo}". Solicitud de reembolso de S/ ${targetPago.montoRecibido.toFixed(2)} procesada exitosamente con el Servicio de Pago.`,
    };

    setPedidos((prev) =>
      prev.map((p) =>
        p.id === targetPedido!.id
          ? {
              ...p,
              pagos: p.pagos.map((pg) =>
                pg.id === pagoId
                  ? {
                      ...pg,
                      estadoPago: 'RECHAZADO',
                      motivoRechazo: motivo,
                      resultadoReembolso: 'Exitoso',
                    }
                  : pg
              ),
              historial: [...p.historial, refundHistory],
            }
          : p
      )
    );

    addNotification(
      'info',
      'Pago rechazado y reembolso procesado',
      `Pago ${targetPago.referenciaExterna} rechazado. Motivo registrado y reembolso de S/ ${targetPago.montoRecibido.toFixed(2)} simulado.`
    );

    return { success: true };
  };

  // Reintento de reembolso tras fallo
  const retryRefund = (pagoId: string, forceSuccess = true) => {
    return rejectObservedPayment(
      pagoId,
      'Reintento de reembolso tras error inicial de conexión',
      !forceSuccess
    );
  };

  // Gestión de Catálogo (P5): Agregar nuevo producto y guardar en BD
  const addProduct = async (data: {
    nombre: string;
    categoria: string;
    precio: number;
    stock: number;
    imagen: string;
    descripcion?: string;
    marca?: string;
    medidas?: string;
    color?: string;
    talla?: string;
    badge?: string;
    esOferta?: boolean;
    esFavorito?: boolean;
    esRecomendado?: boolean;
  }): Promise<{ success: boolean; producto?: Producto; error?: string }> => {
    if (!data.nombre.trim()) {
      return { success: false, error: 'Ingresa el nombre del producto.' };
    }
    if (data.precio <= 0) {
      return { success: false, error: 'El precio debe ser mayor a 0.' };
    }
    if (data.stock < 0) {
      return { success: false, error: 'El stock no puede ser negativo.' };
    }
    if (!data.imagen.trim()) {
      return { success: false, error: 'Ingresa una URL o sube una foto para el producto.' };
    }

    const nextId = `PROD-${Date.now().toString().slice(-5)}`;
    const newProd: Producto = {
      id: nextId,
      nombre: data.nombre.trim(),
      categoria: data.categoria.trim() || 'General',
      marca: data.marca?.trim() || 'NIVALO STUDIO',
      precio: Number(data.precio),
      puntos: Math.round(Number(data.precio) * 5),
      medidas: data.medidas?.trim() || 'Estándar',
      badge: data.badge?.trim() || (data.esOferta ? 'OFERTA' : 'NUEVO'),
      color: data.color?.trim() || 'Pastel',
      talla: data.talla?.trim() || 'Única',
      stockDisponible: Number(data.stock),
      stockReservado: 0,
      stockTotalFisico: Number(data.stock),
      imagen: data.imagen.trim(),
      descripcion: data.descripcion?.trim() || 'Producto exclusivo importado para Nivalo Store.',
      esOferta: Boolean(data.esOferta),
      esFavorito: Boolean(data.esFavorito),
      esRecomendado: Boolean(data.esRecomendado),
    };

    setProductos((prev) => [newProd, ...prev]);

    if (isSupabaseConfigured) {
      saveProductToSupabase(newProd).then((saved) => {
        if (saved) {
          console.log(`✅ Producto ${newProd.id} guardado en Supabase.`);
        }
      });
    }

    addNotification(
      'success',
      '¡Producto agregado al catálogo! 🌸',
      `"${newProd.nombre}" ya está visible y disponible en la tienda.`
    );

    return { success: true, producto: newProd };
  };

  // Gestión de Catálogo: Eliminar producto
  const deleteProduct = async (productoId: string): Promise<boolean> => {
    setProductos((prev) => prev.filter((p) => p.id !== productoId));
    if (isSupabaseConfigured) {
      await deleteProductFromSupabase(productoId);
    }
    addNotification('info', 'Producto eliminado', 'El producto fue retirado del catálogo.');
    return true;
  };

  // Seguimiento de Envíos: Actualizar tracking de un pedido
  const updateOrderTracking = async (
    pedidoId: string,
    tracking: TrackingEnvio
  ): Promise<{ success: boolean; error?: string }> => {
    const targetOrder = pedidos.find((p) => p.id === pedidoId);
    if (!targetOrder) {
      return { success: false, error: 'Pedido no encontrado.' };
    }

    const now = new Date();
    const historyItem: HistorialEstado = {
      id: `HIST-${Date.now()}`,
      pedidoId,
      fechaHora: now.toISOString(),
      estadoAnterior: targetOrder.estado,
      estadoNuevo: targetOrder.estado,
      origen: 'Vendedor',
      observaciones: `Envío actualizado: ${tracking.empresa} (${tracking.estadoEnvio}) - Guía: ${tracking.numeroSeguimiento || 'Sin guía'}. Destino: ${tracking.destino || 'No especificado'}`,
    };

    setPedidos((prev) =>
      prev.map((p) => {
        if (p.id !== pedidoId) return p;
        return {
          ...p,
          envio: tracking,
          historial: [historyItem, ...(p.historial || [])],
        };
      })
    );

    if (isSupabaseConfigured) {
      await updateOrderTrackingInSupabase(pedidoId, tracking, historyItem);
    }

    addNotification(
      'success',
      '🚚 Envío Actualizado',
      `Pedido ${pedidoId} asignado a ${tracking.empresa} [${tracking.estadoEnvio}]`
    );

    return { success: true };
  };

  // Restablecer datos iniciales de demostración
  const resetDemoData = () => {
    setPedidos(INITIAL_PEDIDOS);
    setProductos(INITIAL_PRODUCTOS);
    setSelectedOrderId(null);
    setHistoryModalOrderId(null);
    localStorage.removeItem(STORAGE_KEY_PEDIDOS);
    localStorage.removeItem(STORAGE_KEY_PRODUCTOS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    addNotification(
      'info',
      'Datos de demostración restablecidos',
      'Se reiniciaron los 6 pedidos de prueba y los niveles iniciales de catálogo.'
    );
  };

  // Ejecución de las 6 Demostraciones interactivas para el docente (Sección 14)
  const executeDemoScenario = (demoNumber: number) => {
    switch (demoNumber) {
      case 1:
        // Demostración 1: Registrar pedido
        setActiveScreen('P1');
        addNotification(
          'info',
          'Demostración 1: Registrar pedido (CUS-01)',
          'Navegando a P1. Selecciona cliente, agrega productos con stock y guarda para ver la reserva por 24h.'
        );
        break;
      case 2:
        // Demostración 2: Generar cobro
        setSelectedOrderId('PED-000121');
        setActiveScreen('P2');
        addNotification(
          'info',
          'Demostración 2: Generar cobro (CUS-02)',
          'Navegando a P2 con el pedido PED-000121 seleccionado. Haz clic en "Generar enlace de pago".'
        );
        break;
      case 3:
        // Demostración 3: Confirmar pago (CUS-03)
        setSelectedOrderId('PED-000121');
        setPaymentSimulatorOpen(true);
        addNotification(
          'info',
          'Demostración 3: Confirmar pago (CUS-03)',
          'Abriendo el simulador de pago pasarela para el pedido PED-000121. Selecciona Escenario A (Pago correcto).'
        );
        break;
      case 4:
        // Demostración 4: Cancelar pedido vencido (CUS-04)
        setActiveScreen('P3');
        simulate24HoursExpiration('PED-000123');
        addNotification(
          'warning',
          'Demostración 4: Cancelar vencido (CUS-04)',
          'Simulando el transcurso de 24h para PED-000123. Se cancela con origen Temporizador y libera stock.'
        );
        break;
      case 5:
        // Demostración 5: Consultar historial (CUS-05)
        setActiveScreen('P3');
        setHistoryModalOrderId('PED-000122');
        addNotification(
          'info',
          'Demostración 5: Consultar historial (CUS-05)',
          'Abriendo la línea de tiempo de auditoría para el pedido pagado PED-000122.'
        );
        break;
      case 6:
        // Demostración 6: Revisar pago observado (CUS-06)
        setActiveScreen('P4');
        addNotification(
          'info',
          'Demostración 6: Pagos por revisar (CUS-06)',
          'Navegando a P4. Observa PED-000125 (diferencia de monto) y PED-000126 (recibido tras cancelación).'
        );
        break;
      default:
        break;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        vendedor,
        pedidos,
        productos,
        notificaciones,
        activeScreen,
        setActiveScreen,
        selectedOrderId,
        setSelectedOrderId,
        historyModalOrderId,
        setHistoryModalOrderId,
        paymentSimulatorOpen,
        setPaymentSimulatorOpen,
        isOffline,
        setIsOffline,
        viewMode,
        setViewMode,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartSubtotal,
        cartShippingCost,
        cartTotal,
        wishlist,
        toggleWishlist,
        transferCartToP1,
        createOrder,
        generatePaymentLink,
        processPaymentWebhook,
        simulate24HoursExpiration,
        approveObservedPayment,
        rejectObservedPayment,
        retryRefund,
        addProduct,
        deleteProduct,
        updateOrderTracking,
        addNotification,
        markNotificationAsRead,
        clearAllNotifications,
        resetDemoData,
        executeDemoScenario,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe ser usado dentro de un StoreProvider');
  }
  return context;
};
