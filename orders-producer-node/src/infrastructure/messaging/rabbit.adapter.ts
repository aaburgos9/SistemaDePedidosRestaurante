import { getChannel } from "./amqp.connection";

export interface MessageBroker {
  publish(queue: string, payload: Buffer | string): Promise<void>;
}

export class RabbitMQAdapter implements MessageBroker {
  private queueName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  async publish(_queue: string, payload: Buffer | string): Promise<void> {
    const channel = await getChannel();
    const q = _queue || this.queueName;
    await channel.assertQueue(q, { durable: true });
    const buf = Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload));
    channel.sendToQueue(q, buf, { persistent: true });
  }
}
