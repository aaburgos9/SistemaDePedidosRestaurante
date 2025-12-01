import * as amqp from "../amqp";
import * as wsServer from "../wsServer";
import * as kitchenController from "../controllers/kitchen.controller";
import { createCalculatorFromMongo } from "../config/preparation.config";

// Mocks
jest.mock("../amqp");
jest.mock("../wsServer");
jest.mock("../controllers/kitchen.controller");
jest.mock("../config/preparation.config");
jest.mock('ws');

const mockChannel = {
  assertQueue: jest.fn().mockResolvedValue({}),
  prefetch: jest.fn(),
  consume: jest.fn(),
  ack: jest.fn(),
  nack: jest.fn(),
  sendToQueue: jest.fn().mockResolvedValue(undefined),
  checkQueue: jest.fn(),
};

const mockCalculator = {
  calculate: jest.fn().mockReturnValue(1),
};

describe("worker.ts - startWorker", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    
    (amqp.getChannel as jest.Mock).mockResolvedValue(mockChannel);
    (amqp.sendToDLQ as jest.Mock).mockResolvedValue(undefined);
    (createCalculatorFromMongo as jest.Mock).mockResolvedValue(mockCalculator);
    (wsServer.notifyClients as jest.Mock).mockImplementation(() => {});
    (kitchenController.addKitchenOrder as jest.Mock).mockResolvedValue(undefined);
    (kitchenController.markOrderReady as jest.Mock).mockResolvedValue(undefined);
    (kitchenController.removeOrderFromKitchen as jest.Mock).mockResolvedValue(undefined);
    mockChannel.checkQueue.mockResolvedValue({ messageCount: 1 });
    mockCalculator.calculate.mockReturnValue(1);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("inicializa calculator y channel correctamente", async () => {
    const { startWorker } = await import("../worker");
    await startWorker();

    expect(createCalculatorFromMongo).toHaveBeenCalled();
    expect(amqp.getChannel).toHaveBeenCalled();
    expect(mockChannel.consume).toHaveBeenCalledWith(
      "orders.new",
      expect.any(Function),
      { noAck: false }
    );
  });

  it("procesa mensaje completo: agrega, marca ready, remueve orden", async () => {
    const { startWorker } = await import("../worker");
    const order = {
      id: "ORD-123",
      orderId: "ORD-123",
      items: [{ productName: "Pizza", quantity: 2 }],
      table: 5,
    };

    await startWorker();

    const consumeCallback = mockChannel.consume.mock.calls[0][1];
    const mockMessage = {
      content: Buffer.from(JSON.stringify(order)),
      properties: { correlationId: "corr-abc" },
    };

    const processPromise = consumeCallback(mockMessage);
    await jest.advanceTimersByTimeAsync(2000);
    await processPromise;

    expect(kitchenController.addKitchenOrder).toHaveBeenCalled();
    expect(mockCalculator.calculate).toHaveBeenCalledWith("Pizza", 2);
    expect(kitchenController.markOrderReady).toHaveBeenCalledWith("ORD-123");
    expect(kitchenController.removeOrderFromKitchen).toHaveBeenCalledWith("ORD-123");
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
  });

  it("envia a DLQ si calculator es null", async () => {
    await jest.isolateModulesAsync(async () => {
      (createCalculatorFromMongo as jest.Mock).mockResolvedValue(null);
      const { startWorker } = await import("../worker");

      await startWorker();

      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      const orderDLQ = { id: "ORD-456", items: [{productName: "X", quantity: 1}]};
      const mockMessage = {
        content: Buffer.from(JSON.stringify(orderDLQ)),
        properties: { correlationId: "corr-xyz" },
      };

      await consumeCallback(mockMessage);
      await Promise.resolve();

      expect(amqp.sendToDLQ).toHaveBeenCalledWith(
        mockChannel,
        "orders.failed",
        expect.any(Buffer)
      );
      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
    });
  });

  it("envia a DLQ con correlationId del mensaje", async () => {
    await jest.isolateModulesAsync(async () => {
      (createCalculatorFromMongo as jest.Mock).mockResolvedValue(null);
      const { startWorker } = await import("../worker");

      await startWorker();

      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      const orderCorr = { id: "ORD-789", items: [{productName: "Y", quantity: 1}]};
      const mockMessage = {
        content: Buffer.from(JSON.stringify(orderCorr)),
        properties: { correlationId: "original-correlation-id" },
      };

      await consumeCallback(mockMessage);
      await Promise.resolve();

      expect(amqp.sendToDLQ).toHaveBeenCalledWith(
        mockChannel,
        "orders.failed",
        expect.any(Buffer)
      );
      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
    });
  });

  it("envia a DLQ sin correlationId si no existe", async () => {
    await jest.isolateModulesAsync(async () => {
      (createCalculatorFromMongo as jest.Mock).mockResolvedValue(null);
      const { startWorker } = await import("../worker");

      await startWorker();

      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      const orderNoCorr = { id: "ORD-NO-CORR", items: [{productName: "Z", quantity: 1}]};
      const mockMessage = {
        content: Buffer.from(JSON.stringify(orderNoCorr)),
        properties: {},
      };

      await consumeCallback(mockMessage);
      await Promise.resolve();

      expect(amqp.sendToDLQ).toHaveBeenCalledWith(
        mockChannel,
        "orders.failed",
        expect.any(Buffer)
      );
      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
    });
  });

  it("hace nack sin requeue si falla DLQ", async () => {
    await jest.isolateModulesAsync(async () => {
      (createCalculatorFromMongo as jest.Mock).mockResolvedValue(null);
      (amqp.sendToDLQ as jest.Mock).mockRejectedValue(new Error("DLQ unavailable"));
      const { startWorker } = await import("../worker");

      await startWorker();

      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      const orderFail = { id: "ORD-FAIL", items: [{productName: "A", quantity: 1}]};
      const mockMessage = {
        content: Buffer.from(JSON.stringify(orderFail)),
        properties: {},
      };

      await consumeCallback(mockMessage);
      await Promise.resolve();

      expect(amqp.sendToDLQ).toHaveBeenCalled();
      expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
    });
  });

  it("envia notificación cuando cola está vacía", async () => {
    mockChannel.checkQueue.mockResolvedValue({ messageCount: 0 });
    const { startWorker } = await import("../worker");

    await startWorker();

    const consumeCallback = mockChannel.consume.mock.calls[0][1];
    const order = { id: "ORD-EMPTY", items: [{ productName: "B", quantity: 1 }] };
    const mockMessage = {
      content: Buffer.from(JSON.stringify(order)),
      properties: {},
    };

    const processPromise = consumeCallback(mockMessage);
    await jest.advanceTimersByTimeAsync(2000);
    await processPromise;

    expect(wsServer.notifyClients).toHaveBeenCalledWith(
      expect.objectContaining({ type: "QUEUE_EMPTY" })
    );
  });

  it("no envía notificación de cola vacía si hay mensajes", async () => {
    mockChannel.checkQueue.mockResolvedValue({ messageCount: 5 });
    const { startWorker } = await import("../worker");

    await startWorker();

    const consumeCallback = mockChannel.consume.mock.calls[0][1];
    const order = { id: "ORD-NOT-EMPTY", items: [{ productName: "C", quantity: 1 }] };
    const mockMessage = {
      content: Buffer.from(JSON.stringify(order)),
      properties: {},
    };

    const processPromise = consumeCallback(mockMessage);
    await jest.advanceTimersByTimeAsync(2000);
    await processPromise;

    const queueEmptyCalls = (wsServer.notifyClients as jest.Mock).mock.calls.filter(
      (call) => call[0]?.type === "QUEUE_EMPTY"
    );
    expect(queueEmptyCalls.length).toBe(0);
  });

  it("maneja error durante procesamiento de orden", async () => {
    mockCalculator.calculate.mockImplementation(() => {
      throw new Error("Calculator error");
    });
    const { startWorker } = await import("../worker");

    await startWorker();

    const consumeCallback = mockChannel.consume.mock.calls[0][1];
    const orderError = { id: "ORD-ERROR", items: [{productName: "D", quantity: 1}]};
    const mockMessage = {
      content: Buffer.from(JSON.stringify(orderError)),
      properties: {},
    };

    await consumeCallback(mockMessage);

    expect(amqp.sendToDLQ).toHaveBeenCalled();
    expect(mockChannel.nack).toHaveBeenCalledWith(mockMessage, false, false);
  });

  it("parsea correctamente contenido del mensaje", async () => {
    const { startWorker } = await import("../worker");
    await startWorker();

    const consumeCallback = mockChannel.consume.mock.calls[0][1];
    const order = {
      id: "ORD-PARSE",
      items: [{ productName: "Tacos", quantity: 3 }],
      table: 7,
    };
    const mockMessage = {
      content: Buffer.from(JSON.stringify(order)),
      properties: {},
    };

    const processPromise = consumeCallback(mockMessage);
    await jest.advanceTimersByTimeAsync(2000);
    await processPromise;

    expect(mockCalculator.calculate).toHaveBeenCalledWith("Tacos", 3);
    expect(kitchenController.markOrderReady).toHaveBeenCalledWith("ORD-PARSE");
  });

  it("maneja error al inicializar el worker", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (amqp.getChannel as jest.Mock).mockRejectedValue(new Error("Channel initialization failed"));
    
    const { startWorker } = await import("../worker");
    await startWorker();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Error en el worker:",
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });

  it("maneja mensaje null sin procesar", async () => {
    const { startWorker } = await import("../worker");
    await startWorker();

    const consumeCallback = mockChannel.consume.mock.calls[0][1];
    
    // Llamar con null (caso de cierre de canal/cancelación)
    await consumeCallback(null);
    
    // No debe llamar a ninguna función de procesamiento
    expect(kitchenController.addKitchenOrder).not.toHaveBeenCalled();
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });
});
