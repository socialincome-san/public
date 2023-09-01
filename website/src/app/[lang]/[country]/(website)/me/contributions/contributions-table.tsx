'use client';

import { DefaultParams } from '@/app/[lang]/[country]';
import { UserContext } from '@/app/[lang]/[country]/(website)/me/user-context-provider';
import { useTranslator } from '@/hooks/useTranslator';
import { CONTRIBUTION_FIRESTORE_PATH, StatusKey, USER_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { toDateTime } from '@socialincome/shared/src/utils/date';
import { Table, Typography } from '@socialincome/ui';
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
		[user],
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

	return (
		<Table size="sm">
			<Table.Head>
				<Typography weight="medium" as="span">
					{translations.date}
				</Typography>
				<Typography weight="medium" as="span">
					{translations.amount}
				</Typography>
			</Table.Head>
			<Table.Body>
				{contributions?.docs.map((contribution, index) => {
					return (
						<Table.Row key={index}>
							<Typography as="span">
								{toDateTime(contribution.get('created')).toFormat('DD', { locale: lang })}
							</Typography>
							<Typography as="span">
								{translator?.t('contributions.amount-currency', {
									context: { amount: contribution.get('amount'), currency: contribution.get('currency'), locale: lang },
								})}
							</Typography>
						</Table.Row>
					);
				})}
			</Table.Body>
		</Table>
	);
}
