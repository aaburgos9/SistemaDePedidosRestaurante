import { FixedTimeStrategy } from "../../../domain/strategies/fixed-time.strategy";

describe("FixedTimeStrategy", () => {
  it("matches según regex pattern", () => {
    const strategy = new FixedTimeStrategy(/hamburguesa/i, 10);
    expect(strategy.matches("Hamburguesa")).toBe(true);
    expect(strategy.matches("hamburguesa doble")).toBe(true);
    expect(strategy.matches("HAMBURGUESA")).toBe(true);
  });

  it("no matchea cuando pattern no coincide", () => {
    const strategy = new FixedTimeStrategy(/^pizza$/i, 12);
    expect(strategy.matches("Pizza Grande")).toBe(false);
    expect(strategy.matches("Calzone")).toBe(false);
  });

  it("calcula tiempo correctamente", () => {
    const strategy = new FixedTimeStrategy(/refresco/i, 2);
    expect(strategy.calculateTime(1)).toBe(2);
    expect(strategy.calculateTime(5)).toBe(10);
    expect(strategy.calculateTime(0)).toBe(0);
  });
});
