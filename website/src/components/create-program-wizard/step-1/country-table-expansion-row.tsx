'use client';

import { isMessageKey } from '@/lib/i18n/message-keys';
import type { CountryEligibilityRow } from '@/modules/countries/country.types';
import { TableCell, TableRow } from '@socialincome/design-system/data-display/table/table';
import { useMessages, useTranslations } from 'next-intl';
import Link from 'next/link';
import { CountryPageLink } from './country-page-link';

type Props = {
	row: CountryEligibilityRow;
	selectable: boolean;
	countryPageHref?: string;
};

type CountryFeasibility = CountryEligibilityRow['cash'];

export const CountryConditionDetails = ({ details }: { details: CountryFeasibility['details'] }) => {
	const t = useTranslations('create-program-wizard');
	const messages = useMessages();
	const isConditionKey = (key: string) => isMessageKey(messages, 'create-program-wizard', key);

	const renderSource = (source: CountryFeasibility['details']['source']) => {
		if (!source) {
			return null;
		}

		const translatedSourceText =
			source.translationKey && isConditionKey(source.translationKey)
				? t(source.translationKey, source.translationContext)
				: source.text;

		if (source.href) {
			return (
				<Link
					href={source.href}
					target="_blank"
					rel="noreferrer"
					className="text-muted-foreground hover:text-foreground transition"
				>
					{source.text}
					<span aria-hidden className="ml-1 inline">
						↗
					</span>
				</Link>
			);
		}

		return <p className="text-muted-foreground">{translatedSourceText}</p>;
	};

	return (
		<div className="space-y-1 text-sm break-words">
			<p>
				{isConditionKey(details.translationKey)
					? t(details.translationKey, details.translationContext)
					: details.translationKey}
			</p>
			{renderSource(details.source)}
		</div>
	);
};

export const ExpansionRow = ({ row, selectable, countryPageHref }: Props) => {
	return (
		<TableRow>
			{selectable && <TableCell />}
			<TableCell>
				{countryPageHref !== undefined && (
					<div className="flex justify-center">
						<CountryPageLink href={countryPageHref} />
					</div>
				)}
			</TableCell>
			<TableCell verticalAlign="top">
				<CountryConditionDetails details={row.cash.details} />
			</TableCell>
			<TableCell verticalAlign="top">
				<CountryConditionDetails details={row.mobileMoney.details} />
			</TableCell>
			<TableCell verticalAlign="top">
				<CountryConditionDetails details={row.mobileNetwork.details} />
			</TableCell>
			<TableCell verticalAlign="top">
				<CountryConditionDetails details={row.sanctions.details} />
			</TableCell>
			<TableCell />
		</TableRow>
	);
};
