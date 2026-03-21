'use client';

import { useEffect } from 'react';

export const LinkedInTracking = () => {
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_LINKEDIN_TRACKING_ID) {
			const linkedInWindow = window as Window & { _linkedin_data_partner_ids?: string[] };
			linkedInWindow._linkedin_data_partner_ids ??= [];
			linkedInWindow._linkedin_data_partner_ids.push(process.env.NEXT_PUBLIC_LINKEDIN_TRACKING_ID);
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
