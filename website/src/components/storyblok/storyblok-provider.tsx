'use client';
import { SIStoryblokComponentsMap } from '@/types/storyblok/storyblok-util';
import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';

const components: SIStoryblokComponentsMap = {};

// Import with component mapping.
// it's necessary to re-initialize here as well,
// as to enable the live editing experience inside
// the Visual Editor you need to initialize the
// lib universally (client + server).
storyblokInit({
	accessToken: process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN,
	use: [apiPlugin],
	apiOptions: {
		region: process.env.NEXT_PUBLIC_STORYBLOK_REGION,
	},
	components,
});

/**
 * Wrapper to ensure client-side loading for hybrid rendering.
 */
export default function StoryblokProvider({ children }: { children: JSX.Element }) {
	return children;
}
