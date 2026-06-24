'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { Heart } from 'lucide-react';
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
		<div className="flex w-full flex-col items-center gap-6 px-9 pt-6 pb-7" data-testid="donation-wizard-step-thank-you">
			<div className="flex items-center gap-2">
				<Heart className="text-foreground size-4 fill-current" strokeWidth={1.5} aria-hidden />
				<p className="text-foreground text-base leading-normal font-medium">{t('thankYou.message')}</p>
			</div>

			<div className="flex w-full flex-col gap-4 text-center">
				<p className="text-foreground text-2xl leading-normal font-medium">{t('thankYou.loginPrompt.title')}</p>
				<p className="text-foreground text-base leading-normal">{t('thankYou.loginPrompt.description')}</p>
			</div>

			<div className="flex w-full flex-col items-center gap-3">
				<Button asChild className="min-w-32">
					<Link href={loginHref} onClick={onLoginClick} data-testid="donation-wizard-login-link">
						{t('thankYou.loginPrompt.loginButton')}
					</Link>
				</Button>
			</div>

			<p className="text-foreground text-center text-sm leading-none">
				{t('thankYou.loginPrompt.supportPrefix')}{' '}
				<a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
					{SUPPORT_EMAIL}
				</a>
			</p>
		</div>
	);
};
