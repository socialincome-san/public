'use client';

import type { DonationAmountContext } from '../wizard/donation-amount';
import { DonationFormFields } from './donation-form-fields';
import { useDonationFormState } from './use-donation-form-state';

type Props = {
	showTitle?: boolean;
	className?: string;
	onDonate: (context: DonationAmountContext) => void;
};

export const DonationForm = ({ showTitle = false, className, onDonate }: Props) => {
	const form = useDonationFormState();

	const handleDonate = () => {
		if (form.isValid) {
			onDonate(form.context);
		}
	};

	return (
		<DonationFormFields
			showTitle={showTitle}
			className={className}
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
