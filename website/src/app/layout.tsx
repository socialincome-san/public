import { AnalyticsInitializer } from '@/components/legacy/analytics/analytics-initializer';
import { FirebaseAppProvider } from '@/lib/firebase/firebase-app-provider';
import { getMetadata } from '@/lib/utils/metadata';
import type { Viewport } from 'next';
import { PropsWithChildren } from 'react';
import './globals.css';

export const generateMetadata = () => getMetadata('en', 'website-common');

export const viewport: Viewport = {
	themeColor: '#3373BB',
};

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'unknown';
const appEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT || 'unknown';
const buildTime = process.env.APP_BUILD_TIMESTAMP || 'unknown';

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html suppressHydrationWarning={true}>
			<head>
				<title>Social Income</title>
				<meta name="app-version" content={appVersion} />
				<meta name="app-environment" content={appEnv} />
				<meta name="app-build-timestamp" content={buildTime} />
			</head>
			<FirebaseAppProvider>
				<body>{children}</body>
				<AnalyticsInitializer />
			</FirebaseAppProvider>
		</html>
	);
}
