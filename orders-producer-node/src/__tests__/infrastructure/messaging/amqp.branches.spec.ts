// Ensure env mutation doesn't leak
const ORIGINAL_ENV = { ...process.env };

function createChannelMock() {
  return {
    assertQueue: jest.fn().mockResolvedValue({}),
    prefetch: jest.fn(),
    ack: jest.fn(),
    nack: jest.fn(),
    sendToQueue: jest.fn(),
    checkQueue: jest.fn().mockResolvedValue({ messageCount: 0 }),
  } as any;
}

const mockConnect = jest.fn();
const mockCreateChannel = jest.fn();

jest.mock("amqplib", () => ({
  connect: (...args: any[]) => mockConnect(...args),
}));

describe("amqp.ts branch coverage", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    Object.assign(process.env, ORIGINAL_ENV);
    
    mockCreateChannel.mockResolvedValue(createChannelMock());
    mockConnect.mockResolvedValue({
      createChannel: mockCreateChannel,
    });
  });

  afterEach(() => {
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it("uses local connection when AMQP_CONNECTION_TYPE != cloud", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_PROTOCOL = "amqp";
    process.env.AMQP_LOCAL_HOST = "localhost";
    process.env.AMQP_LOCAL_PORT = "5672";
    process.env.AMQP_LOCAL_USER = "guest";
    process.env.AMQP_LOCAL_PASS = "guest";

    const { getChannel } = require("../../../infrastructure/messaging/amqp.connection");
    const ch = await getChannel();
    
    expect(ch.assertQueue).toBeDefined();
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        protocol: "amqp",
        hostname: "localhost",
        port: 5672,
      })
    );
  });

  it("uses cloud connection when AMQP_CONNECTION_TYPE = cloud", async () => {
    process.env.AMQP_CONNECTION_TYPE = "cloud";
    process.env.AMQP_CLOUD_PROTOCOL = "amqps";
    process.env.AMQP_CLOUD_HOST = "cloud.example";
    process.env.AMQP_CLOUD_PORT = "5671";
    process.env.AMQP_CLOUD_USER = "user";
    process.env.AMQP_CLOUD_PASS = "pass";
    process.env.AMQP_CLOUD_VHOST = "/vhost";

    const { getChannel } = require("../../../infrastructure/messaging/amqp.connection");
    const ch = await getChannel();
    
    expect(ch.prefetch).toBeDefined();
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        protocol: "amqps",
        hostname: "cloud.example",
        port: 5671,
        vhost: "/vhost",
      })
    );
  });

  it("reuses the same channel instance (singleton cache)", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_PROTOCOL = "amqp";
    process.env.AMQP_LOCAL_HOST = "localhost";

    const { getChannel } = require("../../../infrastructure/messaging/amqp.connection");
    const a = await getChannel();
    const b = await getChannel();
    expect(a).toBe(b);
    expect(mockCreateChannel).toHaveBeenCalledTimes(1);
  });

  it("throws error when connection fails", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    mockConnect.mockRejectedValueOnce(new Error("connection failed"));

    const { getChannel } = require("../../../infrastructure/messaging/amqp.connection");
    await expect(getChannel()).rejects.toThrow("connection failed");
  });

  it("throws error when createChannel fails", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    mockCreateChannel.mockRejectedValueOnce(new Error("channel creation failed"));

    const { getChannel } = require("../../../infrastructure/messaging/amqp.connection");
    await expect(getChannel()).rejects.toThrow("channel creation failed");
  });

  it("covers sendToDLQ primary path", async () => {
    const mockChannel = createChannelMock();
    const { sendToDLQ } = require("../../../infrastructure/messaging/amqp.connection");
    
    await sendToDLQ(mockChannel, "dlq.test", Buffer.from("test"));
    
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("dlq.test", { durable: true });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "dlq.test",
      Buffer.from("test"),
      { persistent: true }
    );
  });

  it("covers sendToDLQ fallback error path when both fail", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    
    const { getChannel } = require("../../../infrastructure/messaging/amqp.connection");
    
    // Prime the singleton
    await getChannel();
    
    const failingChannel = {
      assertQueue: jest.fn().mockRejectedValue(new Error("channel down")),
      sendToQueue: jest.fn(),
    } as any;
    
    // Mock singleton's sendToQueue to also throw, covering inner catch + rethrow (lines 100-101)
    const originalMock = mockCreateChannel.getMockImplementation();
    mockCreateChannel.mockResolvedValueOnce({
      ...createChannelMock(),
      assertQueue: jest.fn().mockRejectedValueOnce(new Error("dlq fallback failed")),
    });
    
    // Clear existing cached channel to force new one
    jest.resetModules();
    const { sendToDLQ: sendToDLQ2 } = require("../../../infrastructure/messaging/amqp.connection");
    
    await expect(sendToDLQ2(failingChannel, "dlq.fallback2", Buffer.from("fb2")))
      .rejects.toThrow();

    // Restore
    if (originalMock) mockCreateChannel.mockImplementation(originalMock);
  });

  it("covers sendToDLQ fallback path using instance.sendToQueue", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_HOST = "localhost";
    
    jest.resetModules();
    const mockChannel = createChannelMock();
    
    mockCreateChannel.mockResolvedValue(mockChannel);
    
    const { sendToDLQ, getChannel } = require("../../../infrastructure/messaging/amqp.connection");
    
    // Initialize the connection first
    await getChannel();
    
    // Create a failing channel to trigger fallback
    const failingChannel = {
      assertQueue: jest.fn().mockRejectedValue(new Error("channel assertQueue failed")),
      sendToQueue: jest.fn(),
    };
    
    // Reset the mock to allow successful assertQueue for fallback
    mockChannel.assertQueue.mockClear();
    mockChannel.assertQueue.mockResolvedValue({});
    mockChannel.sendToQueue.mockClear();
    
    await sendToDLQ(failingChannel, "fallback.queue", Buffer.from("fallback test"));
    
    // The fallback should have called instance's sendToQueue
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("fallback.queue", { durable: true });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "fallback.queue",
      Buffer.from("fallback test"),
      { persistent: true }
    );
  });

  it("covers early return when connection already exists", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_HOST = "localhost";
    
    jest.resetModules();
    const mockChannel = createChannelMock();
    mockCreateChannel.mockResolvedValue(mockChannel);
    
    // Directly require the module to access RabbitMQConnection internals
    const amqpModule = require("../../../infrastructure/messaging/amqp.connection");
    
    // First call establishes connection
    await amqpModule.getChannel();
    
    // Verify connection was made
    expect(mockConnect).toHaveBeenCalledTimes(1);
    
    // Call getChannel again - this will call getChannel on the instance
    // which calls connect(), and connect() should early return at line 27
    await amqpModule.getChannel();
    
    // connect should still only be called once (proving early return worked)
    expect(mockConnect).toHaveBeenCalledTimes(1);
    
    // Now trigger connect() explicitly multiple times through getChannel
    // The channel is cached, but we can force connection checks
    const channel3 = await amqpModule.getChannel();
    const channel4 = await amqpModule.getChannel();
    
    // All should return same channel, connect only called once
    expect(mockChannel).toBe(channel3);
    expect(mockChannel).toBe(channel4);
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it("covers error when connection is not established after connect", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    
    jest.resetModules();
    
    // Mock connect to set connection to null (simulates failure to establish)
    mockConnect.mockResolvedValueOnce(null);
    
    const { getChannel } = require("../../../infrastructure/messaging/amqp.connection");
    
    // This should trigger line 66: "AMQP connection is not established"
    await expect(getChannel()).rejects.toThrow("AMQP connection is not established");
  });

  it("covers error when channel creation returns null", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    
    jest.resetModules();
    mockCreateChannel.mockResolvedValueOnce(null);
    
    const { getChannel } = require("../../../infrastructure/messaging/amqp.connection");
    
    // This should trigger line 72: "Canal AMQP no fue creado correctamente"
    await expect(getChannel()).rejects.toThrow("Canal AMQP no fue creado correctamente");
  });

  it("covers direct call to instance.sendToQueue method (line 77)", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_HOST = "localhost";
    
    jest.resetModules();
    const mockChannel = createChannelMock();
    mockCreateChannel.mockResolvedValue(mockChannel);
    
    // Import and get the singleton instance
    const amqpModule = require("../../../infrastructure/messaging/amqp.connection");
    
    // If we can't access the class directly, use getChannel to initialize
    await amqpModule.getChannel();
    
    // Try to access instance through module inspection or reflection
    // Since instance is private, we'll trigger sendToQueue via the sendToDLQ fallback
    // but with a successful second attempt that actually uses instance.sendToQueue
    const failingChannel = {
      assertQueue: jest.fn().mockRejectedValue(new Error("channel down")),
      sendToQueue: jest.fn(),
    };
    
    // This should trigger the fallback that calls instance.sendToQueue (line 77-81)
    await amqpModule.sendToDLQ(failingChannel, "test.dlq", Buffer.from("test"));
    
    // Verify the singleton's channel was used
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("test.dlq", { durable: true });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "test.dlq",
      Buffer.from("test"),
      { persistent: true }
    );
  });
});// FIRST: Isolated (amqplib mocked), Repeatable (env controlled), Self-validating (expects).