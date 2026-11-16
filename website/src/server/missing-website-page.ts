import { getPublishedWebsitePathTails } from '@/lib/storyblok/storyblok-paths';
import { getLatestPublishedPageLinks } from '@/modules/storyblok-content/storyblok-content.service';

// Known pages refresh the list in the background. A path that is not on the list waits for a newer one, so a
// page published a moment ago is not answered with 404, and unknown URLs cost at most one Storyblok request
// per interval.
const REFRESH_INTERVAL_MS = 60_000;
const MISSING_RECHECK_INTERVAL_MS = 10_000;

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
	'open-research/country-eligibility',
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
	// A failed or empty read (E2E fixtures) makes the lookup unavailable. An older list would answer 404 for
	// pages published since.
	publishedPathTails = pathTails && pathTails.size > 0 ? pathTails : undefined;
	refreshedAt = Date.now();
};

const refreshOnce = () => {
	pendingRefresh ??= refreshPublishedPathTails().finally(() => {
		pendingRefresh = undefined;
	});

	return pendingRefresh;
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

	const listAge = Date.now() - refreshedAt;
	if (!publishedPathTails && refreshedAt === 0) {
		await refreshOnce();
	} else if (!publishedPathTails) {
		// Unavailable after a failed read: retry without holding up pages that may well exist
		if (listAge > MISSING_RECHECK_INTERVAL_MS) {
			waitUntil(refreshOnce());
		}
	} else if (publishedPathTails.has(pathTail)) {
		if (listAge > REFRESH_INTERVAL_MS) {
			waitUntil(refreshOnce());
		}
	} else if (listAge > MISSING_RECHECK_INTERVAL_MS) {
		await refreshOnce();
	}

	return publishedPathTails ? !publishedPathTails.has(pathTail) : false;
};
