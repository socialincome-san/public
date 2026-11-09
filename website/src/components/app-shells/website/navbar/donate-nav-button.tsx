'use client';

import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { trackEvent } from '@/lib/analytics/analytics';
import { Button } from '@socialincome/design-system/actions/button/button';
import NextLink from 'next/link';

type Props = {
	label: string;
	// Set in Storyblok (layout › donateLink); without one, the button opens the donation form
	href?: string;
	onClick?: () => void;
};

export const DonateNavButton = ({ label, href, onClick }: Props) =>
	href ? (
		<Button size="md" asChild>
			<NextLink
				href={href}
				onClick={() => {
					trackEvent('donate_nav_click');
					onClick?.();
				}}
			>
				{label}
			</NextLink>
		</Button>
	) : (
		<OpenDonationWizardButton label={label} size="md" onBeforeOpen={onClick} analyticsEvent="donate_nav_click" />
	);
