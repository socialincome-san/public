import { patchStoryblokFetch } from './lib/services/storyblok/storyblok.mock';

/**
 * Enable Storyblok mock in development and test environments when STORYBLOK_MOCK_MODE is set to 'record' or 'replay'.
 * In 'record' mode, Storyblok API calls are recorded and can be saved for later use.
 * In 'replay' mode, recorded API responses are replayed, allowing for consistent testing without hitting the real API.
 */
if (process.env.STORYBLOK_MOCK_MODE === 'record' || process.env.STORYBLOK_MOCK_MODE === 'replay') {
	console.log('[Storyblok Mock] Enabled via STORYBLOK_MOCK_MODE');
	patchStoryblokFetch();
}
