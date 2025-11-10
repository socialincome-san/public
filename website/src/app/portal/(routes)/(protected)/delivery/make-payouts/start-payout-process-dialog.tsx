'use client';

import { Button } from '@/app/portal/components/button';
import { DatePicker } from '@/app/portal/components/date-picker';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/portal/components/dialog';
import { StepResultBox } from '@/app/portal/components/step-result-box';
import {
	generateCurrentMonthPayoutsAction,
	generatePayoutCsvAction,
	generateRegistrationCsvAction,
	markCompletedRecipientsAsFormerAction,
	previewCompletedRecipientsAction,
	previewCurrentMonthPayoutsAction,
} from '@/app/portal/server-actions/payout-actions';
import { format } from 'date-fns';
import { CalendarIcon, EyeIcon, PlayIcon, TableIcon, UserCheckIcon } from 'lucide-react';
import { useState } from 'react';

type StepResult = string | object | string[] | null;

export function StartPayoutProcessDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [results, setResults] = useState<Record<number, StepResult>>({});

	const iconClass = 'h-4 w-4';
	const monthLabel = () => format(selectedDate, 'yyyy-MM');

	function setResult(step: number, value: StepResult) {
		setResults((prev) => ({ ...prev, [step]: value }));
	}

	const steps = [
		{
			id: 1,
			title: 'Generate registration CSV',
			label: 'Generate registration CSV',
			description: 'Shows the CSV that would be sent to Orange — no changes yet.',
			icon: <TableIcon className={iconClass} />,
			variant: 'outline' as const,
			action: async () => generateRegistrationCsvAction(),
			filename: () => `registration-${monthLabel()}.csv`,
		},
		{
			id: 2,
			title: 'Generate payout CSV',
			label: 'Generate payout CSV',
			description: 'Shows the payout CSV for all active recipients — no changes yet.',
			icon: <TableIcon className={iconClass} />,
			variant: 'outline' as const,
			action: async () => generatePayoutCsvAction(selectedDate),
			filename: () => `payouts-${monthLabel()}.csv`,
		},
		{
			id: 3,
			title: 'Preview payouts',
			label: 'Preview payouts (no changes)',
			description: 'Shows which payouts WOULD be created for this month — nothing written yet.',
			icon: <EyeIcon className={iconClass} />,
			variant: 'outline' as const,
			action: async () => previewCurrentMonthPayoutsAction(selectedDate),
			filename: () => `preview-payouts-${monthLabel()}.json`,
		},
		{
			id: 4,
			title: 'Generate payouts',
			label: 'Generate payouts (apply changes)',
			description: 'Actually writes payouts to the database for the selected month.',
			icon: <PlayIcon className={iconClass} />,
			action: async () => generateCurrentMonthPayoutsAction(selectedDate),
			filename: () => `generated-payouts-${monthLabel()}.json`,
		},
		{
			id: 5,
			title: 'Preview former recipients',
			label: 'Preview former recipients (no changes)',
			description: 'Shows which recipients finished all payments — nothing written yet.',
			icon: <EyeIcon className={iconClass} />,
			variant: 'outline' as const,
			action: async () => previewCompletedRecipientsAction(),
			filename: () => `preview-former.json`,
		},
		{
			id: 6,
			title: 'Mark recipients as former',
			label: 'Mark recipients as former (apply changes)',
			description: 'Updates all shown in the preview to status "former".',
			icon: <UserCheckIcon className={iconClass} />,
			action: async () => markCompletedRecipientsAsFormerAction(),
			filename: () => `former-updated.json`,
		},
	];

	async function run(step: (typeof steps)[number]) {
		try {
			const result = await step.action();
			setResult(step.id, result);
		} catch (e) {
			setResult(step.id, e instanceof Error ? e.message : 'Unknown error');
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
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
								onClick={() => run(step)}
							>
								{step.icon}
								{step.label}
							</Button>

							<StepResultBox
								value={results[step.id]}
								filename={step.filename()}
								onClear={() => setResult(step.id, null)}
							/>
						</div>
					))}
				</div>

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={() => setOpen(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
