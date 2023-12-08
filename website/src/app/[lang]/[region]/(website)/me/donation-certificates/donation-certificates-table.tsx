'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { UserContext } from '@/app/[lang]/[region]/(website)/me/user-context-provider';
import { useTranslator } from '@/hooks/useTranslator';
import { orderBy } from '@firebase/firestore';
import { DONATION_CERTIFICATE_FIRESTORE_PATH } from '@socialincome/shared/src/types/donation-certificate';
import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Typography } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query } from 'firebase/firestore';
import Link from 'next/link';
import { useContext } from 'react';
import { useFirestore } from 'reactfire';

type ContributionsTableProps = {
	translations: {
		year: string;
		downloadPDF: string;
		noCertficatesYet: string;
	};
} & DefaultParams;

export function DonationCertificatesTable({ lang, translations }: ContributionsTableProps) {
	const firestore = useFirestore();
	const translator = useTranslator(lang, 'website-me');
	const { user } = useContext(UserContext);
	const { data: donationCertificates } = useQuery({
		queryKey: ['DonationCertificatesTable', user, firestore],
		queryFn: async () => {
			if (user && firestore) {
				return await getDocs(
					query(
						collection(firestore, USER_FIRESTORE_PATH, user.id, DONATION_CERTIFICATE_FIRESTORE_PATH),
						orderBy('year', 'desc'),
					),
				);
			} else return null;
		},
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	if (donationCertificates?.size === 0) {
		return <Typography dangerouslySetInnerHTML={{ __html: translations.noCertficatesYet }} />;
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
