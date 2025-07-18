import { QueryClientProvider } from '@/app/query-client-provider';
import { AnalyticsInitializer } from '@/components/analytics/analytics-initializer';
import { ApiClientProvider } from '@/lib/api/api-client-provider';
import { FirebaseAppProvider } from '@/lib/firebase/firebase-app-provider';
import { I18nContextProvider } from '@/lib/i18n/i18n-context-provider';
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
				<title>Social Income</title>
				<meta name="app-version" content={appVersion} />
				<meta name="app-environment" content={appEnv} />
				<meta name="app-build-timestamp" content={buildTime} />
			</head>
			<QueryClientProvider>
				<FirebaseAppProvider>
					<ApiClientProvider>
						<I18nContextProvider>
							<body>{children}</body>
						</I18nContextProvider>
					</ApiClientProvider>
					<AnalyticsInitializer />
				</FirebaseAppProvider>
			</QueryClientProvider>
		</html>
	);
}
