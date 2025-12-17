# orders-producer-node/Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies and build TypeScript
COPY package*.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

# Only production dependencies and compiled output
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist

EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/index.js"]
