import type { ServiceResult } from './service-result';

export const handleServiceResult = <T>(
	result: ServiceResult<T>,
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
