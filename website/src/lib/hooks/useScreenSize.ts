'use client';

import { useEffect, useState } from 'react';

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const determineScreenSize = (width: number): ScreenSize => {
	if (width < 640) return 'xs';
	if (width < 768) return 'sm';
	if (width < 1024) return 'md';
	if (width < 1280) return 'lg';
	if (width < 1536) return 'xl';
	return '2xl';
};

export const useScreenSize = (): ScreenSize | null => {
	const [currentScreenSize, setCurrentScreenSize] = useState<ScreenSize | null>(null);

	useEffect(() => {
		const handler = () => {
			setCurrentScreenSize(determineScreenSize(window.innerWidth));
		};

		handler();
		window.addEventListener('resize', handler);
		return () => window.removeEventListener('resize', handler);
	}, []);

	return currentScreenSize;
};
