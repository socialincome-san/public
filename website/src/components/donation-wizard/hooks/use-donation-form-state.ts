'use client';

import { useState } from 'react';
import {
	type Cadence,
	type DonationAmountContext,
	type PresetAmount,
	getInitialDonationContext,
} from '../utils/donation-amount';
import { selectStep1FormView } from '../wizard/donation-machine-selectors';

export const useDonationFormState = (initial?: Partial<DonationAmountContext>) => {
	const defaults = getInitialDonationContext();
	const [monthlyIncome, setMonthlyIncome] = useState(initial?.monthlyIncome ?? defaults.monthlyIncome);
	const [selectedAmount, setSelectedAmount] = useState<DonationAmountContext['selectedAmount']>(
		initial?.selectedAmount ?? defaults.selectedAmount,
	);
	const [customAmount, setCustomAmount] = useState(initial?.customAmount ?? defaults.customAmount);
	const [cadence, setCadence] = useState<Cadence>(initial?.cadence ?? defaults.cadence);

	const context: DonationAmountContext = {
		monthlyIncome,
		selectedAmount,
		customAmount,
		cadence,
		selectedTier: '1x',
		paymentMethod: 'qr',
		chargeMonthlyHalfOfOneTimeAmount: false,
		coverTransactionCosts: false,
		oneTimePlanChoice: 'one-time',
		returnsToOneTimePlanStep: false,
	};

	const view = selectStep1FormView(context);

	const selectOnePercent = () => {
		setSelectedAmount(null);
		setCustomAmount(null);
	};

	const setMonthlyIncomeValue = (value: number | null) => {
		setMonthlyIncome(value);
		setSelectedAmount(null);
		setCustomAmount(null);
	};

	const setPresetAmount = (value: PresetAmount | 'other') => {
		setSelectedAmount(value);
		setCustomAmount(null);
	};

	const setCustomAmountValue = (value: number | null) => {
		setCustomAmount(value);
		if (value !== null) {
			setSelectedAmount('other');
		}
	};

	return {
		context,
		monthlyIncome,
		selectedAmount,
		customAmount,
		cadence,
		onePercent: view.onePercent,
		onePercentSelected: view.onePercentSelected,
		resolvedAmount: view.resolvedAmount,
		isValid: view.isValid,
		selectOnePercent,
		setMonthlyIncome: setMonthlyIncomeValue,
		setPresetAmount,
		setCustomAmount: setCustomAmountValue,
		setCadence,
	};
};
