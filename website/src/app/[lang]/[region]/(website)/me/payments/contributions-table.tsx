'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { UserContext } from '@/app/[lang]/[region]/(website)/me/user-context-provider';
import { useTranslator } from '@/hooks/useTranslator';
import { orderBy } from '@firebase/firestore';
import { CONTRIBUTION_FIRESTORE_PATH, StatusKey } from '@socialincome/shared/src/types/contribution';
import { USER_FIRESTORE_PATH } from '@socialincome/shared/src/types/user';
import { toDateTime } from '@socialincome/shared/src/utils/date';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Typography } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import _ from 'lodash';
import { useContext } from 'react';
import { useFirestore } from 'reactfire';

type ContributionsTableProps = {
	translations: {
		date: string;
		amount: string;
		source: string;
	};
} & DefaultParams;

export function ContributionsTable({ lang, translations }: ContributionsTableProps) {
	const firestore = useFirestore();
	const translator = useTranslator(lang, 'website-me');
	const { user } = useContext(UserContext);
	const { data: contributions } = useQuery({
		queryKey: ['ContributionsTable', user, firestore],
		queryFn: async () => {
			if (user && firestore) {
				return await getDocs(
					query(
						collection(firestore, USER_FIRESTORE_PATH, user.id, CONTRIBUTION_FIRESTORE_PATH),
						where('status', '==', StatusKey.SUCCEEDED),
						orderBy('created', 'desc'),
					),
				);
			} else return null;
		},
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{translations.date}</TableHead>
					<TableHead>{translations.source}</TableHead>
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
							<TableCell>{translator?.t(`contributions.sources.${contribution.get('source')}`)}</TableCell>
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
				<TableRow>
					<TableCell>
						<Typography weight="medium">{translator?.t('contributions.total')}</Typography>
					</TableCell>
					<TableCell />
					<TableCell>
						<Typography className="text-right" weight="medium">
							{translator?.t('contributions.amount-currency', {
								context: {
									amount: _.sum(contributions?.docs.map((contribution) => contribution.get('amount'))),
									currency: contributions?.docs.at(0)?.get('currency'),
									locale: lang,
								},
							})}
						</Typography>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
