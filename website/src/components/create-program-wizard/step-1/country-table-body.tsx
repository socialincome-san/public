'use client';

import { CountryFlag } from '@/components/country-flag';
import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { getCountryNameByCode } from '@/lib/types/country';
import type { ProgramCountryFeasibilityRow } from '@/modules/countries/country.types';
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
import { Fragment } from 'react';
import { CountryConditionBadge } from './country-condition-badge';
import { ExpansionRow } from './country-table-expansion-row';

type Props = {
	rows: ProgramCountryFeasibilityRow[];
	value?: string | null;
	openIds: string[];
	onToggleRow: (id: string) => void;
};

export const CountryTableBody = ({ rows, value, openIds, onToggleRow }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div
			data-testid="country-table"
			className="max-h-96 w-full max-w-full min-w-0 overflow-x-auto overflow-y-auto rounded-xl border"
		>
			{/* Keeps the seven columns readable; the container scrolls horizontally on narrow screens */}
			<div className="min-w-[820px]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead width="fit" />
							<TableHead />
							<TableHead>{t('step1.table.cash')}</TableHead>
							<TableHead>{t('step1.table.mobile_money')}</TableHead>
							<TableHead>{t('step1.table.mobile_network')}</TableHead>
							<TableHead>{t('step1.table.sanctions')}</TableHead>
							<TableHead width="fit" />
						</TableRow>
					</TableHeader>

					<TableBody>
						{rows.map((row) => {
							const isOpen = openIds.includes(row.id);
							// Open rows share the highlight so they read as one group with their expansion row
							const rowState = value === row.id || isOpen ? 'selected' : undefined;

							return (
								<Fragment key={row.id}>
									<TableRow onClick={() => onToggleRow(row.id)} data-state={rowState}>
										<TableCell onClick={(e) => e.stopPropagation()}>
											<RadioGroupItem value={row.id} />
										</TableCell>

										<TableCell>
											<div className="flex items-center gap-3 whitespace-nowrap">
												<CountryFlag country={row.country.isoCode} />
												<span>{getCountryNameByCode(row.country.isoCode)}</span>
											</div>
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

									{isOpen && <ExpansionRow row={row} />}
								</Fragment>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};
