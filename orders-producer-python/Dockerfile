# orders-producer-python/Dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Copiamos requirements
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código de la app (tu carpeta app/)
COPY app ./app

ENV PYTHONPATH=/app

EXPOSE 8080
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
