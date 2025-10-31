'use client';

import { Button } from '@/app/portal/components/button';
import { makePayoutColumns } from '@/app/portal/components/data-table/columns/payouts';
import DataTable from '@/app/portal/components/data-table/data-table';
import { DatePicker } from '@/app/portal/components/date-picker';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import {
	downloadPayoutCsvAction,
	downloadRegistrationCsvAction,
	generateCurrentMonthPayoutsAction,
	markCompletedRecipientsAsFormerAction,
	previewCompletedRecipientsAction,
	previewCurrentMonthPayoutsAction,
} from '@/app/portal/server-actions/payout-actions';
import type { PayoutTableViewRow } from '@socialincome/shared/src/database/services/payout/payout.types';
import { format } from 'date-fns';
import { CalendarIcon, DownloadIcon, EyeIcon, PlayIcon, UserCheckIcon } from 'lucide-react';
import { useState } from 'react';

type StepResult = string | object | string[] | null;

type Step = {
	id: number;
	title: string;
	description: string;
	label: string;
	icon: JSX.Element;
	variant?: 'default' | 'outline';
	action: () => Promise<StepResult>;
};

export function PayoutsTableClient({ rows, error }: { rows: PayoutTableViewRow[]; error: string | null }) {
	const [open, setOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [results, setResults] = useState<Record<number, StepResult>>({});
	const iconClass = 'h-4 w-4';
	const getMonthFileLabel = () => format(selectedDate, 'yyyy-MM');

	async function handleCsvDownload(csv: string, filename: string) {
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	}

	const steps: Step[] = [
		{
			id: 1,
			title: 'Download registration CSV',
			description: 'Download a list of all active recipients. No changes will be made.',
			label: 'Download registration CSV',
			icon: <DownloadIcon className={iconClass} />,
			variant: 'outline',
			action: async () => {
				const csv = await downloadRegistrationCsvAction();
				await handleCsvDownload(csv, `registration-${getMonthFileLabel()}.csv`);
				return 'Downloaded registration CSV.';
			},
		},
		{
			id: 2,
			title: 'Download payout CSV',
			description: 'Generate the payout CSV for all recipients of the selected month. No changes will be made.',
			label: 'Download payout CSV',
			icon: <DownloadIcon className={iconClass} />,
			variant: 'outline',
			action: async () => {
				const csv = await downloadPayoutCsvAction(selectedDate);
				await handleCsvDownload(csv, `payouts-${getMonthFileLabel()}.csv`);
				return 'Downloaded payout CSV.';
			},
		},
		{
			id: 3,
			title: 'Preview payouts',
			description: 'Preview which payouts would be created for this month — really no changes yet.',
			label: 'Preview payouts (no changes)',
			icon: <EyeIcon className={iconClass} />,
			variant: 'outline',
			action: async () => previewCurrentMonthPayoutsAction(selectedDate),
		},
		{
			id: 4,
			title: 'Generate payouts',
			description:
				'Actually create the payouts for the selected month. This applies the changes from the preview above.',
			label: 'Generate payouts (apply changes)',
			icon: <PlayIcon className={iconClass} />,
			action: async () => generateCurrentMonthPayoutsAction(selectedDate),
		},
		{
			id: 5,
			title: 'Preview former recipients',
			description: 'Preview which recipients have completed all payments — really no changes yet.',
			label: 'Preview former recipients (no changes)',
			icon: <EyeIcon className={iconClass} />,
			variant: 'outline',
			action: async () => previewCompletedRecipientsAction(),
		},
		{
			id: 6,
			title: 'Mark recipients as former',
			description: 'Set all recipients shown in the preview above to “former” status. This applies the changes.',
			label: 'Mark recipients as former (apply changes)',
			icon: <UserCheckIcon className={iconClass} />,
			action: async () => markCompletedRecipientsAsFormerAction(),
		},
	];

	async function handleAction(step: Step) {
		try {
			const result = await step.action();
			setResults((prev) => ({ ...prev, [step.id]: result }));
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Something went wrong.';
			setResults((prev) => ({ ...prev, [step.id]: message }));
		}
	}

	return (
		<>
			<DataTable
				title="Payouts"
				error={error}
				emptyMessage="No payouts found"
				data={rows}
				makeColumns={makePayoutColumns}
				actions={<Button onClick={() => setOpen(true)}>Start payout process</Button>}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-[580px]">
					<DialogHeader>
						<DialogTitle>Payout process</DialogTitle>
					</DialogHeader>

					<div className="border-border bg-muted/40 mb-4 flex flex-col gap-3 rounded-xl border p-4">
						<p className="mb-1 flex items-center gap-2 text-sm font-medium">
							<CalendarIcon className={iconClass} /> Select payout month
						</p>
						<DatePicker selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
						<p className="text-muted-foreground mt-1 text-xs">All actions below use this selected month.</p>
					</div>

					<div className="flex flex-col gap-5">
						{steps.map((step) => (
							<div key={step.id} className="border-border bg-muted/40 flex flex-col gap-2 rounded-xl border p-3">
								<p className="font-medium">
									Step {step.id}: {step.title}
								</p>
								<p className="text-muted-foreground mb-1 text-xs">{step.description}</p>

								<Button
									className="flex w-full items-center justify-center gap-2"
									variant={step.variant ?? 'default'}
									onClick={() => handleAction(step)}
								>
									{step.icon}
									<span>{step.label}</span>
								</Button>

								{results[step.id] && (
									<div className="bg-muted mt-2 max-h-40 overflow-auto rounded-lg border p-2 text-xs">
										<pre>{JSON.stringify(results[step.id], null, 2)}</pre>
									</div>
								)}
							</div>
						))}
					</div>

					<DialogFooter className="mt-4 flex justify-end">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
