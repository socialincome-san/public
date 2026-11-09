'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { RecordTableTab } from '@/components/data-table/clients/record-table-tab';
import { countryMobileMoneyProvidersTableConfig } from '@/components/data-table/configs/mobile-money-providers-table.config';
import { countryProgramsTableConfig } from '@/components/data-table/configs/programs-table.config';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { getMobileMoneyProviderTableViewAction } from '@/modules/mobile-money-providers/mobile-money-provider.actions';
import { getProgramTableViewAction } from '@/modules/programs/program.actions';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
import { TabbedDialog } from '@socialincome/design-system/overlays/tabbed-dialog/tabbed-dialog';
import { useTranslations } from 'next-intl';
import CountriesForm from './countries-form';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	countryId?: string;
	errorMessage: string | null;
	onError: (errorMessage: string) => void;
};

export const CountryDialog = ({ open, onOpenChange, countryId, errorMessage, onError }: Props) => {
	const t = useTranslations('portal-admin');
	const handleError = (error: unknown) => {
		const action = countryId ? 'updating/deleting' : 'creating';
		const errorMessage = retrieveErrorMessage(error);
		onError(`Error ${action} country: ${errorMessage}`);
		console.error('Country Form Error', { error });
	};

	const form = (
		<>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertTitle>{t('common.error')}</AlertTitle>
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			<CountriesForm
				countryId={countryId}
				onSuccess={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onError={handleError}
			/>
		</>
	);

	if (countryId) {
		return (
			<TabbedDialog
				open={open}
				onOpenChange={onOpenChange}
				title={t('dialog.editCountry')}
				tabs={[
					{ value: 'details', label: t('common.details'), content: form },
					{
						value: 'programs',
						label: t('common.programs'),
						content: (
							<RecordTableTab
								config={countryProgramsTableConfig}
								load={(query) => getProgramTableViewAction({ ...query, countryId })}
								getRowHref={(row) => `/portal/programs/${row.id}/overview`}
							/>
						),
					},
					{
						value: 'mobile-money-providers',
						label: t('common.mobileMoneyProviders'),
						content: (
							<RecordTableTab
								config={countryMobileMoneyProvidersTableConfig}
								load={(query) => getMobileMoneyProviderTableViewAction({ ...query, countryId })}
								getRowHref={(row) =>
									`/portal/admin/mobile-money-providers?${new URLSearchParams({ countryId, providerId: row.id })}`
								}
							/>
						),
					},
					auditLogTab('country', countryId),
				]}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>{t('dialog.addCountry')}</DialogTitle>
				</DialogHeader>
				{form}
			</DialogContent>
		</Dialog>
	);
};
