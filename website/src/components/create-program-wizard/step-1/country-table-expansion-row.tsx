'use client';

import type { ProgramCountryFeasibilityRow } from '@/modules/countries/country.types';
import { TableCell, TableRow } from '@socialincome/design-system/data-display/table/table';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const conditionKeys = [
	'step1.details.cash.met',
	'step1.details.cash.not_met',
	'step1.details.mobile_money.met',
	'step1.details.mobile_money.not_met',
	'step1.details.mobile_network.met',
	'step1.details.mobile_network.met_with_tech',
	'step1.details.mobile_network.not_met',
	'step1.details.mobile_network.not_met_unknown',
	'step1.details.sanctions.met',
	'step1.details.sanctions.restrictions_apply',
	'step1.source.si_research',
	'step1.source.sanctions_lists',
] as const;

const isConditionKey = (key: string): key is (typeof conditionKeys)[number] =>
	conditionKeys.some((conditionKey) => conditionKey === key);

type Props = {
	row: ProgramCountryFeasibilityRow;
};

export const ExpansionRow = ({ row }: Props) => {
	const t = useTranslations('create-program-wizard');

	const renderSource = (source: ProgramCountryFeasibilityRow['cash']['details']['source'] | undefined) => {
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

	const renderDetails = (details: ProgramCountryFeasibilityRow['cash']['details']) => {
		return (
			<div className="space-y-1 text-sm">
				<p>
					{isConditionKey(details.translationKey)
						? t(details.translationKey, details.translationContext)
						: details.translationKey}
				</p>
				{renderSource(details.source)}
			</div>
		);
	};

	return (
		<TableRow data-state="selected">
			<TableCell />
			<TableCell />
			<TableCell verticalAlign="top">{renderDetails(row.cash.details)}</TableCell>
			<TableCell verticalAlign="top">{renderDetails(row.mobileMoney.details)}</TableCell>
			<TableCell verticalAlign="top">{renderDetails(row.mobileNetwork.details)}</TableCell>
			<TableCell verticalAlign="top">{renderDetails(row.sanctions.details)}</TableCell>
			<TableCell />
		</TableRow>
	);
};
