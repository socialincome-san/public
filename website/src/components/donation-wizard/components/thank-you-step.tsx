'use client';

import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { Heart } from 'lucide-react';

export const ThankYouStep = () => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	return (
		<div className="flex w-full flex-col items-center justify-center gap-2 px-4 py-10">
			<Heart className="text-foreground size-6 fill-current" strokeWidth={1.5} aria-hidden />
			<p className="text-foreground text-center text-base leading-normal font-bold">{t('thankYou.message')}</p>
		</div>
	);
};
