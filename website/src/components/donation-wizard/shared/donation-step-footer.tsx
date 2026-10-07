'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { Button } from '@socialincome/design-system/actions/button/button';
import { CheckoutFooter } from '@socialincome/design-system/navigation/checkout-footer/checkout-footer';
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

	return (
		<CheckoutFooter
			back={
				<Button type="button" data-testid="donation-wizard-back" variant="outline" onClick={onBack}>
					<ChevronLeft className="size-4" aria-hidden />
					{t('stepPlan.back')}
				</Button>
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
					data-testid="donation-wizard-continue"
					disabled={continueDisabled || !onContinue}
					onClick={onContinue}
				>
					{continueLabel}
				</Button>
			}
		/>
	);
};
