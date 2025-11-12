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

export const logger = {
	debug: (message: ParameterizedString | unknown, attributes?: Log['attributes'], metadata?: CaptureLogMetadata) =>
		sentryLogger.debug(formatMessage(message), attributes, metadata),
	info: (message: ParameterizedString | unknown, attributes?: Log['attributes'], metadata?: CaptureLogMetadata) =>
		sentryLogger.info(formatMessage(message), attributes, metadata),
	warn: (message: ParameterizedString | unknown, attributes?: Log['attributes'], metadata?: CaptureLogMetadata) =>
		sentryLogger.warn(formatMessage(message), attributes, metadata),
	error: (error: ParameterizedString | unknown, attributes?: Log['attributes'], metadata?: CaptureLogMetadata) =>
		sentryLogger.error(formatMessage(error), attributes, metadata),

	alert: (error: ParameterizedString | unknown, attributes?: Log['attributes'], alertOptions?: AlertOptions) => {
		sentryLogger.error(formatMessage(error), attributes);

		const exception = error instanceof Error ? error : new Error(String(error));

		captureException(exception, {
			tags: {
				alert: 'true',
				component: alertOptions?.component || 'unknown',
				...alertOptions?.tags,
			},
			extra: {
				...attributes,
				...alertOptions?.extra,
			},
		});
	},
};
