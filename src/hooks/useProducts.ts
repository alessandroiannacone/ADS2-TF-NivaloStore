import { useStore } from '../context/StoreContext';

/**
 * Hook personalizado para la gestión del catálogo de productos y stock (P5)
 */
export function useProducts() {
  const { productos, addProduct, deleteProduct } = useStore();

  return {
    productos,
    addProduct,
    deleteProduct,
  };
}
