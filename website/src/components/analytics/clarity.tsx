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

export const Clarity = () => {
	const consent = useAnalyticsConsent();
	const pathname = usePathname();

	const isExcludedPath = pathname.split('/').some((segment) => EXCLUDED_PATH_SEGMENTS.has(segment));
	// `consent` comes first: it is null on the server, where `isGoogleTagGatewayHost` cannot read the host.
	const loadsClarity = consent === 'granted' && isGoogleTagGatewayHost() && !isExcludedPath;

	// Clarity has no API to stop recording, and client-side navigation keeps it running. A full page load leaves it out.
	useEffect(() => {
		if (isExcludedPath && document.getElementById(CLARITY_SCRIPT_ID)) {
			window.location.reload();
		}
	}, [isExcludedPath]);

	useEffect(() => {
		if (!loadsClarity || !clarityProjectId) {
			return;
		}
		if (!document.getElementById(CLARITY_SCRIPT_ID)) {
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
