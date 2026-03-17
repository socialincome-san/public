'use client';

import { TableCell, TableRow } from '@/components/table';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import Link from 'next/link';

type Props = {
	row: ProgramCountryFeasibilityRow;
	bgClass: string;
};

export const ExpansionRow = ({ row, bgClass }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	const renderSource = (source: ProgramCountryFeasibilityRow['cash']['details']['source'] | undefined) => {
		if (!source) {
			return null;
		}

		const translatedSourceText = source.translationKey ? t(source.translationKey, source.translationContext) : source.text;

		if (source.href) {
			return (
				<Link
					href={source.href}
					target="_blank"
					rel="noreferrer"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition"
				>
					{translatedSourceText}
					<span aria-hidden>↗</span>
				</Link>
			);
		}

		return <p className="text-muted-foreground">{translatedSourceText}</p>;
	};

	const renderDetails = (details: ProgramCountryFeasibilityRow['cash']['details']) => {
		return (
			<div className="space-y-1 text-sm">
				<p>{t(details.translationKey, details.translationContext)}</p>
				{renderSource(details.source)}
			</div>
		);
	};

	return (
		<TableRow className={bgClass}>
			<TableCell />
			<TableCell />
			<TableCell className="p-4 align-top">{renderDetails(row.cash.details)}</TableCell>
			<TableCell className="p-4 align-top">{renderDetails(row.mobileMoney.details)}</TableCell>
			<TableCell className="p-4 align-top">{renderDetails(row.mobileNetwork.details)}</TableCell>
			<TableCell className="p-4 align-top">{renderDetails(row.sanctions.details)}</TableCell>
			<TableCell />
		</TableRow>
	);
};
