FROM node:20-bookworm-slim AS build

WORKDIR /app

# Install OpenSSL before Prisma Client generation so Prisma selects the Debian 12 engine.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Install from the committed lockfile for repeatable builds.
COPY package*.json ./
RUN npm ci

# Prisma needs its schema to generate the client used by the API.
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# These placeholders are only for Prisma client generation during image build.
# Supply real database credentials when the container runs.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/protrack?schema=public"
ENV DIRECT_URL="postgresql://build:build@localhost:5432/protrack?schema=public"

RUN npm run prisma:generate \
    && npm run build \
    && npm prune --omit=dev

FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Prisma's query engine needs the matching OpenSSL runtime library.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy only the compiled API, Prisma schema, and pruned runtime dependencies.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 5000

CMD ["node", "dist/index.js"]
