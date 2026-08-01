FROM node:24-alpine AS base
RUN corepack enable
ENV CI=true
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 1. Instalar dependencias completas
FROM base AS install
WORKDIR /app
COPY package*.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# 2. Compilar NestJS
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=install /app/node_modules ./node_modules
RUN pnpm build

# 3. Solo dependencias de producción
FROM base AS production-deps
WORKDIR /app
COPY package*.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 4. Imagen final ligera
FROM base AS deploy
WORKDIR /app
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["node", "dist/main.js"]