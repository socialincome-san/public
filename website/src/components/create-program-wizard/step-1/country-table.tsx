'use client';

import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';

import { Button } from '../../button';
import { RadioGroup, RadioGroupItem } from '../../radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../table';

import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { CountryConditionBadge } from './country-condition-badge';

type Props = {
	rows: ProgramCountryFeasibilityRow[];
	value?: string | null;
	openIds: string[];
	onValueChange?: (id: string | null) => void;
	onToggleRow: (id: string) => void;
};

export function CountryTable({ rows, value, openIds, onValueChange, onToggleRow }: Props) {
	function renderDetails(details: ProgramCountryFeasibilityRow['cash']['details']) {
		return (
			<div className="space-y-1 text-sm">
				<p>{details.text}</p>

				{details.source?.href ? (
					<Link
						href={details.source.href}
						target="_blank"
						rel="noreferrer"
						className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition"
					>
						{details.source.text}
						<span aria-hidden>↗</span>
					</Link>
				) : details.source?.text ? (
					<p className="text-muted-foreground">{details.source.text}</p>
				) : null}
			</div>
		);
	}

	return (
		<RadioGroup value={value ?? ''} onValueChange={onValueChange}>
			<div className="overflow-hidden rounded-xl border">
				<Table>
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

										<TableCell className="flex items-center gap-3">
											<div className="bg-muted h-6 w-6 rounded-full" />
											{row.country.name}
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

									<TableRow className={cn(bgClass, 'border-t')}>
										<TableCell colSpan={7} className="p-0">
											<div
												className={cn(
													'overflow-hidden transition-all duration-300 ease-out',
													isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0',
												)}
											>
												<div className="grid grid-cols-6 gap-4 px-4 py-3">
													<div />
													<div />
													<div>{renderDetails(row.cash.details)}</div>
													<div>{renderDetails(row.mobileMoney.details)}</div>
													<div>{renderDetails(row.mobileNetwork.details)}</div>
													<div>{renderDetails(row.sanctions.details)}</div>
												</div>
											</div>
										</TableCell>
									</TableRow>
								</Fragment>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</RadioGroup>
	);
}
