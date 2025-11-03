'use client';

import { Button } from '@/app/portal/components/button';
import { confirmPayoutAction, contestPayoutAction } from '@/app/portal/server-actions/payout-confirmation-actions';
import type { PayoutConfirmationTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import { CheckIcon, XIcon } from 'lucide-react';
import { useTransition } from 'react';

type Props = {
	payout: PayoutConfirmationTableViewRow;
};

export function PayoutConfirmationActionsCell({ payout }: Props) {
	const [isPending, startTransition] = useTransition();

	return (
		<div className="flex gap-2">
			<Button size="sm" onClick={() => startTransition(() => confirmPayoutAction(payout.id))} disabled={isPending}>
				<CheckIcon className="h-4 w-4" />
				Confirm
			</Button>

			<Button
				size="sm"
				variant="destructive"
				onClick={() => startTransition(() => contestPayoutAction(payout.id))}
				disabled={isPending}
			>
				<XIcon className="h-4 w-4" />
				Contest
			</Button>
		</div>
	);
}
