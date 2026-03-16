import { PreviewIndicator } from '@/components/legacy/storyblok/PreviewIndicator';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<div>
			<PreviewIndicator />
			{children}
		</div>
	);
}
