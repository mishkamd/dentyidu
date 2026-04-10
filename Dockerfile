# ── Base: shared OS deps ────────────────────────────────────────────────────────
FROM node:20-slim AS base

# openssl  → required by Prisma client
# wget     → used by Docker healthcheck
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Dependencies ────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ── Builder ─────────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client from schema
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
# Dummy URL — only satisfies Prisma/Next.js build validation, never used at runtime
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

RUN npm run build

# ── Runner (production) ──────────────────────────────────────────────────────────
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user in a single layer
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Prerender cache + upload dirs — set permissions in one layer
RUN mkdir -p .next src/app/image public/uploads \
    && chown -R nextjs:nodejs .next src/app/image public/uploads

# Standalone output only — minimal footprint
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
