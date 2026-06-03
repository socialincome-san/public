'use client';

import { useCallback, useMemo, useState } from 'react';
import {
	type Cadence,
	type DonationAmountContext,
	type PresetAmount,
	getInitialDonationContext,
	getOnePercentAmount,
	isAmountValid,
	isOnePercentPlanSelected,
	resolveAmount,
} from '../wizard/donation-amount';

export const useDonationFormState = (initial?: Partial<DonationAmountContext>) => {
	const defaults = getInitialDonationContext();
	const [monthlyIncome, setMonthlyIncome] = useState(initial?.monthlyIncome ?? defaults.monthlyIncome);
	const [selectedAmount, setSelectedAmount] = useState<DonationAmountContext['selectedAmount']>(
		initial?.selectedAmount ?? defaults.selectedAmount,
	);
	const [customAmount, setCustomAmount] = useState(initial?.customAmount ?? defaults.customAmount);
	const [cadence, setCadence] = useState<Cadence>(initial?.cadence ?? defaults.cadence);

	const context = useMemo(
		(): DonationAmountContext => ({
			monthlyIncome,
			selectedAmount,
			customAmount,
			cadence,
			selectedTier: '1x',
			paymentMethod: 'qr',
			useHalfMonthlyAmount: false,
			coverTransactionCosts: false,
			oneTimeCheckoutChoice: 'one-time',
			checkoutFromOneTimeStep: false,
		}),
		[monthlyIncome, selectedAmount, customAmount, cadence],
	);

	const selectOnePercent = useCallback(() => {
		setSelectedAmount(null);
		setCustomAmount(null);
	}, []);

	const setMonthlyIncomeValue = useCallback((value: number) => {
		setMonthlyIncome(value);
		setSelectedAmount(null);
		setCustomAmount(null);
	}, []);

	const setPresetAmount = useCallback((value: PresetAmount | 'other') => {
		setSelectedAmount(value);
		setCustomAmount(value === 'other' ? null : null);
	}, []);

	const setCustomAmountValue = useCallback((value: number) => {
		setCustomAmount(value);
		setSelectedAmount('other');
	}, []);

	return {
		context,
		monthlyIncome,
		selectedAmount,
		customAmount,
		cadence,
		onePercent: getOnePercentAmount(monthlyIncome),
		onePercentSelected: isOnePercentPlanSelected(context),
		resolvedAmount: resolveAmount(context),
		isValid: isAmountValid(context),
		selectOnePercent,
		setMonthlyIncome: setMonthlyIncomeValue,
		setPresetAmount,
		setCustomAmount: setCustomAmountValue,
		setCadence,
	};
};
