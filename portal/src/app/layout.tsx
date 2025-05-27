import { ContextProviders } from '@/components/providers/context-providers';
import { getMetadata } from '@/metadata';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import type { Viewport } from 'next';
import { PropsWithChildren } from 'react';
import './globals.css';

// export const dynamic = 'force-dynamic';

export const generateMetadata = () => getMetadata('en', 'website-common');

export const viewport: Viewport = {
	themeColor: '#3373BB',
};

storyblokInitializationWorkaround();

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html suppressHydrationWarning={true}>
			<ContextProviders>
				<body>{children}</body>
			</ContextProviders>
		</html>
	);
}
