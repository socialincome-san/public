'use client';

import { Button } from '@/components/button';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import { ChevronLeft } from 'lucide-react';
import { formatDonationCurrencyAmount } from '../utils/donation-formatting';

type Summary = {
	amount: number;
	currency: string;
	showPerMonth: boolean;
};

type Props = {
	onBack: () => void;
	onContinue?: () => void;
	continueLabel: string;
	continueDisabled?: boolean;
	summary?: Summary;
};

export const DonationStepFooter = ({ onBack, onContinue, continueLabel, continueDisabled = false, summary }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	const summaryAmount = summary ? (
		<>
			<span className="text-lg leading-none font-medium tabular-nums">
				{formatDonationCurrencyAmount(summary.currency, summary.amount)}
			</span>
			{summary.showPerMonth && <span className="text-muted-foreground shrink-0 text-sm">{t('stepPlan.per-month')}</span>}
		</>
	) : null;

	return (
		<div className="flex flex-col gap-3">
			{summary && (
				<div className="border-border flex items-center justify-between gap-2 border-y py-2.5 text-sm sm:hidden">
					<span className="text-muted-foreground shrink-0">{t('stepPayment.your-donation')}</span>
					<div className="flex min-w-0 items-center gap-1.5">{summaryAmount}</div>
				</div>
			)}

			<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
				<Button
					type="button"
					data-testid="donation-wizard-back"
					variant="outline"
					className="h-10 w-full shrink-0 rounded-full sm:h-9 sm:w-auto"
					onClick={onBack}
				>
					<ChevronLeft className="size-4" aria-hidden />
					{t('stepPlan.back')}
				</Button>

				<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
					{summary && (
						<div className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
							<span>{t('stepPayment.your-donation')}</span>
							{summaryAmount}
						</div>
					)}

					<Button
						type="button"
						data-testid="donation-wizard-continue"
						className="h-10 w-full shrink-0 rounded-full px-4 text-sm font-bold sm:h-9 sm:w-auto"
						disabled={continueDisabled || !onContinue}
						onClick={onContinue}
					>
						{continueLabel}
					</Button>
				</div>
			</div>
		</div>
	);
};
