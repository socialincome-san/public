'use client';

import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../button';
import { RadioGroup, RadioGroupItem } from '../radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table';

import { CountryConditionBadge } from './country-condition-badge';
import { CountryTableRow } from './types';

export type CountryTableProps = {
	rows: CountryTableRow[];
	value?: string | null;
	onValueChange?: (id: string | null) => void;
};

export function CountryTable({ rows, value, onValueChange }: CountryTableProps) {
	const [internalValue, setInternalValue] = useState<string | null>(null);
	const selectedId = value ?? internalValue;

	const [openRows, setOpenRows] = useState<Set<string>>(new Set());

	function setSelected(id: string) {
		onValueChange?.(id);
		setInternalValue(id);
	}

	function toggleRow(id: string) {
		setOpenRows((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	}

	function renderDetails(details: CountryTableRow['cash']['details']) {
		return (
			<div className="space-y-1 text-sm">
				<p>{details.text}</p>

				{details.source &&
					(details.source.href ? (
						<a
							href={details.source.href}
							target="_blank"
							rel="noreferrer"
							className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition"
						>
							{details.source.text}
							<span aria-hidden>↗</span>
						</a>
					) : (
						<p className="text-muted-foreground">{details.source.text}</p>
					))}
			</div>
		);
	}

	return (
		<RadioGroup value={selectedId ?? ''} onValueChange={setSelected}>
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
						const isOpen = openRows.has(row.id);

						// Background only for hover or open
						const bgClass = isOpen ? 'bg-muted' : 'hover:bg-muted';

						// Always separate rows with top border (except first)
						const topBorder = index !== 0 ? 'border-t' : '';

						return (
							<>
								{/* MAIN ROW */}
								<TableRow
									key={row.id}
									onClick={() => toggleRow(row.id)}
									className={cn('cursor-pointer transition-colors', bgClass, topBorder)}
								>
									<TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
										<RadioGroupItem value={row.id} />
									</TableCell>

									<TableCell className="flex items-center gap-3">
										{/* TODO: add round country flag */}
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

									<TableCell className="w-10 text-right" onClick={(e) => e.stopPropagation()}>
										<Button type="button" variant="ghost" size="icon" onClick={() => toggleRow(row.id)}>
											<ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
										</Button>
									</TableCell>
								</TableRow>

								{/* DETAILS ROW */}
								{isOpen && (
									<TableRow className="bg-muted">
										<TableCell />
										<TableCell />

										<TableCell>{renderDetails(row.cash.details)}</TableCell>

										<TableCell>{renderDetails(row.mobileMoney.details)}</TableCell>

										<TableCell>{renderDetails(row.mobileNetwork.details)}</TableCell>

										<TableCell>{renderDetails(row.sanctions.details)}</TableCell>

										<TableCell />
									</TableRow>
								)}
							</>
						);
					})}
				</TableBody>
			</Table>
		</RadioGroup>
	);
}
