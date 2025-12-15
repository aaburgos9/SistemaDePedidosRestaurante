import * as amqp from "amqplib";

jest.mock("amqplib", () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn(),
      prefetch: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
      sendToQueue: jest.fn(),
      checkQueue: jest.fn().mockResolvedValue({ messageCount: 0 }),
    }),
  }),
}));

import { getChannel } from "../../../infrastructure/messaging/amqp.connection";

describe("AMQP Singleton - failure path", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("propaga error si createChannel falla y no se reintenta aquí (unitario)", async () => {
    (amqp.connect as jest.Mock).mockResolvedValueOnce({
      createChannel: jest.fn().mockRejectedValue(new Error("channel failed")),
    });

    await expect(getChannel()).rejects.toThrow("channel failed");
  });
});

// Isolated: RabbitMQ totalmente mockeado.
// Repeatable: Errores simulados deterministas.
// Self-validating: Expecta excepción específica.