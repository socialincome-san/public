import type { Result } from './result';

export const handleResult = <T>(
	result: Result<T>,
	handlers: {
		onSuccess?: (data: T) => void;
		onError?: (error: string) => void;
	},
): boolean => {
	if (result.success) {
		handlers.onSuccess?.(result.data);

		return true;
	}

	handlers.onError?.(result.error);

	return false;
};
