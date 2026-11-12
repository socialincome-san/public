'use client';

import type { CountryEligibilityRow } from '@/modules/countries/country.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { cn } from '@socialincome/design-system/cn';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@socialincome/design-system/data-display/table/table';
import { RadioGroupItem } from '@socialincome/design-system/forms/radio-group/radio-group';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import { CountryConditionBadge } from './country-condition-badge';
import { ExpansionRow } from './country-table-expansion-row';
import { CountryTableList } from './country-table-list';
import { CountryTableName } from './country-table-name';

type Props = {
	rows: CountryEligibilityRow[];
	selectable: boolean;
	value?: string | null;
	openIds: string[];
	onToggleRow: (id: string) => void;
	countryPageHrefs?: Record<string, string>;
};

export const CountryTableBody = ({ rows, selectable, value, openIds, onToggleRow, countryPageHrefs }: Props) => {
	const t = useTranslations('create-program-wizard');

	return (
		// The container, not the viewport, decides: the wizard dialog is narrower than the page
		<div data-testid="country-table" className="@container w-full max-w-full min-w-0">
			<div className="@[52rem]:hidden">
				<CountryTableList
					rows={rows}
					selectable={selectable}
					value={value}
					openIds={openIds}
					onToggleRow={onToggleRow}
					countryPageHrefs={countryPageHrefs}
				/>
			</div>

			<div
				className={cn(
					'bg-card hidden overflow-x-auto rounded-xl border @[52rem]:block',
					// In the wizard the table shares a modal with other content, so it scrolls; on its own page it grows with the page
					selectable && 'max-h-96 overflow-y-auto',
				)}
			>
				<Table stickyHeader layout="fixed">
					<TableHeader sticky>
						<TableRow>
							{selectable && <TableHead width="control" />}
							<TableHead>{t('step1.table.country')}</TableHead>
							<TableHead>{t('step1.table.cash')}</TableHead>
							<TableHead>{t('step1.table.mobile_money')}</TableHead>
							<TableHead>{t('step1.table.mobile_network')}</TableHead>
							<TableHead>{t('step1.table.sanctions')}</TableHead>
							<TableHead width="control" />
						</TableRow>
					</TableHeader>

					<TableBody>
						{rows.map((row) => {
							const isOpen = openIds.includes(row.id);
							const rowState = value === row.id || isOpen ? 'selected' : undefined;

							return (
								<Fragment key={row.id}>
									<TableRow onClick={() => onToggleRow(row.id)} data-state={rowState}>
										{selectable && (
											<TableCell onClick={(e) => e.stopPropagation()}>
												<RadioGroupItem value={row.id} />
											</TableCell>
										)}

										<TableCell>
											<CountryTableName country={row.country} />
										</TableCell>

										<TableCell>
											<CountryConditionBadge condition={row.cash.condition} />
										</TableCell>
										<TableCell>
											<CountryConditionBadge condition={row.mobileMoney.condition} />
										</TableCell>
										<TableCell>
											<CountryConditionBadge condition={row.mobileNetwork.condition} />
										</TableCell>
										<TableCell>
											<CountryConditionBadge condition={row.sanctions.condition} />
										</TableCell>

										<TableCell onClick={(e) => e.stopPropagation()}>
											<Button variant="ghost" size="icon" onClick={() => onToggleRow(row.id)}>
												<ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
											</Button>
										</TableCell>
									</TableRow>

									{isOpen && (
										<ExpansionRow
											row={row}
											selectable={selectable}
											countryPageHref={row.country.isActive ? countryPageHrefs?.[row.country.isoCode] : undefined}
										/>
									)}
								</Fragment>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};
