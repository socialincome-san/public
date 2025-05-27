# -------- Base Layer --------
FROM node:22-alpine AS base
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG FIREBASE_SERVICE_ACCOUNT_JSON
ARG FIREBASE_DATABASE_URL

ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV FIREBASE_SERVICE_ACCOUNT_JSON=$FIREBASE_SERVICE_ACCOUNT_JSON
ENV FIREBASE_DATABASE_URL=$FIREBASE_DATABASE_URL

# -------- Dependencies Layer --------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
COPY portal ./portal
COPY shared ./shared
COPY ui ./ui
COPY functions ./functions
COPY admin ./admin
RUN npm ci

# -------- Build Layer --------
FROM base AS builder
WORKDIR /app/portal
COPY --from=deps /app/node_modules ../node_modules
COPY --from=deps /app/portal ./
COPY --from=deps /app/shared ../shared
COPY --from=deps /app/ui ../ui

RUN npx prisma generate
RUN npm run build --loglevel verbose || (cat /root/.npm/_logs/*-debug-0.log && false)

# -------- Runtime Layer --------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/portal/public ./public
COPY --from=builder /app/portal/prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/portal/.next/static ./.next/static

USER nextjs

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node server.js"]