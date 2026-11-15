import { getPublishedWebsitePathTails } from '@/lib/storyblok/storyblok-paths';
import { getLatestPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.service';

const REFRESH_INTERVAL_MS = 60_000;

const PREVIEW_SEGMENT = 'preview';

// Every route below src/app/[lang]/[currency] that is not a Storyblok page. A route missing here answers 404
// in production only, which missing-website-page.test.ts prevents by comparing this with the app folder.
const STATIC_PATH_TAILS = new Set([
	'campaigns',
	'circle',
	'countries',
	'focuses',
	'journal',
	'journal/rss.xml',
	'local-partners',
	'login',
	'programs',
]);
const STATIC_FIRST_SEGMENTS = new Set(['auth', 'dashboard', 'survey']);

let publishedPathTails: Set<string> | undefined;
let refreshedAt = 0;
let pendingRefresh: Promise<void> | undefined;

/** True for paths that only render when a published Storyblok page has that path. */
export const isStoryblokPagePath = (pathTail: string) => {
	const segments = pathTail.split('/');

	return (
		pathTail !== '' &&
		// Previews render drafts, which the published links do not list
		segments.at(-1) !== PREVIEW_SEGMENT &&
		!STATIC_PATH_TAILS.has(pathTail) &&
		!STATIC_FIRST_SEGMENTS.has(segments[0] ?? '')
	);
};

const refreshPublishedPathTails = async () => {
	const result = await getLatestPublishedPageLinks();
	const pathTails = result.success ? getPublishedWebsitePathTails(result.data) : undefined;
	// An empty list (Storyblok failure, E2E fixtures) keeps the previous one instead of turning every page into a 404
	if (pathTails && pathTails.size > 0) {
		publishedPathTails = pathTails;
	}
	refreshedAt = Date.now();
};

/**
 * The page calls notFound() only after the response has started streaming with status 200, so the proxy has to
 * know earlier. Unknown while the list cannot be loaded, which leaves the decision to the page.
 */
export const isMissingWebsitePage = async (pathTail: string, waitUntil: (promise: Promise<unknown>) => void) => {
	// Outside production, unpublished pages render from their draft
	if (process.env.NODE_ENV !== 'production' || !isStoryblokPagePath(pathTail)) {
		return false;
	}

	if (Date.now() - refreshedAt > REFRESH_INTERVAL_MS) {
		pendingRefresh ??= refreshPublishedPathTails().finally(() => {
			pendingRefresh = undefined;
		});
		// Only the first request of a server instance waits; later ones use the list they have while it refreshes
		if (publishedPathTails) {
			waitUntil(pendingRefresh);
		} else {
			await pendingRefresh;
		}
	}

	return publishedPathTails ? !publishedPathTails.has(pathTail) : false;
};
