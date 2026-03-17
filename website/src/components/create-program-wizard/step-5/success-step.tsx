'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { Typography } from '@socialincome/ui';

type Props = {
	onGoToLogin: () => void;
};

export const SuccessStep = ({ onGoToLogin }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="mx-auto max-w-2xl space-y-5 py-2 text-center">
			<div className="space-y-2">
				<Typography size="xl" weight="bold">
					{t('step5.title')}
				</Typography>
				<Typography className="text-muted-foreground">{t('step5.description')}</Typography>
			</div>

			<div className="flex justify-center">
				<Button onClick={onGoToLogin}>{t('step5.go_to_login')}</Button>
			</div>
		</div>
	);
};
