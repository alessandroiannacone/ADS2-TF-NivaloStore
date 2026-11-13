import type { IProductRepository } from './IProductRepository';
import type { Producto } from '../types';
import {
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
} from '../services/supabaseService';

export class ProductRepository implements IProductRepository {
  async findAll(): Promise<Producto[] | null> {
    return await fetchProductsFromSupabase();
  }

  async save(producto: Producto): Promise<boolean> {
    return await saveProductToSupabase(producto);
  }

  async delete(id: string): Promise<boolean> {
    return await deleteProductFromSupabase(id);
  }
}

export const productRepository = new ProductRepository();
