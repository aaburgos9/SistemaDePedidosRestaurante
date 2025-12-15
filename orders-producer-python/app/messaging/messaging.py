import pika
from app.config import settings
from app.models.order import OrderMessage

def publish_order(order: OrderMessage) -> None:
    """
    Publica un pedido a RabbitMQ creando una conexión nueva por cada llamada.
    Esto evita problemas de conexiones cerradas o timeouts.
    """
    params = pika.URLParameters(settings.CLOUDAMQP_URL)
    params.heartbeat = 30
    
    # Context managers aseguran cierre correcto de recursos
    with pika.BlockingConnection(params) as connection:
        with connection.channel() as channel:
            channel.queue_declare(queue=settings.ORDERS_QUEUE, durable=True)
            
            body = order.model_dump_json().encode("utf-8")
            channel.basic_publish(
                exchange="",
                routing_key=settings.ORDERS_QUEUE,
                body=body,
                properties=pika.BasicProperties(delivery_mode=2),
            )