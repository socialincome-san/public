'use client';

import { DonationFormFields } from '../donation-form/donation-form-fields';
import { getOnePercentAmount, isAmountValid, isOnePercentPlanSelected, resolveAmount } from '../wizard/donation-amount';
import type { DonationWizardStepProps } from '../wizard/types';

export const WizardDonationFormStep = ({ state, send }: DonationWizardStepProps) => {
	const { monthlyIncome, selectedAmount, customAmount, cadence } = state.context;
	const context = state.context;

	return (
		<DonationFormFields
			showTitle
			values={{
				monthlyIncome,
				selectedAmount,
				customAmount,
				cadence,
				onePercent: getOnePercentAmount(monthlyIncome),
				onePercentSelected: isOnePercentPlanSelected(context),
				resolvedAmount: resolveAmount(context),
				isValid: isAmountValid(context),
			}}
			actions={{
				selectOnePercent: () => send({ type: 'SELECT_ONE_PERCENT' }),
				setMonthlyIncome: (value) => send({ type: 'SET_MONTHLY_INCOME', value }),
				setPresetAmount: (value) => send({ type: 'SET_PRESET_AMOUNT', value }),
				setCustomAmount: (value) => send({ type: 'SET_CUSTOM_AMOUNT', value }),
				setCadence: (value) => send({ type: 'SET_CADENCE', value }),
			}}
			onSubmit={() => send({ type: 'SUBMIT' })}
		/>
	);
};
