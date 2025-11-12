import type { Log, ParameterizedString, Scope } from '@sentry/core';
import { captureException, logger as sentryLogger } from '@sentry/core';

type CaptureLogMetadata = {
	scope?: Scope;
};

type AlertOptions = {
	tags?: Record<string, string>;
	extra?: Record<string, any>;
	component?: string;
};

const formatMessage = (message: ParameterizedString | unknown): ParameterizedString =>
	(message instanceof Error ? message.message : String(message)) as ParameterizedString;

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
	debug: (message: ParameterizedString | unknown, attributes?: Log['attributes'], metadata?: CaptureLogMetadata) => {
		const msg = formatMessage(message);
		if (isDev) console.debug(msg, attributes);
		return sentryLogger.debug(msg, attributes, metadata);
	},
	info: (message: ParameterizedString | unknown, attributes?: Log['attributes'], metadata?: CaptureLogMetadata) => {
		const msg = formatMessage(message);
		if (isDev) console.info(msg, attributes);
		return sentryLogger.info(msg, attributes, metadata);
	},
	warn: (message: ParameterizedString | unknown, attributes?: Log['attributes'], metadata?: CaptureLogMetadata) => {
		const msg = formatMessage(message);
		if (isDev) console.warn(msg, attributes);
		return sentryLogger.warn(msg, attributes, metadata);
	},
	error: (error: ParameterizedString | unknown, attributes?: Log['attributes'], metadata?: CaptureLogMetadata) => {
		const msg = formatMessage(error);
		if (isDev) console.error(msg, attributes);
		return sentryLogger.error(msg, attributes, metadata);
	},
	alert: (error: ParameterizedString | unknown, attributes?: Log['attributes'], alertOptions?: AlertOptions) => {
		const msg = formatMessage(error);
		if (isDev) console.error('🚨', msg, attributes);
		sentryLogger.error(msg, attributes);

		const exception = error instanceof Error ? error : new Error(String(error));
		captureException(exception, {
			tags: { alert: 'true', component: alertOptions?.component || 'unknown', ...alertOptions?.tags },
			extra: { ...attributes, ...alertOptions?.extra },
		});
	},
};
