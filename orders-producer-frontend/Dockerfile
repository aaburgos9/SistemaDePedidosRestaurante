# orders-producer-frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copiamos todo (src, public, etc.)
COPY . .

EXPOSE 8080

# Usa el puerto de la variable de entorno PORT o 8080 por defecto
ENV PORT=8080

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "${PORT}"]
