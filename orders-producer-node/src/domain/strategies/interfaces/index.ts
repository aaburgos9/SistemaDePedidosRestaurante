export interface PreparationStrategy {
  matches(productName: string): boolean;
  calculateTime(quantity: number): number; 
}
