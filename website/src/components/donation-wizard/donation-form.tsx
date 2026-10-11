'use client';

import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { useDonationFormState } from './hooks/use-donation-form-state';
import { useDonationModal } from './hooks/use-donation-modal';
import { DonationAmountFields } from './steps/step-amount/donation-amount-fields';
import { selectStep1FormView } from './wizard/donation-machine-selectors';

type Props = {
	campaignId?: string;
	onBeforeOpen?: () => void;
};

export const DonationForm = ({ campaignId, onBeforeOpen }: Props) => {
	const currency = useWebsiteCurrency();
	const { openWizardWithFormAmount } = useDonationModal();
	const form = useDonationFormState();

	return (
		<div data-testid="donation-wizard-hero-form" className="w-full">
			<DonationAmountFields
				placement="hero"
				currency={currency}
				values={selectStep1FormView(form.context)}
				actions={{
					selectOnePercent: form.selectOnePercent,
					setMonthlyIncome: form.setMonthlyIncome,
					setPresetAmount: form.setPresetAmount,
					setCustomAmount: form.setCustomAmount,
					setCadence: form.setCadence,
				}}
				onSubmit={() => {
					if (form.isValid) {
						onBeforeOpen?.();
						openWizardWithFormAmount(campaignId ? { ...form.context, campaignId } : form.context);
					}
				}}
			/>
		</div>
	);
};
