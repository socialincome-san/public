import { useCallback, useSyncExternalStore } from 'react';

// The server and hydration use `serverValue`, so markup always matches; the real value follows right after
export const useMediaQuery = (query: string, serverValue: boolean) => {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const list = window.matchMedia(query);
			list.addEventListener('change', onChange);

			return () => list.removeEventListener('change', onChange);
		},
		[query],
	);

	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => serverValue,
	);
};

// Assumes reduced motion until the client knows, so the first render is always the still version
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)', true);
