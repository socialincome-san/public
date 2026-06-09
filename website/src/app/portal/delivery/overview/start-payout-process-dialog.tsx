'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/dialog';
import { PayoutProcess } from '@/generated/prisma/enums';
import type { PayoutProcessOverviewOption } from '@/lib/services/payout-process/payout-process-overview.types';
import { OrangeMoneyCsvPayoutProcessDialog } from './orange-money-csv-payout-process-dialog';
import type { PayoutProcessDialogBaseProps } from './payout-process-dialog-props';
import { TelecelCsvPayoutProcessDialog } from './telecel-csv-payout-process-dialog';

const UnsupportedPayoutProcessDialog = ({
	option,
	open,
	onClose,
}: PayoutProcessDialogBaseProps & { option: PayoutProcessOverviewOption }) => (
	<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
		<DialogContent className="sm:max-w-[480px]">
			<DialogHeader>
				<DialogTitle>Unsupported payout process</DialogTitle>
			</DialogHeader>
			<p className="text-muted-foreground text-sm">
				The payout process &quot;{option.name}&quot; is not supported in the portal yet.
			</p>
			<DialogFooter>
				<Button variant="outline" onClick={onClose}>
					Close
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);

export const StartPayoutProcessDialog = ({
	option,
	...props
}: PayoutProcessDialogBaseProps & { option: PayoutProcessOverviewOption }) => {
	if (option.kind === 'telecel_csv') {
		return <TelecelCsvPayoutProcessDialog {...props} />;
	}

	if (option.payoutProcess === PayoutProcess.orange_money_csv) {
		return <OrangeMoneyCsvPayoutProcessDialog {...props} mobileMoneyProviderId={option.id} providerName={option.name} />;
	}

	return <UnsupportedPayoutProcessDialog option={option} {...props} />;
};
