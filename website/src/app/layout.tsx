import { ContextProviders } from '@/components/providers/context-providers';
import { getMetadata } from '@/metadata';
import { apiPlugin, storyblokInit } from '@storyblok/react';
import type { Viewport } from 'next';
import { PropsWithChildren } from 'react';
import './globals.css';

export const generateMetadata = () => getMetadata('en', 'website-common');

export const viewport: Viewport = {
	themeColor: '#3373BB',
};

storyblokInit({
	accessToken: process.env.STORYBLOK_PREVIEW_TOKEN,
	apiOptions: {
		cache: { type: 'none' },
	},
	use: [apiPlugin],
});

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html suppressHydrationWarning={true}>
			<ContextProviders>
				<body>{children}</body>
			</ContextProviders>
		</html>
	);
}
