export const baseSentryConfig = {
  dsn: 'https://3ab06c73c11cd615db9df59b15786025@o4507045017026560.ingest.us.sentry.io/4507045018992640',

  sendDefaultPii: false,
  debug: false,
  enableLogs: true,

  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
};
