import { PreparationTimeCalculator } from "../../../domain/strategies/preparation-calculator.strategy";
import { PreparationStrategy } from "../../../domain/strategies/interfaces";

describe("PreparationTimeCalculator - failure and edge cases", () => {
  let calculator: PreparationTimeCalculator;

  beforeEach(() => {
    calculator = new PreparationTimeCalculator();
  });

  it("cuando no hay estrategias registradas, usa fallback (por ejemplo 5s por unidad)", () => {
    const time = calculator.calculate("Cualquier", 1);
    expect(time).toBe(5);
  });

  it("cantidad negativa o cero produce 0 (defensivo)", () => {
    const defaultStrategy: PreparationStrategy = {
      matches: () => true,
      calculateTime: (qty: number) => (qty <= 0 ? 0 : qty * 5),
    };
    calculator.register(defaultStrategy);

    expect(calculator.calculate("Algo", 0)).toBe(0);
    expect(calculator.calculate("Algo", -3)).toBe(0);
  });

  it("si múltiples estrategias matchean, usa la primera registrada (determinista)", () => {
    const s1: PreparationStrategy = {
      matches: () => true,
      calculateTime: (qty: number) => qty * 10,
    };
    const s2: PreparationStrategy = {
      matches: () => true,
      calculateTime: (qty: number) => qty * 1,
    };
    calculator.register(s1);
    calculator.register(s2);

    expect(calculator.calculate("Conflicto", 2)).toBe(20);
  });
});

// Isolated: Sin I/O, solo cálculos.
// Repeatable: Entradas deterministas, sin random.
// Self-validating: Aserciones claras.