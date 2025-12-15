/**
 * Modelo para productos del menú
 * Almacenado en MongoDB en la colección 'products'
 */
export interface Product {
  _id: string;
  id?: number;
  name: string;
  price: number;
  description: string;
  image: string;
  enabled: boolean;
  preparationTime: number; // en minutos
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

