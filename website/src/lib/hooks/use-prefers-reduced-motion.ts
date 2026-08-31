'use client';

import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (onStoreChange: () => void) => {
	const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
	mediaQuery.addEventListener('change', onStoreChange);

	return () => mediaQuery.removeEventListener('change', onStoreChange);
};

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

export const usePrefersReducedMotion = () => useSyncExternalStore(subscribe, getSnapshot, () => true);
