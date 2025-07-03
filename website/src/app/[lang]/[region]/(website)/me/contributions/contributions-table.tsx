'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useContributions } from '@/app/[lang]/[region]/(website)/me/hooks';
import { useTranslator } from '@/hooks/useTranslator';
import { toDateTime } from '@socialincome/shared/src/utils/date';
import {
	SpinnerIcon,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Typography,
} from '@socialincome/ui';
import _ from 'lodash';

type ContributionsTableProps = {
	translations: {
		date: string;
		amount: string;
		source: string;
		status: string;
	};
} & DefaultParams;

export function ContributionsTable({ lang, translations }: ContributionsTableProps) {
	const translator = useTranslator(lang, 'website-me');
	const { contributions, isLoading } = useContributions();

	if (isLoading) {
		return <SpinnerIcon />;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{translations.date}</TableHead>
					<TableHead>{translations.source}</TableHead>
					<TableHead className="text-right">{translations.amount}</TableHead>
					<TableHead className="text-right">{translations.status}</TableHead>
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
							<TableCell className="text-right">
								<Typography>{translator?.t(`contributions.status.${contribution.get('status')}`)}</Typography>
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
