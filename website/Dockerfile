# -------- Base Layer --------
FROM node:22-alpine AS base
WORKDIR /app

RUN --mount=type=secret,id=BASE_URL \
    --mount=type=secret,id=FIREBASE_DATABASE_URL \
    --mount=type=secret,id=FIREBASE_SERVICE_ACCOUNT_JSON \
    --mount=type=secret,id=GITHUB_PAT \
    --mount=type=secret,id=MAILCHIMP_API_KEY \
    --mount=type=secret,id=MAILCHIMP_LIST_ID \
    --mount=type=secret,id=MAILCHIMP_SERVER \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_API_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_APP_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    --mount=type=secret,id=NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    --mount=type=secret,id=SENDGRID_API_KEY \
    --mount=type=secret,id=SENDGRID_LIST_ID \
    --mount=type=secret,id=SENDGRID_SUPPRESSION_LIST_ID \
    --mount=type=secret,id=STORYBLOK_PREVIEW_SECRET \
    --mount=type=secret,id=STORYBLOK_PREVIEW_TOKEN \
    --mount=type=secret,id=STRIPE_PRODUCT_ONETIME \
    --mount=type=secret,id=STRIPE_PRODUCT_RECURRING \
    --mount=type=secret,id=STRIPE_SECRET_KEY \
    sh -c 'for f in /run/secrets/*; do echo "$(basename $f)=$(cat $f)" >> /app/.env; done'

# -------- Dependencies Layer --------
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY . .
RUN npm ci

# -------- Build Layer --------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app /app

RUN set -a && . /app/.env && set +a && \
    npx prisma generate --schema=shared/src/database/schema.prisma && \
    npm --workspace=@socialincome/website run build --loglevel verbose || (echo "🚨 Build failed. Printing log:" && cat /root/.npm/_logs/*-debug-0.log && false)

# -------- Runtime Layer --------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/website/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app /app
COPY --from=base /app/.env .env

USER nextjs

CMD ["sh", "-c", "set -a && . .env && set +a && npx prisma migrate deploy --schema=./shared/src/database/schema.prisma && node website/.next/standalone/server.js"]