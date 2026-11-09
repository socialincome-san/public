'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Returns undefined until the promise resolves. Unlike `use()` with Suspense, this never remounts the caller, so it
// does not flash a fallback while request data streams in. One store per value type keeps the cache typed.
export const createResolvedPromiseHook = <T>() => {
	const resolved = new WeakMap<Promise<T>, { value: T }>();

	const useResolvedPromise = (promise: Promise<T>) => {
		const subscribe = useCallback(
			(onChange: () => void) => {
				let subscribed = true;
				void promise.then((value) => {
					resolved.set(promise, { value });
					if (subscribed) {
						onChange();
					}
				});

				return () => {
					subscribed = false;
				};
			},
			[promise],
		);

		return useSyncExternalStore(
			subscribe,
			() => resolved.get(promise),
			() => undefined,
		);
	};

	return useResolvedPromise;
};
