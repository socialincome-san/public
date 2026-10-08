'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getYourDonationCertificatesTableConfig } from '@/components/data-table/configs/your-donation-certificates-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { YourDonationCertificateTableViewRow } from '@/modules/donation-certificates/donation-certificate.types';
import { FileTextIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import GenerateDonationCertificateDialog from './generate-donation-certificate-dialog';

export const YourDonationCertificateTable = ({
	rows,
	error,
	query,
}: {
	rows: YourDonationCertificateTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) => {
	const [open, setOpen] = useState<boolean>(false);
	const t = useTranslations('website-me');
	const config = getYourDonationCertificatesTableConfig({
		title: t('sections.contributions.donation-certificates-long'),
		emptyMessage: t.rich('donation-certificates.no-certificates-yet', {
			br: () => <br />,
			contact: (chunks) => (
				<a href="mailto:hello@socialincome.org" className="underline">
					{chunks}
				</a>
			),
		}),
	});

	return (
		<>
			<GenerateDonationCertificateDialog open={open} setOpen={setOpen} />
			<ConfiguredDataTableClient
				config={config}
				titleInfoTooltip="Shows donation certificates available for your contributor account."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: t('donation-certificates.generate-certificate'),
						icon: <FileTextIcon />,
						onSelect: () => setOpen(true),
					},
				]}
			/>
		</>
	);
};
