'use client';

import { Button } from '@/components/button';
import { DatePicker, normalizeToNoon } from '@/components/date-picker';
import { getPayoutRecipientCountsAction } from '@/lib/server-actions/payout-process-actions';
import { formatPayoutProcessLabel } from '@/lib/services/mobile-money-provider/payout-process-options';
import type { PayoutProcessOverviewOption } from '@/lib/services/payout-process/payout-process-overview.types';
import { cn } from '@/lib/utils/cn';
import { now } from '@/lib/utils/now';
import { format } from 'date-fns';
import { CalendarIcon, CircleDollarSignIcon, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StartPayoutProcessDialog } from './start-payout-process-dialog';

const groupByPayoutProcess = (options: PayoutProcessOverviewOption[]) => {
	const groups: Record<string, PayoutProcessOverviewOption[]> = {};

	for (const option of options) {
		(groups[option.payoutProcess] ??= []).push(option);
	}

	return Object.entries(groups).map(([process, processOptions]) => ({
		process,
		label: formatPayoutProcessLabel(process) ?? process,
		options: processOptions,
	}));
};

const PayoutProcessGrid = ({
	options,
	selectedDate,
	selectedMonthLabel,
	onStartOption,
}: {
	options: PayoutProcessOverviewOption[];
	selectedDate: Date;
	selectedMonthLabel: string;
	onStartOption: (option: PayoutProcessOverviewOption) => void;
}) => {
	const [recipientCounts, setRecipientCounts] = useState<Record<string, number>>({});
	const [countsError, setCountsError] = useState<string | null>(null);
	const requestKey = `${format(selectedDate, 'yyyy-MM')}-${options.map((option) => option.id).join(',')}`;
	const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);
	const loading = options.length > 0 && loadedRequestKey !== requestKey;
	const processGroups = groupByPayoutProcess(options);

	useEffect(() => {
		if (options.length === 0) {
			return;
		}

		let cancelled = false;

		void getPayoutRecipientCountsAction(selectedDate).then((result) => {
			if (cancelled) {
				return;
			}

			if (result.success) {
				setRecipientCounts(result.data);
				setCountsError(null);
			} else {
				setRecipientCounts({});
				setCountsError(result.error);
			}

			setLoadedRequestKey(requestKey);
		});

		return () => {
			cancelled = true;
		};
	}, [options, selectedDate, requestKey]);

	if (options.length === 0) {
		return <p className="text-muted-foreground text-sm">No payout processes available.</p>;
	}

	return (
		<>
			{countsError ? <p className="text-destructive mb-6 text-sm">{countsError}</p> : null}

			<div className="flex flex-col gap-10">
				{processGroups.map(({ process, label, options: processOptions }) => (
					<section key={process} className="space-y-4" aria-labelledby={`payout-process-${process}`}>
						<div className="flex flex-wrap items-center gap-2">
							<FileSpreadsheet className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden />
							<h2 id={`payout-process-${process}`} className="text-lg font-medium text-pretty">
								{label}
							</h2>
						</div>

						<ul className={cn('grid list-none gap-4 p-0', 'sm:grid-cols-2', processOptions.length >= 3 && 'xl:grid-cols-3')}>
							{processOptions.map((option) => {
								const recipientCount = recipientCounts[option.id] ?? 0;
								const canStartProcess = !loading && recipientCount > 0;

								return (
									<li key={option.id}>
										<article className="flex h-full flex-col justify-between gap-5 rounded-2xl bg-slate-100 p-5">
											<div className="space-y-1">
												<h3 className="text-base font-medium text-pretty">
													{option.kind === 'telecel_csv' ? option.providerNames.join(', ') : option.name}
												</h3>
												<p className="text-muted-foreground text-sm" data-testid={`payout-recipient-count-${option.id}`}>
													{loading
														? 'Loading recipient count…'
														: `${recipientCount} recipient${recipientCount === 1 ? '' : 's'} would receive a payout in ${selectedMonthLabel}`}
												</p>
											</div>
											<Button
												data-testid={`start-payout-process-${option.id}`}
												className="w-full"
												disabled={!canStartProcess}
												onClick={() => onStartOption(option)}
											>
												<CircleDollarSignIcon className="h-4 w-4" aria-hidden />
												Start process
											</Button>
										</article>
									</li>
								);
							})}
						</ul>
					</section>
				))}
			</div>
		</>
	);
};

export const PayoutProcessOverviewClient = ({
	options,
	error,
}: {
	options: PayoutProcessOverviewOption[];
	error: string | null;
}) => {
	const [selectedDate, setSelectedDate] = useState(() => normalizeToNoon(now()));
	const [activeOption, setActiveOption] = useState<PayoutProcessOverviewOption | null>(null);
	const [gridKey, setGridKey] = useState(0);

	const selectedMonthLabel = format(selectedDate, 'MMMM yyyy');
	const monthKey = format(selectedDate, 'yyyy-MM');

	if (error) {
		return <p className="text-destructive text-sm">{error}</p>;
	}

	return (
		<>
			<div className="mb-10 rounded-2xl bg-slate-100 p-5 sm:p-6" data-testid="payout-overview-month-picker">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="min-w-0 space-y-1">
						<p className="flex items-center gap-2 text-sm font-medium">
							<CalendarIcon className="h-4 w-4 shrink-0" aria-hidden />
							Payout month
						</p>
						<p className="text-muted-foreground text-sm">
							Select the month first, then start a process below. Using{' '}
							<span className="text-foreground font-medium">{selectedMonthLabel}</span>.
						</p>
					</div>
					<div className="w-full shrink-0 lg:max-w-xs">
						<DatePicker selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
					</div>
				</div>
			</div>

			<PayoutProcessGrid
				key={`${monthKey}-${gridKey}`}
				options={options}
				selectedDate={selectedDate}
				selectedMonthLabel={selectedMonthLabel}
				onStartOption={setActiveOption}
			/>

			{activeOption ? (
				<StartPayoutProcessDialog
					key={`${activeOption.id}-${monthKey}`}
					option={activeOption}
					selectedDate={selectedDate}
					selectedMonthLabel={selectedMonthLabel}
					open
					onClose={() => {
						setActiveOption(null);
						setGridKey((key) => key + 1);
					}}
				/>
			) : null}
		</>
	);
};
