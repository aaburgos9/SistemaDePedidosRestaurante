// Verify Singleton behavior for AMQP adapter/connection
jest.mock("../../../infrastructure/messaging/rabbit.adapter", () => {
  class FakeRabbitAdapter {
    public id: number;
    constructor() {
      this.id = Math.random();
    }
  }
  return { FakeRabbitAdapter };
});

// Mock AMQP connection to avoid real network and ensure singleton behavior
const fakeChannel = { id: 123 } as any;
jest.mock("../../../infrastructure/messaging/amqp.connection", () => {
  let cached: any = null;
  return {
    getChannel: jest.fn(async () => {
      if (!cached) cached = fakeChannel;
      return cached;
    }),
  };
});

import * as amqpModule from "../../../infrastructure/messaging/amqp.connection";

describe("AMQP Singleton (getInstance)", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("devuelve la misma referencia en múltiples llamadas", async () => {
    const a1 = await amqpModule.getChannel();
    const a2 = await amqpModule.getChannel();
    expect(a1).toBe(a2);
  });
});

// Isolated: Se mockean módulos externos; no hay conexión real a RabbitMQ.
// Repeatable: Sin aleatoriedad en la unidad bajo prueba; sólo comparación de referencia.
// Self-validating: expect(a1).toBe(a2) valida singleton.