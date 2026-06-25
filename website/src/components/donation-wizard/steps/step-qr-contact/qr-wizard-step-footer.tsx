'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { cn } from '@/lib/utils/cn';
import { ChevronLeft } from 'lucide-react';
import { formatDonationCurrencyAmount } from '../../utils/donation-formatting';

type Summary = {
	amount: number;
	currency: string;
	showPerMonth: boolean;
};

type QrWizardStepFooterProps = {
	onBack?: () => void;
	onContinue: () => void;
	continueLabel: string;
	continueDisabled?: boolean;
	continueClassName?: string;
	continueTestId?: string;
	showBack?: boolean;
	summary?: Summary;
};

export const QrWizardStepFooter = ({
	onBack,
	onContinue,
	continueLabel,
	continueDisabled = false,
	continueClassName,
	continueTestId = 'donation-wizard-continue',
	showBack = true,
	summary,
}: QrWizardStepFooterProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	const amountLine = summary ? (
		<span className="text-foreground inline-flex flex-wrap items-baseline gap-1 tabular-nums">
			<span className="text-lg leading-none font-medium">
				{formatDonationCurrencyAmount(summary.currency, summary.amount)}
			</span>
			{summary.showPerMonth && <span className="text-muted-foreground text-sm">{t('stepPlan.per-month')}</span>}
		</span>
	) : null;

	if (!summary) {
		return (
			<div
				className={cn('flex flex-col gap-3', showBack ? 'sm:flex-row sm:items-center sm:justify-between' : 'sm:items-end')}
			>
				{showBack && onBack ? (
					<Button
						type="button"
						data-testid="donation-wizard-back"
						variant="outline"
						className="h-9 w-full shrink-0 rounded-full sm:w-auto"
						onClick={onBack}
					>
						<ChevronLeft className="size-4" aria-hidden />
						{t('stepPlan.back')}
					</Button>
				) : null}
				<Button
					type="button"
					data-testid={continueTestId}
					className={cn('h-9 w-full shrink-0 rounded-full px-4 text-sm font-bold sm:w-auto', !showBack && 'sm:ml-auto')}
					disabled={continueDisabled}
					onClick={onContinue}
				>
					{continueLabel}
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="border-border flex items-center justify-between gap-2 border-y py-2.5 text-sm md:hidden">
				<span className="text-muted-foreground shrink-0">{t('stepPayment.your-donation')}</span>
				{amountLine}
			</div>

			<div
				className={cn('flex flex-col gap-3 md:flex-row md:items-center', showBack ? 'md:justify-between' : 'md:justify-end')}
			>
				{showBack && onBack ? (
					<Button
						type="button"
						data-testid="donation-wizard-back"
						variant="outline"
						className="h-9 w-full shrink-0 rounded-full md:w-auto"
						onClick={onBack}
					>
						<ChevronLeft className="size-4" aria-hidden />
						{t('stepPlan.back')}
					</Button>
				) : null}

				<div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
					<div className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
						<span className="shrink-0">{t('stepPayment.your-donation')}</span>
						{amountLine}
					</div>
					<Button
						type="button"
						data-testid={continueTestId}
						variant="default"
						className={cn(
							'h-9 w-full shrink-0 rounded-full px-4 text-sm font-bold sm:max-w-none md:w-auto',
							'text-center whitespace-normal sm:whitespace-nowrap',
							continueClassName,
						)}
						disabled={continueDisabled}
						onClick={onContinue}
					>
						{continueLabel}
					</Button>
				</div>
			</div>
		</div>
	);
};
