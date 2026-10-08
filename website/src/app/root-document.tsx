import { FirebaseAppProvider } from '@/lib/firebase/firebase-app-provider';
import { Analytics } from '@vercel/analytics/next';
import type { Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const rootViewport: Viewport = {
	themeColor: '#3373BB',
};

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown';
const appEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT ?? process.env.VERCEL_TARGET_ENV ?? 'unknown';
const buildTime = process.env.NEXT_PUBLIC_APP_BUILD_TIMESTAMP ?? 'unknown';

// Shared by the root layouts of the website, portal, partner space and API docs. They are separate root
// layouts so that the website's `[lang]` and `[region]` segments are available as `next/root-params`.
export const RootDocument = ({ lang, children }: PropsWithChildren<{ lang: string }>) => (
	<html lang={lang} suppressHydrationWarning={true}>
		<head>
			<title>Social Income</title>
			<meta name="app-version" content={appVersion} />
			<meta name="app-environment" content={appEnv} />
			<meta name="app-build-timestamp" content={buildTime} />
		</head>
		<FirebaseAppProvider>
			<body>
				<NextIntlClientProvider>
					<Toaster />
					{children}
				</NextIntlClientProvider>
				<Analytics />
			</body>
		</FirebaseAppProvider>
	</html>
);
