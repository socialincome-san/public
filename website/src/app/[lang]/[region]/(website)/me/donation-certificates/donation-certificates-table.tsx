'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useDonationCertificates } from '@/app/[lang]/[region]/(website)/me/hooks';
import { useStorage, useStorageDownloadURL } from '@/lib/firebase/hooks/useStorage';
import {
	linkCn,
	SpinnerIcon,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Typography,
} from '@socialincome/ui';
import { ref } from 'firebase/storage';
import Link from 'next/link';

type ContributionsTableProps = {
	translations: {
		year: string;
		downloadPDF: string;
		noCertificatesYet: string;
	};
} & DefaultParams;

function FetchFileLink({ storagePath }: { storagePath: string }) {
	const storage = useStorage();
	const { data } = useStorageDownloadURL(ref(storage, storagePath));
	if (!data) return null;
	return (
		<Link className={linkCn()} href={data} target="_blank" rel="noopener noreferrer">
			Download PDF
		</Link>
	);
}

export function DonationCertificatesTable({ translations }: ContributionsTableProps) {
	const { donationCertificates, isLoading } = useDonationCertificates();

	if (isLoading) {
		return <SpinnerIcon />;
	}

	if (donationCertificates === undefined || donationCertificates.size === 0) {
		return <Typography dangerouslySetInnerHTML={{ __html: translations.noCertificatesYet }} />;
	} else {
		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{translations.year}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{donationCertificates.docs.map((donationCertificateDoc) => {
						const storagePath = donationCertificateDoc.get('storage_path');
						if (!storagePath) return;
						return (
							<TableRow key={donationCertificateDoc.id}>
								<TableCell>
									<Typography weight="semibold">{donationCertificateDoc.get('year')}</Typography>
								</TableCell>
								<TableCell className="text-right">
									<FetchFileLink storagePath={storagePath} />
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		);
	}
}
