'use client';

import { DefaultParams } from '@/app/[lang]/[country]';
import { UserContext } from '@/app/[lang]/[country]/(website)/me/user-context-provider';
import { useTranslator } from '@/hooks/useTranslator';
import { CONTRIBUTION_FIRESTORE_PATH, StatusKey } from '@socialincome/shared/src/types/Contribution';
import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/User';
import { toDateTime } from '@socialincome/shared/src/utils/date';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Typography } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useContext } from 'react';
import { useFirestore } from 'reactfire';

type ContributionsTableProps = {
	translations: {
		date: string;
		amount: string;
	};
} & DefaultParams;

export function ContributionsTable({ lang, translations }: ContributionsTableProps) {
	const firestore = useFirestore();
	const { user } = useContext(UserContext);
	const translator = useTranslator(lang, 'website-me');
	const { data: contributions } = useQuery(
		[user, firestore],
		async () => {
			if (user && firestore) {
				return await getDocs(
					query(
						collection(firestore, USER_FIRESTORE_PATH, user.id, CONTRIBUTION_FIRESTORE_PATH),
						where('status', '==', StatusKey.SUCCEEDED),
					),
				);
			} else return null;
		},
		{
			staleTime: 1000 * 60 * 60, // 1 hour
		},
	);
	console.log(user?.id, firestore, contributions?.size);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{translations.date}</TableHead>
					<TableHead className="text-right">{translations.amount}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{contributions?.docs.map((contribution, index) => {
					return (
						<TableRow key={index}>
							<TableCell>
								<Typography>{toDateTime(contribution.get('created')).toFormat('DD', { locale: lang })}</Typography>
							</TableCell>
							<TableCell className="text-right">
								<Typography>
									{translator?.t('contributions.amount-currency', {
										context: {
											amount: contribution.get('amount'),
											currency: contribution.get('currency'),
											locale: lang,
										},
									})}
								</Typography>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
