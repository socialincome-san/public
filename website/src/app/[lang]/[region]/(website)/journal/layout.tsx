import { PreviewIndicator } from '@/components/storyblok/PreviewIndicator';
import { ReactNode } from 'react';

export default async function RootLayout({ children }: { children: ReactNode }) {
	return (
		<span>
			<PreviewIndicator />
			{children}
		</span>
	);
}
