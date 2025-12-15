import { RabbitMQAdapter } from "../../../infrastructure/messaging/rabbit.adapter";
import * as amqp from "../../../infrastructure/messaging/amqp.connection";

jest.mock("../../../infrastructure/messaging/amqp.connection");

const mockChannel = {
  assertQueue: jest.fn().mockResolvedValue({}),
  sendToQueue: jest.fn(),
};

describe("RabbitMQAdapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (amqp.getChannel as jest.Mock).mockResolvedValue(mockChannel);
  });

  it("publica mensaje como Buffer", async () => {
    const adapter = new RabbitMQAdapter("test.queue");
    const payload = Buffer.from("test message");

    await adapter.publish("test.queue", payload);

    expect(mockChannel.assertQueue).toHaveBeenCalledWith("test.queue", { durable: true });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "test.queue",
      payload,
      { persistent: true }
    );
  });

  it("convierte string a Buffer antes de publicar", async () => {
    const adapter = new RabbitMQAdapter("test.queue");
    const payload = "string message";

    await adapter.publish("test.queue", payload);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "test.queue",
      Buffer.from(payload),
      { persistent: true }
    );
  });

  it("usa queueName del constructor si no se especifica en publish", async () => {
    const adapter = new RabbitMQAdapter("default.queue");

    await adapter.publish("", "test");

    expect(mockChannel.assertQueue).toHaveBeenCalledWith("default.queue", { durable: true });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "default.queue",
      expect.any(Buffer),
      { persistent: true }
    );
  });
});
