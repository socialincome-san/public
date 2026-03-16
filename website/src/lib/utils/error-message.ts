type ErrorMessageOptions = {
	fallbackMessage?: string;
	serializeUnknown?: boolean;
};

export const getErrorMessage = (error: unknown, options: ErrorMessageOptions = {}): string => {
	const { fallbackMessage = 'An unexpected error occurred while saving.', serializeUnknown = false } = options;
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	if (serializeUnknown) {
		try {
			return JSON.stringify(error);
		} catch {
			return fallbackMessage;
		}
	}

	return fallbackMessage;
};
