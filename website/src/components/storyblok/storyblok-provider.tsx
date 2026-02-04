'use client';

import { storyblokComponents } from '@/lib/services/storyblok/storyblok.config';
import type { ISbStoryData } from '@storyblok/js';
import { apiPlugin, StoryblokComponent, storyblokInit, useStoryblokState } from '@storyblok/react';

const isVisualEditor =
	typeof window !== 'undefined' && window.self !== window.top && window.location.search.includes('_storyblok');

// Always register components, enable bridge only in Visual Editor
storyblokInit({
	accessToken: process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN,
	use: [apiPlugin],
	components: storyblokComponents,
	enableFallbackComponent: true,
	bridge: isVisualEditor,
});

export const StoryblokProvider = ({ children }: React.PropsWithChildren) => {
	return <>{children}</>;
};

/**
 * Client component that enables live editing in the Storyblok Visual Editor.
 * Uses useStoryblokState to subscribe to real-time content changes.
 */
export const StoryblokLiveStory = ({ story }: { story: ISbStoryData }) => {
	const liveStory = useStoryblokState(story);
	return <StoryblokComponent blok={liveStory?.content} />;
};
