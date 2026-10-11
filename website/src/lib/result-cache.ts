import { cacheLife } from 'next/cache';
import type { Result } from './result';

// Call inside a 'use cache' scope. Failures expire within minutes so an outage does not stick for a full
// revalidation period; a 404 is an answer and caches like a success.
export const cacheResult = async <T>(pending: Promise<Result<T>>): Promise<Result<T>> => {
	const result = await pending;
	if (result.success || result.status === 404) {
		cacheLife('default');
	} else {
		cacheLife('minutes');
	}

	return result;
};
