'use client';

import { StepResultBox } from '@/components/step-result-box';
import { slugify } from '@/lib/utils/string-utils';
import {
	generateOrangeCurrentMonthPayoutsAction,
	generateOrangePayoutCsvAction,
	generateOrangeRegistrationCsvAction,
	previewOrangeCurrentMonthPayoutsAction,
} from '@/modules/payout-processes/payout-process.actions';
import { Button } from '@socialincome/design-system/button/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/dialog/dialog';
import { format } from 'date-fns';
import { EyeIcon, PlayIcon, TableIcon } from 'lucide-react';
import { useState } from 'react';
import type { OrangeMoneyCsvPayoutProcessDialogProps } from './payout-process-dialog-props';

type StepResult = string | object | null;
type StepActionResult = { success: true; data: StepResult } | { success: false; error: string };

export const OrangeMoneyCsvPayoutProcessDialog = ({
	mobileMoneyProviderId,
	providerName,
	selectedDate,
	selectedMonthLabel,
	open,
	onClose,
}: OrangeMoneyCsvPayoutProcessDialogProps) => {
	const [results, setResults] = useState<Record<number, StepResult>>({});
	const monthKey = format(selectedDate, 'yyyy-MM');
	const providerSlug = slugify(providerName);

	const setResult = (step: number, value: StepResult) => {
		setResults((previous) => ({ ...previous, [step]: value }));
	};

	const run = async (action: () => Promise<StepActionResult>, step: number) => {
		const result = await action();
		if (!result.success) {
			setResult(step, result.error);

			return;
		}
		setResult(step, result.data ?? 'Done');
	};

	const steps = [
		{
			id: 1,
			title: 'Generate registration CSV',
			label: 'Generate registration CSV',
			description: 'Shows the CSV for recipients in programs ready for payouts (others are excluded) — no changes yet.',
			icon: <TableIcon className="h-4 w-4" />,
			variant: 'outline' as const,
			run: () => run(() => generateOrangeRegistrationCsvAction({ mobileMoneyProviderId }), 1),
			filename: `registration-${providerSlug}-${monthKey}.csv`,
		},
		{
			id: 2,
			title: 'Generate payout CSV',
			label: 'Generate payout CSV',
			description: `Shows the payout CSV for ${selectedMonthLabel} — no changes yet.`,
			icon: <TableIcon className="h-4 w-4" />,
			variant: 'outline' as const,
			run: () => run(() => generateOrangePayoutCsvAction({ mobileMoneyProviderId, selectedDate }), 2),
			filename: `payouts-${providerSlug}-${monthKey}.csv`,
		},
		{
			id: 3,
			title: 'Preview payouts',
			label: 'Preview payouts (no changes)',
			description: `Previews payouts for ${selectedMonthLabel} (excluding any already paid this month) — nothing written yet.`,
			icon: <EyeIcon className="h-4 w-4" />,
			variant: 'outline' as const,
			run: () => run(() => previewOrangeCurrentMonthPayoutsAction({ mobileMoneyProviderId, selectedDate }), 3),
			filename: `preview-payouts-${providerSlug}-${monthKey}.json`,
		},
		{
			id: 4,
			title: 'Generate payouts',
			label: 'Generate payouts (apply changes)',
			description: `Creates payouts in the database for ${selectedMonthLabel}.`,
			icon: <PlayIcon className="h-4 w-4" />,
			run: () => run(() => generateOrangeCurrentMonthPayoutsAction({ mobileMoneyProviderId, selectedDate }), 4),
			filename: `generated-payouts-${providerSlug}-${monthKey}.json`,
		},
	];

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>Orange Money CSV upload — {providerName}</DialogTitle>
					<DialogDescription>
						Payout month: <span className="text-foreground font-medium">{selectedMonthLabel}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-5">
					{steps.map((step) => (
						<div key={step.id} className="bg-muted flex flex-col gap-2 rounded-2xl p-4">
							<p className="font-medium">
								Step {step.id}: {step.title}
							</p>
							<p className="text-muted-foreground mb-1 text-xs">{step.description}</p>

							<Button data-testid={`payout-step-${step.id}-button`} variant={step.variant ?? 'default'} onClick={step.run}>
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

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
