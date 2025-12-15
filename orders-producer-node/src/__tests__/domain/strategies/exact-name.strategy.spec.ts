import { ExactNameStrategy } from "../../../domain/strategies/exact-name.strategy";

describe("ExactNameStrategy", () => {
  it("matches producto exacto (case-insensitive)", () => {
    const strategy = new ExactNameStrategy("Hamburguesa", 10);
    expect(strategy.matches("Hamburguesa")).toBe(true);
    expect(strategy.matches("hamburguesa")).toBe(true);
    expect(strategy.matches("HAMBURGUESA")).toBe(true);
  });

  it("no matchea nombres diferentes", () => {
    const strategy = new ExactNameStrategy("Hamburguesa", 10);
    expect(strategy.matches("Papas")).toBe(false);
    expect(strategy.matches("Hamburgues")).toBe(false);
  });

  it("calcula tiempo correctamente", () => {
    const strategy = new ExactNameStrategy("Pizza", 15);
    expect(strategy.calculateTime(1)).toBe(15);
    expect(strategy.calculateTime(3)).toBe(45);
    expect(strategy.calculateTime(0)).toBe(0);
  });
});
