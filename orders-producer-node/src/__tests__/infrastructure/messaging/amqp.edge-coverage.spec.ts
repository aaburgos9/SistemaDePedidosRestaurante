// Edge case tests to cover hard-to-reach lines in amqp.ts (lines 27, 77)
// These tests use reflection and special mocking techniques

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

describe("amqp.ts edge coverage for lines 27 and 77", () => {
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

  it("covers line 27: early return when connection already exists", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_HOST = "localhost";

    const amqpModule = require("../../../infrastructure/messaging/amqp.connection");
    
    // First call establishes connection
    await amqpModule.getChannel();
    
    // Verify connection was made
    expect(mockConnect).toHaveBeenCalledTimes(1);
    
    // Now call connect() again when connection already exists
    // This should hit the early return at line 25: if (this.connection) return;
    await amqpModule._callConnectForTesting();
    
    // Verify amqp.connect was still only called once (early return worked)
    expect(mockConnect).toHaveBeenCalledTimes(1);
    
    // Call connect multiple more times to be absolutely sure
    await amqpModule._callConnectForTesting();
    await amqpModule._callConnectForTesting();
    await amqpModule._callConnectForTesting();
    
    // Still only one amqp.connect call - the early return is working
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it("covers line 77: sendToQueue method via direct fallback invocation", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_HOST = "localhost";

    const mockChannel = createChannelMock();
    mockCreateChannel.mockResolvedValue(mockChannel);

    const amqpModule = require("../../../infrastructure/messaging/amqp.connection");
    
    // Initialize the connection
    await amqpModule.getChannel();

    // Clear mock calls
    mockChannel.assertQueue.mockClear();
    mockChannel.sendToQueue.mockClear();

    // Create a failing channel to force the sendToDLQ fallback
    const failingChannel = {
      assertQueue: jest.fn().mockRejectedValue(new Error("primary channel failed")),
      sendToQueue: jest.fn(),
    };

    // Call sendToDLQ which will fail on primary, then call instance.sendToQueue (line 98 -> 77)
    await amqpModule.sendToDLQ(failingChannel, "edge.dlq", Buffer.from("test"));

    // The instance.sendToQueue method (line 77) should have been executed
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("edge.dlq", { durable: true });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "edge.dlq",
      Buffer.from("test"),
      { persistent: true }
    );
  });

  it("covers line 77: direct sendToQueue execution via getInstance", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_HOST = "localhost";

    const mockChannel = createChannelMock();
    mockCreateChannel.mockResolvedValue(mockChannel);

    const amqpModule = require("../../../infrastructure/messaging/amqp.connection");
    
    // Get instance
    const instance = amqpModule._getInstanceForTesting();
    
    // Call sendToQueue directly on the instance to ensure line 77 is covered
    await instance.sendToQueue("direct.queue", Buffer.from("payload"), { persistent: true });

    // Verify the method body executed
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("direct.queue", { durable: true });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "direct.queue",
      Buffer.from("payload"),
      { persistent: true }
    );
  });

  it("covers line 75: sendToQueue without optional parameter (default branch)", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_HOST = "localhost";

    const mockChannel = createChannelMock();
    mockCreateChannel.mockResolvedValue(mockChannel);

    const amqpModule = require("../../../infrastructure/messaging/amqp.connection");
    
    // Get instance
    const instance = amqpModule._getInstanceForTesting();
    
    // Call sendToQueue WITHOUT the optional opts parameter to cover default branch
    await instance.sendToQueue("default.queue", Buffer.from("data"));

    // Verify the method executed with default opts = {}
    expect(mockChannel.assertQueue).toHaveBeenCalledWith("default.queue", { durable: true });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      "default.queue",
      Buffer.from("data"),
      {} // Default empty opts
    );
  });

  it("covers line 83: _resetChannelForTesting method", async () => {
    process.env.AMQP_CONNECTION_TYPE = "local";
    process.env.AMQP_LOCAL_HOST = "localhost";

    const amqpModule = require("../../../infrastructure/messaging/amqp.connection");
    
    // Establish connection and channel
    const channel1 = await amqpModule.getChannel();
    expect(channel1).toBeDefined();
    
    // Get instance
    const instance = amqpModule._getInstanceForTesting();
    
    // Call the reset method (line 83: this.channel = null;)
    instance._resetChannelForTesting();
    
    // Get channel again - should create a new one
    const channel2 = await amqpModule.getChannel();
    expect(channel2).toBeDefined();
  });
});

// FIRST: Fast (isolated modules), Isolated (resetModules), Repeatable (env control), 
// Self-validating (expects), Timely (edge cases tested)
