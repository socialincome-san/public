import { PreviewBanner } from '@/components/storyblok/preview-banner';
import type { ReactNode } from 'react';

export default function JournalLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<PreviewBanner />
			{children}
		</>
	);
}
