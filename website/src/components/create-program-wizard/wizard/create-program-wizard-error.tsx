'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';

type Props = {
	message: string;
	onRetry: () => void;
};

export const WizardError = ({ message, onRetry }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="space-y-4 text-center">
			<p className="text-destructive font-medium">{message}</p>
			<Button onClick={onRetry}>{t('common.retry')}</Button>
		</div>
	);
};
