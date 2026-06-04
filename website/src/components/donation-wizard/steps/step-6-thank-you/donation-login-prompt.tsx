'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { useI18n } from '@/lib/i18n/useI18n';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export const DonationLoginPrompt = () => {
	const { t, language } = useRouteTranslator({ namespace: 'donation-wizard' });
	const { region } = useI18n();
	const loginHref = `/${language}/${region}/login`;

	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 px-4 py-10">
			<Heart className="text-foreground size-6 fill-current" strokeWidth={1.5} aria-hidden />
			<p className="text-foreground max-w-xs text-center text-base leading-normal font-bold">
				{t('thankYou.loginPrompt.message')}
			</p>
			<Button asChild>
				<Link href={loginHref}>{t('thankYou.loginPrompt.loginButton')}</Link>
			</Button>
		</div>
	);
};
