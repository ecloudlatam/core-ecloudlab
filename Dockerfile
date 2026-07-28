FROM node:24-alpine AS base
RUN corepack enable

# 1. Instalación de todas las dependencias (Dev + Prod)
FROM base AS install
WORKDIR /app
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 2. Compilación del proyecto NestJS
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=install /app/node_modules ./node_modules
RUN pnpm build

# 3. Preparación de dependencias de PRODUCCIÓN (sin devDependencies)
FROM base AS production-deps
WORKDIR /app
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

# 4. Imagen final ultraligera de producción
FROM base AS deploy
WORKDIR /app
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["node", "dist/main.js"]