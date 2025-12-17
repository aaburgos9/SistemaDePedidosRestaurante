# orders-producer-python/Dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Copiamos requirements y lo convertimos de UTF-16 a UTF-8
COPY requirements.txt .

RUN python -c "from pathlib import Path; p = Path('requirements.txt'); data = p.read_text(encoding='utf-16'); p.write_text(data, encoding='utf-8')"

RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código de la app (tu carpeta app/)
COPY app ./app

ENV PYTHONPATH=/app

EXPOSE 8080
ENV PORT=8080
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
