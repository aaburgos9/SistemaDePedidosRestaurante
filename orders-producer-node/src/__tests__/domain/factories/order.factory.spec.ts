import { createKitchenOrderFromMessage } from "../../../application/factories/order.factory";
import { OrderMessage } from "../../../domain/models/order";

describe("Order Factory (createKitchenOrderFromMessage)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("asigna UUID y fecha cuando no vienen en el mensaje", () => {
    const msg = {
      customerName: "Juan",
      table: "Mesa 5",
      items: [
        { productName: "Hamburguesa", quantity: 2, unitPrice: 10000 },
      ],
    };

    const order = createKitchenOrderFromMessage(msg as unknown as OrderMessage);

    expect(order.id).toMatch(/[0-9a-fA-F-]{36}/);
    expect(order.createdAt).toBe("2025-01-01T12:00:00.000Z");
    expect(order.customerName).toBe("Juan");
    expect(order.table).toBe("Mesa 5");
  });

  it("preserva UUID y fecha cuando ya vienen definidos", () => {
    const msg: OrderMessage = {
      id: "11111111-1111-1111-1111-111111111111",
      customerName: "Ana",
      table: "Mesa 2",
      items: [
        { productName: "Refresco", quantity: 1, unitPrice: 5000 },
      ],
      createdAt: "2024-12-31T23:59:59.000Z",
    };

    const order = createKitchenOrderFromMessage(msg);

    expect(order.id).toBe(msg.id);
    expect(order.createdAt).toBe(msg.createdAt);
    expect(order.customerName).toBe("Ana");
    expect(order.table).toBe("Mesa 2");
  });
});

// Isolated: No acceso a BD ni colas; solo transformación pura.
// Repeatable: Fecha fija via jest timers; UUID validado por regex estable.
// Self-validating: Aserciones deterministas con expect.