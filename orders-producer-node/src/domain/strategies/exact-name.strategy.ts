import { PreparationStrategy } from './interfaces';

/**
 * Estrategia que hace matching exacto por nombre de producto (case-insensitive)
 */
export class ExactNameStrategy implements PreparationStrategy {
  constructor(private productName: string, private secondsPerUnit: number) {}

  matches(productName: string): boolean {
    return this.productName.toLowerCase() === productName.toLowerCase();
  }

  calculateTime(quantity: number): number {
    return quantity * this.secondsPerUnit;
  }
}
