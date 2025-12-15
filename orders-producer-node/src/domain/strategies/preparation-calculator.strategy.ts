import { PreparationStrategy } from './interfaces';

export class PreparationTimeCalculator {
  private strategies: PreparationStrategy[] = [];

  register(strategy: PreparationStrategy) {
    this.strategies.push(strategy);
  }

  calculate(productName: string, quantity: number): number {
    const s = this.strategies.find((st) => st.matches(productName));
    if (!s) return quantity * 5; // default 5s per unit
    return s.calculateTime(quantity);
  }
}
