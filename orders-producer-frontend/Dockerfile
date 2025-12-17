# Build stage
FROM node:22-alpine as build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_GATEWAY_URL
ARG VITE_NODE_MS_URL

# Set environment variables for build
ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL
ENV VITE_NODE_MS_URL=$VITE_NODE_MS_URL

# Build the application
RUN npm run build

# Nginx stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
