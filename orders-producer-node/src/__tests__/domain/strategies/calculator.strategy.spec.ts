import { PreparationTimeCalculator } from "../../../domain/strategies/preparation-calculator.strategy";
import { PreparationStrategy } from "../../../domain/strategies/interfaces";

describe("PreparationTimeCalculator (Strategy Pattern)", () => {
  let calculator: PreparationTimeCalculator;

  beforeEach(() => {
    calculator = new PreparationTimeCalculator();
  });

  it("elige la estrategia correcta por nombre de producto (Fixed vs Default)", () => {
    // Estrategia fija: hamburguesa = 10s por unidad
    const fixedStrategy: PreparationStrategy = {
      matches: (name: string) => /hamburguesa/i.test(name),
      calculateTime: (qty: number) => qty * 10,
    };

    // Estrategia default: fallback 5s por unidad
    const defaultStrategy: PreparationStrategy = {
      matches: () => true,
      calculateTime: (qty: number) => qty * 5,
    };

    calculator.register(fixedStrategy);
    calculator.register(defaultStrategy);

    const burgerTime = calculator.calculate("Hamburguesa doble", 2);
    const otherTime = calculator.calculate("Limonada", 3);

    expect(burgerTime).toBe(20);
    expect(otherTime).toBe(15);
  });

  it("cumple OCP agregando una nueva estrategia sin modificar el cálculo existente", () => {
    // Estrategia nueva agregada en tiempo de prueba (OCP)
    const hotDogStrategy: PreparationStrategy = {
      matches: (name: string) => /perro/i.test(name),
      calculateTime: (qty: number) => qty * 6,
    };
    calculator.register(hotDogStrategy);

    // Estrategia default registrada al final para que no opaque la específica
    const defaultStrategy: PreparationStrategy = {
      matches: () => true,
      calculateTime: (qty: number) => qty * 5,
    };
    calculator.register(defaultStrategy);

    const preTime = calculator.calculate("Perro caliente", 2);
    expect(preTime).toBe(12);
  });
});

// Aislamiento: No se usa I/O; solo objetos en memoria.
// Repeatable: No se usa aleatoriedad; cálculos deterministas.
// Self-validating: Aserciones claras con expect.