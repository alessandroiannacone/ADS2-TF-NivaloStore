import { useStore } from '../context/StoreContext';

/**
 * Hook personalizado para la gestión reactiva del Carrito y Favoritos (Wishlist)
 * Aplica el patrón Facade sobre StoreContext desacoplando componentes del store global.
 */
export function useCart() {
  const {
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
  } = useStore();

  return {
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
    itemCount: cart.reduce((acc, item) => acc + item.cantidad, 0),
  };
}
