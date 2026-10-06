'use client';

import { confirmPayoutAction, contestPayoutAction } from '@/modules/payouts/payout.actions';
import type { PayoutConfirmationTableViewRow } from '@/modules/payouts/payout.types';
import { Button } from '@socialincome/design-system/button/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/dialog/dialog';
import { CheckIcon, XIcon } from 'lucide-react';
import { useState, useTransition } from 'react';

type Props = {
	payout: PayoutConfirmationTableViewRow;
};

export const PayoutConfirmationActionsCell = ({ payout }: Props) => {
	const [isPending, startTransition] = useTransition();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [contestOpen, setContestOpen] = useState(false);

	return (
		<>
			<div className="flex gap-2">
				<Button size="sm" onClick={() => setConfirmOpen(true)} disabled={isPending}>
					<CheckIcon className="h-4 w-4" />
					Confirm
				</Button>

				<Button size="sm" variant="destructive" onClick={() => setContestOpen(true)} disabled={isPending}>
					<XIcon className="h-4 w-4" />
					Contest
				</Button>
			</div>

			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent size="alert">
					<DialogHeader>
						<DialogTitle>Confirm payout?</DialogTitle>
						<DialogDescription>This action will mark the payout as confirmed.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setConfirmOpen(false);
								startTransition(() => {
									void confirmPayoutAction(payout.id);
								});
							}}
							disabled={isPending}
						>
							Confirm payout
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={contestOpen} onOpenChange={setContestOpen}>
				<DialogContent size="alert">
					<DialogHeader>
						<DialogTitle>Contest payout?</DialogTitle>
						<DialogDescription>This action will mark the payout as contested.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setContestOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								setContestOpen(false);
								startTransition(() => {
									void contestPayoutAction(payout.id);
								});
							}}
							disabled={isPending}
						>
							Contest payout
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
