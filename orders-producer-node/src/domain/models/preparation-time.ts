/**
 * Modelo para tiempos de preparación de productos
 * Almacenado en MongoDB en la colección 'preparation_times'
 */
export interface PreparationTime {
  _id: string;
  productName: string; 
  secondsPerUnit: number; 
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

