'use client';

import { Button } from '@/components/button';
import { confirmPayoutAction, contestPayoutAction } from '@/lib/server-actions/payout-confirmation-actions';
import type { PayoutConfirmationTableViewRow } from '@/lib/services/payout/payout.types';
import { ProgramPermission } from '@prisma/client';
import { CheckIcon, XIcon } from 'lucide-react';
import { useTransition } from 'react';

type Props = {
	payout: PayoutConfirmationTableViewRow;
};

export function PayoutConfirmationActionsCell({ payout }: Props) {
	const [isPending, startTransition] = useTransition();

	const hasEditAccess = payout.permission === ProgramPermission.operator;

	return (
		<div className="flex gap-2">
			<Button
				size="sm"
				onClick={() => startTransition(() => confirmPayoutAction(payout.id))}
				disabled={isPending || !hasEditAccess}
				variant={hasEditAccess ? 'default' : 'secondary'}
			>
				<CheckIcon className="h-4 w-4" />
				Confirm
			</Button>

			<Button
				size="sm"
				variant="destructive"
				onClick={() => startTransition(() => contestPayoutAction(payout.id))}
				disabled={isPending || !hasEditAccess}
			>
				<XIcon className="h-4 w-4" />
				Contest
			</Button>
		</div>
	);
}
