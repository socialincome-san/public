'use client';

import type { PayoutProcessOverviewOption } from '@/modules/mobile-money-providers/mobile-money-provider.types';
import { Button } from '@socialincome/design-system/button/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/dialog/dialog';
import { OrangeMoneyCsvPayoutProcessDialog } from './orange-money-csv-payout-process-dialog';
import type { PayoutProcessDialogBaseProps } from './payout-process-dialog-props';
import { TelecelCsvPayoutProcessDialog } from './telecel-csv-payout-process-dialog';

const UnsupportedPayoutProcessDialog = ({
	option,
	open,
	onClose,
}: PayoutProcessDialogBaseProps & { option: PayoutProcessOverviewOption }) => (
	<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
		<DialogContent size="alert">
			<DialogHeader>
				<DialogTitle>Unsupported payout process</DialogTitle>
				<DialogDescription>
					The payout process &quot;{option.name}&quot; is not supported in the portal yet.
				</DialogDescription>
			</DialogHeader>
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

	if (option.payoutProcess === 'orange_money_csv') {
		return <OrangeMoneyCsvPayoutProcessDialog {...props} mobileMoneyProviderId={option.id} providerName={option.name} />;
	}

	return <UnsupportedPayoutProcessDialog option={option} {...props} />;
};
