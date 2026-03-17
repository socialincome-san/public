const fallbackErrorMessage = 'An unexpected error occurred while saving.';

export const retrieveErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}

	return fallbackErrorMessage;
};
