'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/dialog';
import { StepResultBox } from '@/components/step-result-box';
import {
	generateTelecelCurrentMonthPayoutsAction,
	generateTelecelPayoutCsvAction,
	previewTelecelCurrentMonthPayoutsAction,
} from '@/lib/server-actions/payout-process-actions';
import type { ServiceResult } from '@/lib/services/core/base.types';
import { format } from 'date-fns';
import { EyeIcon, PlayIcon, TableIcon } from 'lucide-react';
import { useState } from 'react';
import type { TelecelCsvPayoutProcessDialogProps } from './payout-process-dialog-props';

type StepResult = string | object | string[] | null;

export const TelecelCsvPayoutProcessDialog = ({
	selectedDate,
	selectedMonthLabel,
	open,
	onClose,
}: TelecelCsvPayoutProcessDialogProps) => {
	const [results, setResults] = useState<Record<number, StepResult>>({});
	const monthKey = format(selectedDate, 'yyyy-MM');

	const setResult = (step: number, value: StepResult) => {
		setResults((previous) => ({ ...previous, [step]: value }));
	};

	const run = async (action: () => Promise<ServiceResult<unknown>>, step: number) => {
		const result = await action();
		if (!result.success) {
			setResult(step, result.error);

			return;
		}
		setResult(step, (result.data as StepResult) ?? 'Done');
	};

	const steps = [
		{
			id: 1,
			title: 'Generate payout CSV',
			label: 'Generate payout CSV',
			description: `Shows the payout CSV (MSISDN, Amount, Telco) for ${selectedMonthLabel} — no changes yet.`,
			icon: <TableIcon className="h-4 w-4" />,
			variant: 'outline' as const,
			run: () => run(() => generateTelecelPayoutCsvAction(selectedDate), 1),
			filename: `payouts-telecel-${monthKey}.csv`,
		},
		{
			id: 2,
			title: 'Preview payouts',
			label: 'Preview payouts (no changes)',
			description: `Previews payouts for ${selectedMonthLabel} (excluding any already paid this month) — nothing written yet.`,
			icon: <EyeIcon className="h-4 w-4" />,
			variant: 'outline' as const,
			run: () => run(() => previewTelecelCurrentMonthPayoutsAction(selectedDate), 2),
			filename: `preview-payouts-telecel-${monthKey}.json`,
		},
		{
			id: 3,
			title: 'Generate payouts',
			label: 'Generate payouts (apply changes)',
			description: `Creates payouts in the database for ${selectedMonthLabel}.`,
			icon: <PlayIcon className="h-4 w-4" />,
			run: () => run(() => generateTelecelCurrentMonthPayoutsAction(selectedDate), 3),
			filename: `generated-payouts-telecel-${monthKey}.json`,
		},
	];

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader className="flex-col items-start gap-0 border-b-0 pr-12">
					<DialogTitle className="text-pretty">Telecel CSV upload</DialogTitle>
				</DialogHeader>

				<p className="text-muted-foreground -mt-2 pr-12 text-sm">
					Payout month: <span className="text-foreground font-medium">{selectedMonthLabel}</span>
				</p>

				<div className="flex flex-col gap-5">
					{steps.map((step) => (
						<div key={step.id} className="flex flex-col gap-2 rounded-2xl bg-slate-100 p-4">
							<p className="font-medium">
								Step {step.id}: {step.title}
							</p>
							<p className="text-muted-foreground mb-1 text-xs">{step.description}</p>

							<Button
								data-testid={`payout-step-${step.id}-button`}
								className="flex w-full items-center justify-center gap-2"
								variant={step.variant ?? 'default'}
								onClick={step.run}
							>
								{step.icon}
								{step.label}
							</Button>

							<StepResultBox
								id={step.id}
								value={results[step.id]}
								filename={step.filename}
								onClear={() => setResult(step.id, null)}
							/>
						</div>
					))}
				</div>

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
