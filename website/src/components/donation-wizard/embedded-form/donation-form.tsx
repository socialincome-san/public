'use client';

import { useDonationFormState } from '../hooks/use-donation-form-state';
import type { DonationAmountContext } from '../utils/donation-amount';
import { DonationFormFields } from './donation-form-fields';

type Props = {
	onDonate: (context: DonationAmountContext) => void;
};

export const DonationForm = ({ onDonate }: Props) => {
	const form = useDonationFormState();

	const handleDonate = () => {
		if (form.isValid) {
			onDonate(form.context);
		}
	};

	return (
		<DonationFormFields
			values={{
				monthlyIncome: form.monthlyIncome,
				selectedAmount: form.selectedAmount,
				customAmount: form.customAmount,
				cadence: form.cadence,
				onePercent: form.onePercent,
				onePercentSelected: form.onePercentSelected,
				resolvedAmount: form.resolvedAmount,
				isValid: form.isValid,
			}}
			actions={{
				selectOnePercent: form.selectOnePercent,
				setMonthlyIncome: form.setMonthlyIncome,
				setPresetAmount: form.setPresetAmount,
				setCustomAmount: form.setCustomAmount,
				setCadence: form.setCadence,
			}}
			onSubmit={handleDonate}
		/>
	);
};
