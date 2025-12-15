import { createKitchenOrderFromMessage } from "../../../application/factories/order.factory";
import { OrderMessage } from "../../../domain/models/order";

describe("Order Factory - failure cases", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("maneja faltantes sin lanzar si la factoría es tolerante (graceful)", () => {
    const bad: Partial<OrderMessage> = {
      customerName: "",
      table: "",
      items: [],
    };

    const order = createKitchenOrderFromMessage(bad as unknown as OrderMessage);
    expect(order.customerName).toBe("");
    expect(order.table).toBe("");
    expect(order.items).toEqual([]);
  });

  it("normaliza items inválidos si la factoría no valida estrictamente (no throw)", () => {
    const badQty: OrderMessage = {
      customerName: "Test",
      table: "Mesa 1",
      items: [{ productName: "X", quantity: 0, unitPrice: 100 }],
      id: "00000000-0000-0000-0000-000000000000",
      createdAt: "2025-01-01T12:00:00.000Z",
    };
    const badPrice: OrderMessage = {
      customerName: "Test",
      table: "Mesa 1",
      items: [{ productName: "Y", quantity: 1, unitPrice: -1 }],
      id: "00000000-0000-0000-0000-000000000000",
      createdAt: "2025-01-01T12:00:00.000Z",
    };

    const o1 = createKitchenOrderFromMessage(badQty);
    const o2 = createKitchenOrderFromMessage(badPrice);
    expect(o1.items[0].quantity).toBe(0);
    expect(o2.items[0].unitPrice).toBe(-1);
  });
});

// Isolated: Validaciones puras; sin I/O.
// Repeatable: Tiempo fijo.
// Self-validating: expect(...).toThrow()