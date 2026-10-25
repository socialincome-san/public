'use client';

import {
	clarityProjectId,
	isGoogleTagGatewayHost,
	updateClarityConsent,
	useAnalyticsConsent,
} from '@/lib/analytics/analytics';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const CLARITY_SCRIPT_ID = 'clarity-script';

// Signed-in areas and sign-in pages show personal data, so they are never recorded.
const EXCLUDED_PATH_SEGMENTS = new Set(['portal', 'partner-space', 'dashboard', 'login', 'auth']);

const isExcluded = (pathname: string) => pathname.split('/').some((segment) => EXCLUDED_PATH_SEGMENTS.has(segment));

const isClarityLoaded = () => document.getElementById(CLARITY_SCRIPT_ID) !== null;

/**
 * Clarity has no API to stop recording, and client-side navigation keeps it running. Links to excluded routes
 * therefore become full page loads before Next.js renders the route, and the fresh page never loads Clarity.
 */
const leaveClarityOnExcludedLinks = (event: MouseEvent) => {
	if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
		return;
	}
	const anchor = event.target instanceof Element ? event.target.closest('a') : null;
	if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) {
		return;
	}
	const url = new URL(anchor.href, window.location.href);
	if (url.origin === window.location.origin && isExcluded(url.pathname) && isClarityLoaded()) {
		event.preventDefault();
		window.location.assign(url);
	}
};

export const Clarity = () => {
	const consent = useAnalyticsConsent();
	const pathname = usePathname();

	const isExcludedPath = isExcluded(pathname);
	// `consent` comes first: it is null on the server, where `isGoogleTagGatewayHost` cannot read the host.
	const loadsClarity = consent === 'granted' && isGoogleTagGatewayHost() && !isExcludedPath;

	// Runs in the capture phase, before the Next.js link handler.
	useEffect(() => {
		window.addEventListener('click', leaveClarityOnExcludedLinks, true);

		return () => window.removeEventListener('click', leaveClarityOnExcludedLinks, true);
	}, []);

	// Fallback for programmatic navigation (`router.push`, server redirects), which no link click announces.
	useEffect(() => {
		if (isExcludedPath && isClarityLoaded()) {
			window.location.reload();
		}
	}, [isExcludedPath]);

	useEffect(() => {
		if (!loadsClarity || !clarityProjectId) {
			return;
		}
		if (!isClarityLoaded()) {
			// Official snippet: queues calls until the tag has loaded.
			const queue: unknown[][] = [];
			window.clarity ??= Object.assign((...args: unknown[]) => void queue.push(args), { q: queue });
			const script = document.createElement('script');
			script.id = CLARITY_SCRIPT_ID;
			script.async = true;
			script.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
			document.head.appendChild(script);
		}
		updateClarityConsent('granted');
	}, [loadsClarity]);

	return null;
};
