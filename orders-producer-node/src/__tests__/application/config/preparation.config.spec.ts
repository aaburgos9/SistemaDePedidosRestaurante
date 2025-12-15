
import { createCalculatorFromMongo } from "../../../application/config/preparation.config";
import { PreparationTimeRepository } from "../../../infrastructure/database/repositories/preparation-time.repository";

jest.mock("../../../infrastructure/database/repositories/preparation-time.repository");

describe("preparation.config", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("carga tiempos desde MongoDB cuando hay datos", async () => {
    const mockPreparationTimes = [
      { productName: "Hamburguesa", secondsPerUnit: 12, enabled: true },
      { productName: "Pizza", secondsPerUnit: 18, enabled: true },
    ];

    (PreparationTimeRepository.prototype.getAllEnabled as jest.Mock).mockResolvedValue(
      mockPreparationTimes
    );

    const calculator = await createCalculatorFromMongo();

    expect(calculator).toBeDefined();
    expect(PreparationTimeRepository.prototype.getAllEnabled).toHaveBeenCalled();
  });

  it("usa valores por defecto cuando MongoDB está vacío", async () => {
    (PreparationTimeRepository.prototype.getAllEnabled as jest.Mock).mockResolvedValue([]);

    const calculator = await createCalculatorFromMongo();

    expect(calculator).toBeDefined();
    const items = [{ name: "Hamburguesa", quantity: 1 }];
    let total = 0;
    for (const item of items) {
      total += calculator.calculate(item.name, item.quantity);
    }
    expect(total).toBe(10);
  });

  it("usa valores por defecto cuando MongoDB falla", async () => {
    (PreparationTimeRepository.prototype.getAllEnabled as jest.Mock).mockRejectedValue(
      new Error("MongoDB connection failed")
    );

    const calculator = await createCalculatorFromMongo();

    expect(calculator).toBeDefined();
    const items = [{ name: "Pizza", quantity: 1 }];
    let total = 0;
    for (const item of items) {
      total += calculator.calculate(item.name, item.quantity);
    }
    expect(total).toBe(15);
  });

  it("registra correctamente estrategias desde MongoDB", async () => {
    const mockPreparationTimes = [
      { productName: "Tacos", secondsPerUnit: 8, enabled: true },
    ];

    (PreparationTimeRepository.prototype.getAllEnabled as jest.Mock).mockResolvedValue(
      mockPreparationTimes
    );

    const calculator = await createCalculatorFromMongo();

    const items = [{ name: "Tacos", quantity: 3 }];
    let total = 0;
    for (const item of items) {
      total += calculator.calculate(item.name, item.quantity);
    }
    expect(total).toBe(24);
  });

  it("maneja múltiples productos desde MongoDB", async () => {
    const mockPreparationTimes = [
      { productName: "Producto1", secondsPerUnit: 5, enabled: true },
      { productName: "Producto2", secondsPerUnit: 10, enabled: true },
      { productName: "Producto3", secondsPerUnit: 7, enabled: true },
    ];

    (PreparationTimeRepository.prototype.getAllEnabled as jest.Mock).mockResolvedValue(
      mockPreparationTimes
    );

    const calculator = await createCalculatorFromMongo();

    const items = [
      { name: "Producto1", quantity: 2 },
      { name: "Producto2", quantity: 1 },
    ];
    let total = 0;
    for (const item of items) {
      total += calculator.calculate(item.name, item.quantity);
    }
    expect(total).toBe(20);
  });
});
