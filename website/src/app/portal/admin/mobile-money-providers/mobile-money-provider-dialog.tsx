'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
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
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import MobileMoneyProvidersForm from './mobile-money-providers-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	providerId?: string;
};

export const MobileMoneyProviderDialog = ({ open, onOpenChange, providerId }: Props) => {
	const t = useTranslations('portal-admin');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleError = (error: unknown) => {
		const action = providerId ? 'updating/deleting' : 'creating';
		setErrorMessage(`Error ${action} mobile money provider: ${retrieveErrorMessage(error)}`);
		console.error('Mobile Money Provider Form Error', { error });
	};

	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>{t('common.error')}</AlertTitle>
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
				title={t('dialog.editProvider')}
				tabs={[
					{ value: 'details', label: t('common.details'), content: form },
					{
						value: 'payouts',
						label: t('common.payouts'),
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
						label: t('common.countries'),
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
						label: t('common.childProviders'),
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
					auditLogTab('mobile-money-provider', providerId),
				]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>{t('dialog.addProvider')}</DialogTitle>
				</DialogHeader>
				{form}
			</DialogContent>
		</Dialog>
	);
};
