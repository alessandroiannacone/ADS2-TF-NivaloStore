import type { Producto } from '../types';

export interface IProductRepository {
  findAll(): Promise<Producto[] | null>;
  save(producto: Producto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

