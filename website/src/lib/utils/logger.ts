import * as Sentry from '@sentry/nextjs';

type LogAttributes = Record<string, unknown>;

type AlertOptions = {
	tags?: Record<string, string>;
	extra?: Record<string, unknown>;
	component?: string;
};

const formatMessage = (msg: unknown): string => {
	if (msg instanceof Error) {
		return msg.message;
	}
	return typeof msg === 'string' ? msg : JSON.stringify(msg);
};

const sendToSentry = (level: 'debug' | 'info' | 'warning' | 'error', message: string, attributes?: LogAttributes) => {
	Sentry.captureMessage(message, {
		level,
		extra: attributes ?? {},
	});
};

const sendExceptionToSentry = (err: unknown, extra?: Record<string, unknown>) => {
	const exception = err instanceof Error ? err : new Error(String(err));
	Sentry.captureException(exception, { extra });
};

export const logger = {
	debug(message: unknown, attributes?: LogAttributes) {
		const msg = formatMessage(message);
		console.debug({ message: msg }, attributes);
		sendToSentry('debug', msg, attributes);
	},

	info(message: unknown, attributes?: LogAttributes) {
		const msg = formatMessage(message);
		attributes ? console.info({ message: msg, ...attributes }) : console.info({ message: msg });
		sendToSentry('info', msg, attributes);
	},

	warn(message: unknown, attributes?: LogAttributes) {
		const msg = formatMessage(message);
		attributes ? console.warn({ message: msg, ...attributes }) : console.warn({ message: msg });
		sendToSentry('warning', msg, attributes);
	},

	error(error: unknown, attributes?: LogAttributes) {
		const msg = formatMessage(error);
		attributes ? console.error({ message: msg, ...attributes }) : console.error({ message: msg });
		sendExceptionToSentry(error, attributes);
	},

	alert(error: unknown, attributes?: LogAttributes, alertOptions?: AlertOptions) {
		const exception = error instanceof Error ? error : new Error(String(error));
		attributes
			? console.error({ message: exception.message, ...attributes })
			: console.error({ message: exception.message });

		Sentry.captureException(exception, {
			tags: {
				alert: 'true',
				component: alertOptions?.component ?? 'unknown',
				...alertOptions?.tags,
			},
			extra: {
				...attributes,
				...alertOptions?.extra,
			},
		});
	},
};
