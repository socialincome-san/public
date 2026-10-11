'use client';

import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import { Button } from '@socialincome/design-system/actions/button/button';
import { ThankYouPanel } from '@socialincome/design-system/feedback/thank-you-panel/thank-you-panel';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const SUPPORT_EMAIL = 'support@socialincome.org';

type Props = {
	onDashboardClick: () => void;
};

export const DonationLoggedInPrompt = ({ onDashboardClick }: Props) => {
	const t = useTranslations('donation-wizard');
	const websiteBasePath = useWebsiteBasePath();

	return (
		<ThankYouPanel
			data-testid="donation-wizard-step-thank-you"
			message={t('thankYou.message')}
			title={t('thankYou.loggedInPrompt.title')}
			description={t('thankYou.loggedInPrompt.description')}
			support={{ prefix: t('thankYou.loginPrompt.supportPrefix'), email: SUPPORT_EMAIL }}
			action={
				<Button asChild>
					<Link
						href={`${websiteBasePath}/dashboard/subscriptions`}
						onClick={onDashboardClick}
						data-testid="donation-wizard-dashboard-link"
					>
						{t('thankYou.loggedInPrompt.dashboardButton')}
					</Link>
				</Button>
			}
		/>
	);
};
