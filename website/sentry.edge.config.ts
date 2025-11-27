import * as Sentry from '@sentry/nextjs';
import { baseSentryConfig } from './sentry.base.config';

if (process.env.NODE_ENV !== 'development') {
	Sentry.init({
		...baseSentryConfig,
	});
}
