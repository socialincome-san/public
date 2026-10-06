'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { Button } from '@socialincome/design-system/actions/button/button';

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
