'use client';

import { useDonationFormState } from './hooks/use-donation-form-state';
import { useDonationModal } from './hooks/use-donation-modal';
import { DonationAmountFields } from './steps/step-amount/donation-amount-fields';
import { selectStep1FormView } from './wizard/donation-machine-selectors';

type Props = {
	campaignId?: string;
};

export const DonationForm = ({ campaignId }: Props) => {
	const { openWizardWithFormAmount } = useDonationModal();
	const form = useDonationFormState();

	return (
		<div data-testid="donation-wizard-hero-form">
			<DonationAmountFields
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
						openWizardWithFormAmount(campaignId ? { ...form.context, campaignId } : form.context);
					}
				}}
			/>
		</div>
	);
};
