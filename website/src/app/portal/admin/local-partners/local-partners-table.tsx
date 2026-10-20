'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { localPartnersTableConfig } from '@/components/data-table/configs/local-partners-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { LocalPartnerTableViewRow } from '@/modules/local-partners/local-partner.types';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LocalPartnerDialog } from './local-partner-dialog';

export default function LocalPartnersTable({
	rows,
	error,
	query,
}: {
	rows: LocalPartnerTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const t = useTranslations('portal-admin');
	const { recordId: partnerId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('localPartnerId');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const openEmptyForm = () => {
		setErrorMessage(null);
		openCreate();
	};

	const openEditForm = (row: LocalPartnerTableViewRow) => {
		setErrorMessage(null);
		openRecord(row.id);
	};

	const onError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		setErrorMessage(t('status.errorSavingLocalPartner', { error: errorMessage }));
		console.error('Local Partner Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={{
					...localPartnersTableConfig,
					title: t('table.localPartners'),
					emptyMessage: t('table.noLocalPartners'),
				}}
				titleInfoTooltip={t('table.localPartnersTooltip')}
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: t('actions.addLocalPartner'),
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<LocalPartnerDialog
				open={open}
				onOpenChange={onOpenChange}
				localPartnerId={partnerId}
				errorMessage={errorMessage}
				onError={onError}
			/>
		</>
	);
}
