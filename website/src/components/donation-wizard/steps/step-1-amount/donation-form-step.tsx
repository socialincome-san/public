'use client';

import { DonationFormFields } from '../../embedded-form/donation-form-fields';
import {
	getOnePercentAmount,
	isAmountValid,
	isOnePercentPlanSelected,
	resolveAmount,
	type DonationAmountContext,
	type PresetAmount,
} from '../../utils/donation-amount';
import type { DonationWizardSend, DonationWizardState } from '../../wizard/types';

type Props = {
	state: DonationWizardState;
	send: DonationWizardSend;
};

export const DonationFormStep = ({ state, send }: Props) => {
	const { context } = state;

	return (
		<DonationFormFields
			values={getDonationFormFieldValues(context)}
			actions={getDonationFormFieldActions(send)}
			onSubmit={() => send({ type: 'SUBMIT' })}
		/>
	);
};

const getDonationFormFieldValues = (context: DonationAmountContext) => ({
	monthlyIncome: context.monthlyIncome,
	selectedAmount: context.selectedAmount,
	customAmount: context.customAmount,
	cadence: context.cadence,
	onePercent: getOnePercentAmount(context.monthlyIncome),
	onePercentSelected: isOnePercentPlanSelected(context),
	resolvedAmount: resolveAmount(context),
	isValid: isAmountValid(context),
});

const getDonationFormFieldActions = (send: DonationWizardSend) => ({
	selectOnePercent: () => send({ type: 'SELECT_ONE_PERCENT' }),
	setMonthlyIncome: (value: number) => send({ type: 'SET_MONTHLY_INCOME', value }),
	setPresetAmount: (value: PresetAmount | 'other') => send({ type: 'SET_PRESET_AMOUNT', value }),
	setCustomAmount: (value: number | null) => send({ type: 'SET_CUSTOM_AMOUNT', value }),
	setCadence: (value: DonationAmountContext['cadence']) => send({ type: 'SET_CADENCE', value }),
});
