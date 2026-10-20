import { FirebaseAppProvider } from '@/lib/firebase/firebase-app-provider';
import { pickClientMessages, pickPortalClientMessages } from '@/lib/i18n/messages';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Suspense, type PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const rootViewport: Viewport = {
	themeColor: '#3373BB',
};

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown';
const appEnv = process.env.NEXT_PUBLIC_APP_ENVIRONMENT ?? process.env.VERCEL_TARGET_ENV ?? 'unknown';
const buildTime = process.env.NEXT_PUBLIC_APP_BUILD_TIMESTAMP ?? 'unknown';

type MessageScope = 'website' | 'portal';

const IntlProvider = async ({ children, messageScope }: PropsWithChildren<{ messageScope: MessageScope }>) => {
	const messages = await getMessages();
	const clientMessages = messageScope === 'portal' ? pickPortalClientMessages(messages) : pickClientMessages(messages);

	return <NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider>;
};

// Shared by the root layouts of the website, portal, partner space and API docs. They are separate root
// layouts so that the website's `[lang]` and `[currency]` segments are available as `next/root-params`.
// Anything awaited for the page (sessions, messages) must load inside the Suspense boundary, e.g. as an async
// component: when it is awaited before the document renders, React leaves nested streamed Suspense content
// duplicated in hidden containers.
export const RootDocument = ({
	lang,
	children,
	messageScope = 'website',
}: PropsWithChildren<{ lang: string; messageScope?: MessageScope }>) => (
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
				<Suspense fallback={<AppLoadingSkeleton message="Loading Social Income..." variant="page" />}>
					<IntlProvider messageScope={messageScope}>{children}</IntlProvider>
				</Suspense>
				<Analytics />
				<SpeedInsights />
			</body>
		</FirebaseAppProvider>
	</html>
);
