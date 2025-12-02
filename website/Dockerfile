# -------- Base Layer --------
FROM node:22-alpine AS base
WORKDIR /app

# This secrets are used during build time. All others are provided at runtime.
RUN --mount=type=secret,id=NEXT_PUBLIC_APP_VERSION \
    --mount=type=secret,id=NEXT_PUBLIC_APP_ENVIRONMENT \
    --mount=type=secret,id=NEXT_PUBLIC_FACEBOOK_TRACKING_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_API_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_APP_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    --mount=type=secret,id=NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID \
    --mount=type=secret,id=NEXT_PUBLIC_LINKEDIN_TRACKING_ID \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=STORYBLOK_PREVIEW_TOKEN \
    sh -c 'for f in /run/secrets/*; do echo "$(basename $f)=$(cat $f)" >> /app/.env; done'

# -------- Dependencies Layer --------
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY . .

RUN npm ci

# -------- Build Layer --------
FROM base AS builder
WORKDIR /app/website

COPY --from=deps /app/node_modules ../node_modules
COPY --from=deps /app/website ./
COPY --from=deps /app/shared ../shared
COPY --from=deps /app/ui ../ui
COPY --from=deps /app/recipients_selection ../recipients_selection
COPY --from=base /app/.env /app/.env

RUN set -a && . /app/.env && set +a && \
    npx prisma generate --schema=./src/lib/database/schema.prisma && \
    npm run build --loglevel verbose || (echo "🚨 Build failed. Printing log:" && cat /root/.npm/_logs/*-debug-0.log && false)

# -------- Runtime Layer --------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/website/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/recipients_selection ./recipients_selection
COPY --from=builder /app/website/.next/standalone ./
COPY --from=builder /app/website/.next/static ./.next/static
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/website/src ./src

COPY --from=base /app/.env .env

USER nextjs

CMD ["sh", "-c", "\
  set -a && \
  . .env && \
  set +a && \
  npx prisma migrate deploy --schema=./src/lib/database/schema.prisma && \
  node website/server.js \
"]