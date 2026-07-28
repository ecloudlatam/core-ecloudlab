FROM node:24-alpine AS base
RUN corepack enable

# 1. Instalar dependencias completas (dev + prod)
FROM base AS install
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install

# 2. Compilar NestJS
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=install /app/node_modules ./node_modules
RUN pnpm build

# 3. Solo dependencias de producción (ignoramos scripts de lifecycle como Husky)
FROM base AS production-deps
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts

# 4. Imagen final ligera
FROM base AS deploy
WORKDIR /app
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["node", "dist/main.js"]