'use client';

import { trackEvent } from '@/lib/analytics/analytics';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import { getGetInvolvedPathTail } from '@/lib/storyblok/storyblok-paths';
import { Button } from '@socialincome/design-system/actions/button/button';
import NextLink from 'next/link';

export const DonatePageLink = ({ label, onClick }: { label: string; onClick?: () => void }) => (
	<Button size="md" asChild>
		<NextLink
			href={`${useWebsiteBasePath()}/${getGetInvolvedPathTail('individuals', 'donate')}`}
			onClick={() => {
				trackEvent('donate_nav_click');
				onClick?.();
			}}
		>
			{label}
		</NextLink>
	</Button>
);
