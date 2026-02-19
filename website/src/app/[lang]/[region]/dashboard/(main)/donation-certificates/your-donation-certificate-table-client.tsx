'use client';

import { Button } from '@/components/button';
import { makeYourCertificatesColumns } from '@/components/data-table/columns/your-donation-certificates';
import DataTable from '@/components/data-table/data-table';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { YourDonationCertificateTableViewRow } from '@/lib/services/donation-certificate/donation-certificate.types';
import { useState } from 'react';
import GenerateDonationCertificateDialog from './generate-donation-certificate-dialog';

export const YourDonationCertificateTable = ({
	rows,
	error,
	lang,
}: {
	rows: YourDonationCertificateTableViewRow[];
	error: string | null;
	lang: WebsiteLanguage;
}) => {
	const [open, setOpen] = useState<boolean>(false);
	const translator = useTranslator(lang, 'website-me');

	return (
		<>
			<GenerateDonationCertificateDialog open={open} setOpen={setOpen} lang={lang} />
			<DataTable
				title={translator?.t('sections.contributions.donation-certificates-long')}
				error={error}
				emptyMessage={
					translator?.t('donation-certificates.no-certificates-yet') || 'You have no donation certificates yet.'
				}
				data={rows}
				actions={
					<Button onClick={() => setOpen(true)}>{translator?.t('donation-certificates.generate-certificate')}</Button>
				}
				makeColumns={makeYourCertificatesColumns}
				lang={lang}
			/>
		</>
	);
};
