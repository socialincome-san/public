'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { Button } from '@socialincome/design-system/actions/button/button';
import { ThankYouPanel } from '@socialincome/design-system/feedback/thank-you-panel/thank-you-panel';
import Link from 'next/link';

const SUPPORT_EMAIL = 'support@socialincome.org';

type Props = {
	prefilledEmail: string;
	onLoginClick: () => void;
};

export const DonationLoginPrompt = ({ prefilledEmail, onLoginClick }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });
	const loginHref = prefilledEmail ? `/login?email=${encodeURIComponent(prefilledEmail)}` : '/login';

	return (
		<ThankYouPanel
			data-testid="donation-wizard-step-thank-you"
			message={t('thankYou.message')}
			title={t('thankYou.loginPrompt.title')}
			description={t('thankYou.loginPrompt.description')}
			support={{ prefix: t('thankYou.loginPrompt.supportPrefix'), email: SUPPORT_EMAIL }}
			action={
				<Button asChild>
					<Link href={loginHref} onClick={onLoginClick} data-testid="donation-wizard-login-link">
						{t('thankYou.loginPrompt.loginButton')}
					</Link>
				</Button>
			}
		/>
	);
};
