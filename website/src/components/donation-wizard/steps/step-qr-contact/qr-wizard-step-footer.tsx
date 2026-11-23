'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { CheckoutFooter } from '@socialincome/design-system/navigation/checkout-footer/checkout-footer';
import { useTranslations } from 'next-intl';
import { formatDonationCurrencyAmount } from '../../utils/donation-formatting';

type Summary = {
	amount: number;
	currency: string;
	showPerMonth: boolean;
};

type QrWizardStepFooterProps = {
	onContinue: () => void;
	continueLabel: string;
	continueDisabled?: boolean;
	continueVariant?: 'default' | 'foreground';
	continueTestId?: string;
	summary?: Summary;
};

export const QrWizardStepFooter = ({
	onContinue,
	continueLabel,
	continueDisabled = false,
	continueVariant = 'default',
	continueTestId = 'donation-wizard-continue',
	summary,
}: QrWizardStepFooterProps) => {
	const t = useTranslations('donation-wizard');

	return (
		<CheckoutFooter
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
