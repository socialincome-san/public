'use client';

import { useSyncExternalStore } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

const subscribe = (onStoreChange: () => void) => {
	const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
	mediaQuery.addEventListener('change', onStoreChange);

	return () => mediaQuery.removeEventListener('change', onStoreChange);
};

const getSnapshot = () => window.matchMedia(MOBILE_MEDIA_QUERY).matches;

const getServerSnapshot = () => false;

export const useIsMobile = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
