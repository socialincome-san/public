import { LANGUAGE_COOKIE } from '@/app/[lang]/[region]';
import { AnalyticsInitializer } from '@/components/analytics/analytics-initializer';
import { FirebaseAppProvider } from '@/lib/firebase/firebase-app-provider';
import { resolveWebsiteLanguage, WEBSITE_LANGUAGE_HEADER } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import type { Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const generateMetadata = () => getMetadata('en', 'website-common');

export const viewport: Viewport = {
	themeColor: '#3373BB',
};

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown';
const appEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT ?? 'unknown';
const buildTime = process.env.APP_BUILD_TIMESTAMP ?? 'unknown';

export default async function RootLayout({ children }: PropsWithChildren) {
	const headerStore = await headers();
	const cookieStore = await cookies();
	const lang = resolveWebsiteLanguage({
		pathnameLanguage: headerStore.get(WEBSITE_LANGUAGE_HEADER) ?? undefined,
		cookieLanguage: cookieStore.get(LANGUAGE_COOKIE)?.value,
	});

	return (
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
}
