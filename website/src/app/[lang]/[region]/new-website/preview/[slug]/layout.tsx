import { StoryblokProvider } from '@/components/storyblok/storyblok-provider';
import { draftMode } from 'next/headers';

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
	const draft = await draftMode();
	draft.enable();

	console.log('PREVIEW LAYOUT');

	return (
		<StoryblokProvider>
			<div>PREVIEW ROUTE</div>
			{children}
		</StoryblokProvider>
	);
}
