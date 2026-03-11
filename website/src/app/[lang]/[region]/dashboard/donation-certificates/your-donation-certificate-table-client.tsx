'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { getYourDonationCertificatesTableConfig } from '@/components/data-table/configs/your-donation-certificates-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { FileTextIcon } from 'lucide-react';
import { useState } from 'react';
import GenerateDonationCertificateDialog from './generate-donation-certificate-dialog';

export const YourDonationCertificateTable = ({
	rows,
	error,
	lang,
	query,
}: {
	rows: YourDonationCertificateTableViewRow[];
	error: string | null;
	lang: WebsiteLanguage;
	query?: TableQueryState & { totalRows: number };
}) => {
	const [open, setOpen] = useState<boolean>(false);
	const translator = useTranslator(lang, 'website-me');
	const config = getYourDonationCertificatesTableConfig({
		title: translator?.t('sections.contributions.donation-certificates-long') ?? '',
		emptyMessage: translator?.t('donation-certificates.no-certificates-yet') ?? '',
	});

	return (
		<>
			<GenerateDonationCertificateDialog open={open} setOpen={setOpen} lang={lang} />
			<ConfiguredDataTableClient
				config={config}
				titleInfoTooltip="Shows donation certificates available for your contributor account."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: translator?.t('donation-certificates.generate-certificate') ?? '',
						icon: <FileTextIcon />,
						onSelect: () => setOpen(true),
					},
				]}
				lang={lang}
			/>
		</>
	);
};
