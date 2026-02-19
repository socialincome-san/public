'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { ProgramPermission } from '@/generated/prisma/enums';
import { confirmPayoutAction, contestPayoutAction } from '@/lib/server-actions/payout-confirmation-actions';
import type { PayoutConfirmationTableViewRow } from '@/lib/services/payout/payout.types';
import { CheckIcon, XIcon } from 'lucide-react';
import { useState, useTransition } from 'react';

type Props = {
  payout: PayoutConfirmationTableViewRow;
};

export const PayoutConfirmationActionsCell = ({ payout }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contestOpen, setContestOpen] = useState(false);

  const hasEditAccess = payout.permission === ProgramPermission.operator;

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending || !hasEditAccess}
          variant={hasEditAccess ? 'default' : 'secondary'}
        >
          <CheckIcon className="h-4 w-4" />
          Confirm
        </Button>

        <Button size="sm" variant="destructive" onClick={() => setContestOpen(true)} disabled={isPending || !hasEditAccess}>
          <XIcon className="h-4 w-4" />
          Contest
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm payout?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action will mark the payout as confirmed.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                startTransition(() => confirmPayoutAction(payout.id));
              }}
              disabled={isPending || !hasEditAccess}
            >
              Confirm payout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={contestOpen} onOpenChange={setContestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contest payout?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action will mark the payout as contested.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setContestOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setContestOpen(false);
                startTransition(() => contestPayoutAction(payout.id));
              }}
              disabled={isPending || !hasEditAccess}
            >
              Contest payout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
