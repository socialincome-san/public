import * as Sentry from '@sentry/nextjs';
import { baseSentryConfig } from './sentry.base.config';

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    ...baseSentryConfig,

    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}
