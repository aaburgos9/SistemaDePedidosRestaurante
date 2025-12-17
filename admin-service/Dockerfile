
# Etapa de build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Etapa final (solo dependencias de producción y artefactos compilados)
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
