/**
 * Retry a function until it succeeds or the number of retries is exceeded.
 * @param fn: The function that should be retried
 * @param retriesLeft: Number of retries left
 * @param interval: Interval in milliseconds between retries
 * @param onError: Triggered in case of error / retry
 */
export async function retry<T>(
	fn: () => Promise<T>,
	retriesLeft: number = 5,
	interval: number = 1000,
	onError: (error: unknown) => void = () => {}
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		onError(error);
		if (retriesLeft) {
			await new Promise((resolve) => setTimeout(resolve, interval));
			return retry(fn, retriesLeft - 1, interval);
		}
		throw error;
	}
}
