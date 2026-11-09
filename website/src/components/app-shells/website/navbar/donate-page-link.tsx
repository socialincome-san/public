'use client';

import { trackEvent } from '@/lib/analytics/analytics';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import { Button } from '@socialincome/design-system/actions/button/button';
import NextLink from 'next/link';

export const DonatePageLink = ({ label }: { label: string }) => (
	<Button size="md" asChild>
		<NextLink
			href={`${useWebsiteBasePath()}/get-involved/individuals/donate`}
			onClick={() => trackEvent('donate_nav_click')}
		>
			{label}
		</NextLink>
	</Button>
);
