'use client';

import { Theme } from '@socialincome/ui';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

export function ThemeProvider({ children }: PropsWithChildren) {
	const pathname = usePathname();
	const baseSegment = pathname?.split('/')[3];

	let theme;
	let background;
	switch (baseSegment) {
		case 'about-us':
			background = 'bg-base-red';
			theme = 'siLightRed';
			break;
		case 'donate':
			background = 'bg-base-100';
			theme = 'siDarkBlue';
			break;
		default:
			background = 'bg-base-blue';
			theme = 'siDefault';
	}

	return (
		<Theme className={background} dataTheme={theme}>
			{children}
		</Theme>
	);
}
