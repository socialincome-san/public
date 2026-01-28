'use client';

import { Button } from '@/components/button';
import { CountryFlag } from '@/components/country-flag';
import { RadioGroupItem } from '@/components/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { getCountryNameByIsoCode } from '@/lib/services/country/iso-countries';
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

export function CountryTableBody({ rows, value, openIds, onToggleRow }: Props) {
	return (
		<div className="max-h-96 overflow-auto rounded-xl border">
			<Table className="table-fixed">
				<TableHeader className="bg-muted/40">
					<TableRow>
						<TableHead className="w-10" />
						<TableHead>Country</TableHead>
						<TableHead>Suitability of cash</TableHead>
						<TableHead>Mobile money</TableHead>
						<TableHead>Mobile network</TableHead>
						<TableHead>No sanctions</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>

				<TableBody>
					{rows.map((row, index) => {
						const isOpen = openIds.includes(row.id);
						const isSelected = value === row.id;
						const bgClass = isSelected ? 'bg-muted' : isOpen ? 'bg-muted/50' : 'hover:bg-muted/40';

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
										<span className="truncate">{getCountryNameByIsoCode(row.country.isoCode)}</span>
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
}
