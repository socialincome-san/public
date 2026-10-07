'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { Button } from '@socialincome/design-system/actions/button/button';
import { CheckoutFooter } from '@socialincome/design-system/navigation/checkout-footer/checkout-footer';
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
	continueVariant?: 'default' | 'foreground';
	continueTestId?: string;
	showBack?: boolean;
	summary?: Summary;
};

export const QrWizardStepFooter = ({
	onBack,
	onContinue,
	continueLabel,
	continueDisabled = false,
	continueVariant = 'default',
	continueTestId = 'donation-wizard-continue',
	showBack = true,
	summary,
}: QrWizardStepFooterProps) => {
	const { t } = useRouteTranslator({ namespace: 'donation-wizard' });

	return (
		<CheckoutFooter
			back={
				showBack && onBack ? (
					<Button type="button" data-testid="donation-wizard-back" variant="outline" onClick={onBack}>
						<ChevronLeft className="size-4" aria-hidden />
						{t('stepPlan.back')}
					</Button>
				) : undefined
			}
			summary={
				summary
					? {
							label: t('stepPayment.your-donation'),
							amount: formatDonationCurrencyAmount(summary.currency, summary.amount),
							suffix: summary.showPerMonth ? t('stepPlan.per-month') : undefined,
						}
					: undefined
			}
			primary={
				<Button
					type="button"
					data-testid={continueTestId}
					variant={continueVariant}
					disabled={continueDisabled}
					onClick={onContinue}
				>
					{continueLabel}
				</Button>
			}
		/>
	);
};
