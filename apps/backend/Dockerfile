ARG APP_DIRNAME=backend
ARG APP_PKG_NAME=@repo/express-backend

FROM node:20-bookworm-slim AS pruner
ARG APP_PKG_NAME
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=$APP_PKG_NAME --docker
RUN find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y openssl
RUN corepack enable
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

FROM base as dev-deps
WORKDIR /app
RUN pnpm install

FROM base as production-deps
WORKDIR /app
ENV NODE_ENV production
RUN pnpm install
COPY --from=pruner /app/out/full/packages/database/prisma/schema.prisma /app/packages/database/prisma/schema.prisma
RUN pnpm dlx prisma generate --schema /app/packages/database/prisma/schema.prisma

FROM base as builder
ARG APP_PKG_NAME
WORKDIR /app
RUN corepack enable
ENV NODE_ENV production
COPY --from=pruner /app/out/full/ .
COPY --from=dev-deps /app/ .
COPY turbo.json turbo.json
RUN pnpm run generate
RUN pnpm run build --filter=$APP_PKG_NAME...

FROM base as runner
ARG APP_DIRNAME

ENV NODE_ENV production

WORKDIR /app

COPY --from=pruner /app/out/full/ .
COPY --from=production-deps /app .
COPY --from=builder /app/apps/$APP_DIRNAME/dist ./apps/$APP_DIRNAME/dist

WORKDIR /app/apps/$APP_DIRNAME

# Expose port 8080
EXPOSE 8080

# Start the app
CMD ["pnpm", "run", "start"]
