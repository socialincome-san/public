import { AnalyticsInitializer } from '@/components/analytics/analytics-initializer';
import { FirebaseAppProvider } from '@/lib/firebase/firebase-app-provider';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown';
const appEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT ?? 'unknown';
const buildTime = process.env.APP_BUILD_TIMESTAMP ?? 'unknown';

export const RootDocument = ({ children, lang }: PropsWithChildren<{ lang: WebsiteLanguage }>) => (
	<html lang={lang} suppressHydrationWarning={true}>
		<head>
			<title>Social Income</title>
			<meta name="app-version" content={appVersion} />
			<meta name="app-environment" content={appEnv} />
			<meta name="app-build-timestamp" content={buildTime} />
		</head>
		<FirebaseAppProvider>
			<body>
				<Toaster />
				{children}
			</body>
			<AnalyticsInitializer />
		</FirebaseAppProvider>
	</html>
);
