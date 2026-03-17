import { ServiceResult } from './base.types';

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
