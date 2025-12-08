import { apiPlugin, storyblokInit } from '@storyblok/react';

/**
 *
 *
 * Current we are facing the following issues:
 * https://github.com/vercel/next.js/issues/68882
 * https://github.com/storyblok/storyblok-react/issues/952.
 * Therefore we initiate storyblok on every page that it needs the api access
 * */
export function storyblokInitializationWorkaround() {
	storyblokInit({
		accessToken: process.env.STORYBLOK_PREVIEW_TOKEN,
		apiOptions: {
			cache: { type: 'none' },
		},
		use: [apiPlugin],
	});
}
