// Verify Singleton behavior for AMQP adapter/connection
jest.mock("../adapters/rabbit.adapter", () => {
  class FakeRabbitAdapter {
    public id: number;
    constructor() {
      this.id = Math.random();
    }
  }
  return { FakeRabbitAdapter };
});

import * as amqpModule from "../amqp";

describe("AMQP Singleton (getInstance)", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("devuelve la misma referencia en múltiples llamadas", async () => {
    const a1 = await amqpModule.getChannel();
    const a2 = await amqpModule.getChannel();

    // El canal/instancia subyacente debe ser la misma
    expect(a1).toBe(a2);
  });
});

// Isolated: Se mockean módulos externos; no hay conexión real a RabbitMQ.
// Repeatable: Sin aleatoriedad en la unidad bajo prueba; sólo comparación de referencia.
// Self-validating: expect(a1).toBe(a2) valida singleton.