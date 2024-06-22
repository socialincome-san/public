'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useDonationCertificates } from '@/app/[lang]/[region]/(website)/me/hooks';
import { SpinnerIcon } from '@/components/logos/spinner-icon';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Typography } from '@socialincome/ui';
import Link from 'next/link';

type ContributionsTableProps = {
	translations: {
		year: string;
		downloadPDF: string;
		noCertificatesYet: string;
	};
} & DefaultParams;

export function DonationCertificatesTable({ translations }: ContributionsTableProps) {
	const { donationCertificates, isLoading } = useDonationCertificates();

	if (isLoading) {
		return <SpinnerIcon />;
	}

	if (donationCertificates?.size === 0) {
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
					{donationCertificates?.docs.map((donationCertificateDoc, index) => {
						return (
							<TableRow key={index}>
								<TableCell>
									<Typography>{donationCertificateDoc.get('year')}</Typography>
								</TableCell>
								<TableCell className="text-right">
									<Link href={donationCertificateDoc.get('url')}>
										<Button variant="link">{translations.downloadPDF}</Button>
									</Link>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		);
	}
}
