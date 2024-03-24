import { ContextProviders } from '@/components/providers/context-providers';
import { getMetadata } from '@/metadata';
import { PropsWithChildren } from 'react';
import './globals.css';

export const generateMetadata = () => getMetadata('en', 'website-common');

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html suppressHydrationWarning={true}>
			<ContextProviders>
				<body>{children}</body>
			</ContextProviders>
		</html>
	);
}
