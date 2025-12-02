from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Orders Producer Python"
    CLOUDAMQP_URL: str                     # amqps://USER:PASS@HOST/VHOST
    ORDERS_QUEUE: str = "orders.new"

    # Configuración de pydantic-settings
    model_config = SettingsConfigDict(
        env_file=".env",       # lee variables del .env en la raíz del proyecto
        extra="ignore",        # ignora variables de entorno extra
    )

settings = Settings()

