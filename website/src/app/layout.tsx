import { ContextProviders } from '@/app/context-providers';
import StoryblokProvider from '@/components/storyblok/storyblok-provider';
import { getMetadata } from '@/metadata';
import { apiPlugin, storyblokInit } from '@storyblok/react';
import { PropsWithChildren } from 'react';
import './globals.css';

// Import without component definition. This is for server-side rendering.
// The client-side initailization is done in `components/storyblok-provider.tsx`
storyblokInit({
	accessToken: process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN,
	use: [apiPlugin],
	apiOptions: {
		region: process.env.NEXT_PUBLIC_STORYBLOK_REGION,
	},
});

export const generateMetadata = () => getMetadata('en', 'website-common');

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<StoryblokProvider>
			<html suppressHydrationWarning={true}>
				<ContextProviders>
					<body>{children}</body>
				</ContextProviders>
			</html>
		</StoryblokProvider>
	);
}
