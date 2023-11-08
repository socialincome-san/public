import { I18nProvider } from '@/app/providers/i18n-provider';
import { ProvidersClient } from '@/app/providers/providers-client';
import { PropsWithChildren } from 'react';
import './globals.css';

export const metadata = {
	title: 'Social Income',
	description: 'Social Income brings Universal Basic Income to the Global South.',
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html suppressHydrationWarning={true}>
			<I18nProvider>
				<ProvidersClient>{children}</ProvidersClient>
			</I18nProvider>
		</html>
	);
}
