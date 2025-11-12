import type { Log, ParameterizedString, Scope } from '@sentry/core';
import { logger as sentryLogger } from '@sentry/core';

type CaptureLogMetadata = {
	scope?: Scope;
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
};
