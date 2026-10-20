'use client';

import { usePortalOperationsTranslations } from '@/app/portal/portal-operations-translations';
import {
	generateTelecelCurrentMonthPayoutsAction,
	generateTelecelPayoutCsvAction,
	previewTelecelCurrentMonthPayoutsAction,
} from '@/modules/payout-processes/payout-process.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import { StepResultBox } from '@socialincome/design-system/data-display/step-result-box/step-result-box';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { format } from 'date-fns';
import { EyeIcon, PlayIcon, TableIcon } from 'lucide-react';
import { useState } from 'react';
import type { TelecelCsvPayoutProcessDialogProps } from './payout-process-dialog-props';

type StepResult = string | object | null;
type StepActionResult = { success: true; data: StepResult } | { success: false; error: string };

export const TelecelCsvPayoutProcessDialog = ({
	selectedDate,
	selectedMonthLabel,
	open,
	onClose,
}: TelecelCsvPayoutProcessDialogProps) => {
	const t = usePortalOperationsTranslations();
	const [results, setResults] = useState<Record<number, StepResult>>({});
	const monthKey = format(selectedDate, 'yyyy-MM');

	const setResult = (step: number, value: StepResult) => {
		setResults((previous) => ({ ...previous, [step]: value }));
	};

	const run = async (action: () => Promise<StepActionResult>, step: number) => {
		const result = await action();
		if (!result.success) {
			setResult(step, result.error);

			return;
		}
		setResult(step, result.data ?? t('delivery.process.done'));
	};

	const steps = [
		{
			id: 1,
			title: t('delivery.process.generate_payout_csv'),
			label: t('delivery.process.generate_payout_csv'),
			description: t('delivery.process.telecel_payout_csv_description', { month: selectedMonthLabel }),
			icon: <TableIcon className="h-4 w-4" />,
			variant: 'outline' as const,
			run: () => run(() => generateTelecelPayoutCsvAction({ selectedDate }), 1),
			filename: `payouts-telecel-${monthKey}.csv`,
		},
		{
			id: 2,
			title: t('delivery.process.preview_payouts'),
			label: t('delivery.process.preview_payouts_no_changes'),
			description: t('delivery.process.preview_payouts_description', { month: selectedMonthLabel }),
			icon: <EyeIcon className="h-4 w-4" />,
			variant: 'outline' as const,
			run: () => run(() => previewTelecelCurrentMonthPayoutsAction({ selectedDate }), 2),
			filename: `preview-payouts-telecel-${monthKey}.json`,
		},
		{
			id: 3,
			title: t('delivery.process.generate_payouts'),
			label: t('delivery.process.generate_payouts_apply_changes'),
			description: t('delivery.process.generate_payouts_description', { month: selectedMonthLabel }),
			icon: <PlayIcon className="h-4 w-4" />,
			run: () => run(() => generateTelecelCurrentMonthPayoutsAction({ selectedDate }), 3),
			filename: `generated-payouts-telecel-${monthKey}.json`,
		},
	];

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>{t('delivery.process.telecel_title')}</DialogTitle>
					<DialogDescription>
						{t('delivery.process.payout_month')}: <span className="text-foreground font-medium">{selectedMonthLabel}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-5">
					{steps.map((step) => (
						<div key={step.id} className="bg-muted flex flex-col gap-2 rounded-2xl p-4">
							<p className="font-medium">
								{t('delivery.process.step', { number: step.id })}: {step.title}
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
						{t('common.close')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
