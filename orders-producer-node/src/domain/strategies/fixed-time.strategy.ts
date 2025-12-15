import { PreparationStrategy } from './interfaces';

export class FixedTimeStrategy implements PreparationStrategy {
  constructor(private pattern: RegExp, private secondsPerUnit: number) {}

  matches(productName: string): boolean {
    return this.pattern.test(productName);
  }

  calculateTime(quantity: number): number {
    return quantity * this.secondsPerUnit;
  }
}
