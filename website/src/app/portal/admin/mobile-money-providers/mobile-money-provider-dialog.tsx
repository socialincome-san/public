'use client';

import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { mobileMoneyProviderCountriesTableConfig } from '@/components/data-table/configs/countries-table.config';
import { mobileMoneyProviderChildrenTableConfig } from '@/components/data-table/configs/mobile-money-providers-table.config';
import { mobileMoneyProviderPayoutsTableConfig } from '@/components/data-table/configs/payouts-table.config';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { getCountryTableViewAction } from '@/modules/countries/country.actions';
import { getMobileMoneyProviderTableViewAction } from '@/modules/mobile-money-providers/mobile-money-provider.actions';
import { getPayoutTableViewAction } from '@/modules/payouts/payout.actions';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import MobileMoneyProvidersForm from './mobile-money-providers-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providerId?: string;
	errorMessage: string | null;
	onError: (errorMessage: string) => void;
};

export const MobileMoneyProviderDialog = ({ open, onOpenChange, providerId, errorMessage, onError }: Props) => {
	const handleError = (error: unknown) => {
		const action = providerId ? 'updating/deleting' : 'creating';
		const errorMessage = retrieveErrorMessage(error);
		onError(`Error ${action} mobile money provider: ${errorMessage}`);
		console.error('Mobile Money Provider Form Error', { error });
	};

	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}
			<MobileMoneyProvidersForm
				providerId={providerId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={handleError}
			/>
		</>
	);

	if (providerId) {
		return (
			<TabbedDialog
				open={open}
				onOpenChange={onOpenChange}
				title="Edit mobile money provider"
				tabs={[
					{ value: 'details', label: 'Details', content: form },
					{
						value: 'payouts',
						label: 'Payouts',
						content: (
							<RecordTableTab
								config={mobileMoneyProviderPayoutsTableConfig}
								load={(query) => getPayoutTableViewAction({ ...query, mobileMoneyProviderId: providerId })}
								getRowHref={(row) =>
									`/portal/delivery/payouts?${new URLSearchParams({ mobileMoneyProviderId: providerId, payoutId: row.id })}`
								}
							/>
						),
					},
					{
						value: 'countries',
						label: 'Countries',
						content: (
							<RecordTableTab
								config={mobileMoneyProviderCountriesTableConfig}
								load={(query) => getCountryTableViewAction({ ...query, mobileMoneyProviderId: providerId })}
								getRowHref={(row) =>
									`/portal/admin/countries?${new URLSearchParams({ mobileMoneyProviderId: providerId, countryId: row.id })}`
								}
							/>
						),
					},
					{
						value: 'child-providers',
						label: 'Child providers',
						content: (
							<RecordTableTab
								config={mobileMoneyProviderChildrenTableConfig}
								load={(query) => getMobileMoneyProviderTableViewAction({ ...query, parentProviderId: providerId })}
								getRowHref={(row) =>
									`/portal/admin/mobile-money-providers?${new URLSearchParams({ parentProviderId: providerId, providerId: row.id })}`
								}
							/>
						),
					},
				]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add mobile money provider</DialogTitle>
				</DialogHeader>
				{form}
			</DialogContent>
		</Dialog>
	);
};
