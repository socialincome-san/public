'use client';

import { useEffect } from 'react';

export const LinkedInTracking = () => {
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_LINKEDIN_TRACKING_ID) {
			// @ts-expect-error LinkedIn script uses a global injected on window.
			window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
			// @ts-expect-error LinkedIn script uses a global injected on window.
			window._linkedin_data_partner_ids.push(process.env.NEXT_PUBLIC_LINKEDIN_TRACKING_ID);
			const scriptElement = document.createElement('script');
			scriptElement.type = 'text/javascript';
			scriptElement.async = true;
			scriptElement.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
			document.head.appendChild(scriptElement);

			console.debug('Enabled LinkedIn tracking');
		}
	}, []);

	return null;
};
