FROM node:20-alpine3.16 AS base

# Base dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Builder: Generate Prisma client and build app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client for correct binary target
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Final stage: Production-ready image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy files needed at runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

# Run migrations + start app
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node server.js"]
