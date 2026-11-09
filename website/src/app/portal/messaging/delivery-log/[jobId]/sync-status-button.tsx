'use client';

import { syncMessagingJobStatusesAction } from '@/modules/messaging/messaging.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

type SyncStatusButtonProps = {
	jobId: string;
};

export const SyncStatusButton = ({ jobId }: SyncStatusButtonProps) => {
	const t = useTranslations('portal-messaging');
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleClick = () => {
		startTransition(async () => {
			setMessage(null);
			setError(null);
			try {
				const result = await syncMessagingJobStatusesAction(jobId);
				if (!result.success) {
					setError(t('deliveryLog.sync.actionError', { error: result.error }));

					return;
				}
				setMessage(t('deliveryLog.sync.updated', { updated: result.data.updated, checked: result.data.checked }));
				router.refresh();
			} catch {
				// A transport or unexpected server failure rejects the action rather than returning a result.
				setError(t('deliveryLog.sync.error'));
			}
		});
	};

	return (
		<div className="flex items-center gap-3">
			{error ? (
				<span className="text-destructive text-xs">{error}</span>
			) : (
				message && <span className="text-muted-foreground text-xs">{message}</span>
			)}
			<Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
				{isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
				{t('deliveryLog.sync.button')}
			</Button>
		</div>
	);
};
