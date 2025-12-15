
import * as amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

/**
 * Lightweight RabbitMQ connection manager that behaves like a safe singleton.
 * It exposes a promisified getChannel() and a helper to forward messages to a DLQ.
 * This class encapsulates reconnection/creation logic and centralizes logging.
 */
class RabbitMQConnection {
  private static instance: RabbitMQConnection | null = null;
  private connection: any = null;
  private channel: any = null;

  private constructor() {}

  static getInstance(): RabbitMQConnection {
    RabbitMQConnection.instance ??= new RabbitMQConnection();
    return RabbitMQConnection.instance;
  }

  async connect(): Promise<void> {
    if (this.connection) return;

    const type = process.env.AMQP_CONNECTION_TYPE;

    try {
      if (type === "cloud") {
        this.connection = await amqp.connect({
          protocol: process.env.AMQP_CLOUD_PROTOCOL,
          hostname: process.env.AMQP_CLOUD_HOST,
          port: Number(process.env.AMQP_CLOUD_PORT),
          username: process.env.AMQP_CLOUD_USER,
          password: process.env.AMQP_CLOUD_PASS,
          vhost: process.env.AMQP_CLOUD_VHOST,
        });
        console.log("🐇 Conexión CloudAMQP creada");
      } else {
        this.connection = await amqp.connect({
          protocol: process.env.AMQP_LOCAL_PROTOCOL,
          hostname: process.env.AMQP_LOCAL_HOST,
          port: Number(process.env.AMQP_LOCAL_PORT) || undefined,
          username: process.env.AMQP_LOCAL_USER,
          password: process.env.AMQP_LOCAL_PASS,
          locale: "en_US",
          frameMax: 0,
          heartbeat: 0,
        });
        console.log("🐇 Conexión Local AMQP creada");
      }
    } catch (err) {
      console.error("❌ Error creando conexión AMQP:", err);
      throw err;
    }
  }

  async getChannel(): Promise<any> {
    if (this.channel) return this.channel;

    if (!this.connection) await this.connect();

    if (!this.connection) throw new Error("AMQP connection is not established");

    this.channel = await this.connection.createChannel();
    console.log("📡 Canal AMQP listo");

    if (!this.channel) throw new Error("Canal AMQP no fue creado correctamente");

    return this.channel;
  }

  /** Forward a buffer payload to a named queue */
  async sendToQueue(queue: string, payload: Buffer, opts: amqp.Options.Publish = {}) {
    const ch = await this.getChannel();
    await ch.assertQueue(queue, { durable: true });
    ch.sendToQueue(queue, payload, opts);
  }

  /** Reset channel cache (for testing purposes) */
  _resetChannelForTesting(): void {
    this.channel = null;
  }
}

const instance = RabbitMQConnection.getInstance();

export async function getChannel(): Promise<any> {
  return instance.getChannel();
}

export async function sendToDLQ(channel: amqp.Channel, queue: string, payload: Buffer) {
  try {
    // prefer channel passed in (uses same connection) but ensure queue exists
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, payload, { persistent: true });
  } catch (err) {
    // fallback via singleton connection (best-effort)
    try {
      await instance.sendToQueue(queue, payload, { persistent: true });
    } catch (error_) {
      console.error("❌ failed to write to DLQ:", error_);
      throw error_;
    }
  }
}

export function _getInstanceForTesting() {
  return instance;
}

export async function _callConnectForTesting() {
  return instance.connect();
}
