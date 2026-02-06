'use client';

import PageContentType from '@/components/content-types/page';
import type { Page } from '@/generated/storyblok/types/109655/storyblok-components';
import { storyblokComponents } from '@/lib/services/storyblok/storyblok.config';
import { registerStoryblokBridge } from '@/lib/storyblok-preview/register-bridge';
import type { ISbStoryData } from '@storyblok/js';
import { loadStoryblokBridge } from '@storyblok/js';
import { apiPlugin, storyblokInit } from '@storyblok/react';
import { useEffect, useState } from 'react';

storyblokInit({
	accessToken: process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN,
	use: [apiPlugin],
	components: storyblokComponents,
	enableFallbackComponent: true,
});

type Props = {
	initialStory: ISbStoryData<Page>;
};

export const StoryblokPreviewSyncer = ({ initialStory }: Props) => {
	const [story, setStory] = useState(initialStory);

	useEffect(() => {
		(async () => {
			await loadStoryblokBridge();
			registerStoryblokBridge({
				onInput: (updatedStory) => setStory(updatedStory as ISbStoryData<Page>),
			});
		})();
	}, []);

	return <PageContentType blok={story.content} />;
};
