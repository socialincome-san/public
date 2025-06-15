import { ContextProviders } from '@/components/providers/context-providers';
import { getMetadata } from '@/metadata';
import { storyblokInitializationWorkaround } from '@/storyblok-init';
import type { Viewport } from 'next';
import { PropsWithChildren } from 'react';
import './globals.css';

export const generateMetadata = () => getMetadata('en', 'website-common');

export const viewport: Viewport = {
	themeColor: '#3373BB',
};

storyblokInitializationWorkaround();

const appVersion = process.env.APP_VERSION || 'unknown';
const appEnv = process.env.APP_ENVIRONMENT || 'unknown';
const buildTime = process.env.APP_BUILD_TIMESTAMP || 'unknown';

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html suppressHydrationWarning={true}>
			<head>
				<meta name="app-version" content={appVersion} />
				<meta name="app-environment" content={appEnv} />
				<meta name="app-build-timestamp" content={buildTime} />
			</head>
			<ContextProviders>
				<body>{children}</body>
			</ContextProviders>
		</html>
	);
}
