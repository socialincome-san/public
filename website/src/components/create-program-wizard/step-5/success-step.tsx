'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';

type Props = {
	onGoToLogin: () => void;
};

export const SuccessStep = ({ onGoToLogin }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="mx-auto max-w-2xl space-y-5 py-2 text-center">
			<div className="space-y-2">
				<h2 className="text-3xl font-bold">{t('step5.title')}</h2>
				<p className="text-muted-foreground">{t('step5.description')}</p>
			</div>

			<div className="flex justify-center">
				<Button onClick={onGoToLogin}>{t('step5.go_to_login')}</Button>
			</div>
		</div>
	);
};
