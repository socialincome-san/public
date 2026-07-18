'use client';

import { Button } from '@/components/button';
import { syncMessagingJobStatusesAction } from '@/lib/server-actions/messaging-actions';
import { Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

type SyncStatusButtonProps = {
	jobId: string;
};

export const SyncStatusButton = ({ jobId }: SyncStatusButtonProps) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleClick = () => {
		startTransition(async () => {
			setMessage(null);
			setError(null);
			const result = await syncMessagingJobStatusesAction(jobId);
			if (!result.success) {
				setError(result.error);

				return;
			}
			setMessage(`Updated ${result.data.updated} of ${result.data.checked}`);
			router.refresh();
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
				Refresh status from Twilio
			</Button>
		</div>
	);
};
