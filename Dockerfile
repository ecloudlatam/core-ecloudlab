FROM node:24-alpine AS base
RUN corepack enable

FROM base AS install
WORKDIR /app
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=install /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --production

FROM base AS deploy
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]