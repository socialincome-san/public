'use client';

import { Button } from '@/components/button';
import { CountryFlag } from '@/components/country-flag';
import { RadioGroupItem } from '@/components/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { getCountryNameByCode } from '@/lib/types/country';
import { cn } from '@/lib/utils/cn';
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
		<div data-testid="country-table" className="max-h-96 overflow-auto rounded-xl border">
			<Table className="table-fixed">
				<TableHeader className="bg-muted/40">
					<TableRow>
						<TableHead className="w-10" />
						<TableHead />
						<TableHead>{t('step1.table.cash')}</TableHead>
						<TableHead>{t('step1.table.mobile_money')}</TableHead>
						<TableHead>{t('step1.table.mobile_network')}</TableHead>
						<TableHead>{t('step1.table.sanctions')}</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>

				<TableBody>
					{rows.map((row, index) => {
						const isOpen = openIds.includes(row.id);
						const isSelected = value === row.id;
						let bgClass = 'hover:bg-muted/40';
						if (isSelected) {
							bgClass = 'bg-muted';
						} else if (isOpen) {
							bgClass = 'bg-muted/50';
						}

						return (
							<Fragment key={row.id}>
								<TableRow
									onClick={() => onToggleRow(row.id)}
									className={cn('cursor-pointer transition-colors', bgClass, index !== 0 && 'border-t')}
								>
									<TableCell onClick={(e) => e.stopPropagation()}>
										<RadioGroupItem value={row.id} />
									</TableCell>

									<TableCell className="flex items-center gap-3 truncate">
										<CountryFlag country={row.country.isoCode} />
										<span className="truncate">{getCountryNameByCode(row.country.isoCode)}</span>
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

								{isOpen && <ExpansionRow row={row} bgClass={bgClass} />}
							</Fragment>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};
