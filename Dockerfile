# =========================
# 1️⃣ Build stage
# =========================
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos dependencias primero para cache
COPY package.json package-lock.json* ./

RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Variables de entorno para Vite (build-time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build Vite + TypeScript
RUN npm run build


# =========================
# 2️⃣ Runtime stage (nginx)
# =========================
FROM nginx:1.27-alpine

# Cloud Run escucha en 8080
EXPOSE 8080

# Configuración nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build generado
COPY --from=build /app/dist /usr/share/nginx/html

# Arranque para Cloud Run
CMD ["nginx", "-g", "daemon off;"]
