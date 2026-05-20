'use client';

import { Button } from '@/components/button';
import { DatePicker, normalizeToNoon } from '@/components/date-picker';
import { getPayoutRecipientCountsByProviderAction } from '@/lib/server-actions/payout-process-actions';
import type { MobileMoneyProviderPayoutProcessOption } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { formatPayoutProcessLabel } from '@/lib/services/mobile-money-provider/payout-process-options';
import { cn } from '@/lib/utils/cn';
import { now } from '@/lib/utils/now';
import { format } from 'date-fns';
import { CalendarIcon, CircleDollarSignIcon, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StartPayoutProcessDialog } from './start-payout-process-dialog';

const groupByPayoutProcess = (providers: MobileMoneyProviderPayoutProcessOption[]) => {
	const groups: Record<string, MobileMoneyProviderPayoutProcessOption[]> = {};

	for (const provider of providers) {
		(groups[provider.payoutProcess] ??= []).push(provider);
	}

	return Object.entries(groups).map(([process, processProviders]) => ({
		process,
		label: formatPayoutProcessLabel(process) ?? process,
		providers: processProviders,
	}));
};

const PayoutProviderGrid = ({
	providers,
	selectedDate,
	selectedMonthLabel,
	onStartProvider,
}: {
	providers: MobileMoneyProviderPayoutProcessOption[];
	selectedDate: Date;
	selectedMonthLabel: string;
	onStartProvider: (provider: MobileMoneyProviderPayoutProcessOption) => void;
}) => {
	const [recipientCounts, setRecipientCounts] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState(() => providers.length > 0);
	const [countsError, setCountsError] = useState<string | null>(null);
	const processGroups = groupByPayoutProcess(providers);

	useEffect(() => {
		const providerIds = providers.map((provider) => provider.id);

		if (providerIds.length === 0) {
			return;
		}

		let cancelled = false;

		void getPayoutRecipientCountsByProviderAction(providerIds, selectedDate).then((result) => {
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

			setLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, [providers, selectedDate]);

	if (providers.length === 0) {
		return <p className="text-muted-foreground text-sm">No payout processes available.</p>;
	}

	return (
		<>
			{countsError ? <p className="text-destructive mb-6 text-sm">{countsError}</p> : null}

			<div className="flex flex-col gap-10">
				{processGroups.map(({ process, label, providers: processProviders }) => (
					<section key={process} className="space-y-4" aria-labelledby={`payout-process-${process}`}>
						<div className="flex flex-wrap items-center gap-2">
							<FileSpreadsheet className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden />
							<h2 id={`payout-process-${process}`} className="text-lg font-medium text-pretty">
								{label}
							</h2>
							<span className="text-muted-foreground text-sm">
								{processProviders.length} provider{processProviders.length === 1 ? '' : 's'}
							</span>
						</div>

						<ul
							className={cn('grid list-none gap-4 p-0', 'sm:grid-cols-2', processProviders.length >= 3 && 'xl:grid-cols-3')}
						>
							{processProviders.map((provider) => (
								<li key={provider.id}>
									<article className="flex h-full flex-col justify-between gap-5 rounded-2xl bg-slate-100 p-5">
										<div className="space-y-1">
											<h3 className="text-base font-medium text-pretty">{provider.name}</h3>
											<p className="text-muted-foreground text-sm" data-testid={`payout-recipient-count-${provider.id}`}>
												{loading
													? 'Loading recipient count…'
													: `${recipientCounts[provider.id] ?? 0} recipient${recipientCounts[provider.id] === 1 ? '' : 's'} would receive a payout in ${selectedMonthLabel}`}
											</p>
										</div>
										<Button
											data-testid={`start-payout-process-${provider.id}`}
											className="w-full"
											onClick={() => onStartProvider(provider)}
										>
											<CircleDollarSignIcon className="h-4 w-4" aria-hidden />
											Start process
										</Button>
									</article>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</>
	);
};

export const PayoutProcessOverviewClient = ({
	providers,
	error,
}: {
	providers: MobileMoneyProviderPayoutProcessOption[];
	error: string | null;
}) => {
	const [selectedDate, setSelectedDate] = useState(() => normalizeToNoon(now()));
	const [activeProvider, setActiveProvider] = useState<MobileMoneyProviderPayoutProcessOption | null>(null);
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

			<PayoutProviderGrid
				key={`${monthKey}-${gridKey}`}
				providers={providers}
				selectedDate={selectedDate}
				selectedMonthLabel={selectedMonthLabel}
				onStartProvider={setActiveProvider}
			/>

			{activeProvider ? (
				<StartPayoutProcessDialog
					key={`${activeProvider.id}-${monthKey}`}
					providerId={activeProvider.id}
					providerName={activeProvider.name}
					selectedDate={selectedDate}
					selectedMonthLabel={selectedMonthLabel}
					open
					onClose={() => {
						setActiveProvider(null);
						setGridKey((key) => key + 1);
					}}
				/>
			) : null}
		</>
	);
};
