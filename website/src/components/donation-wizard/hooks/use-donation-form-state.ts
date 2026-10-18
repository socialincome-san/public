'use client';

import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { useState } from 'react';
import {
	type Cadence,
	type DonationAmountContext,
	type PresetAmount,
	getInitialDonationContext,
} from '../utils/donation-amount';
import { isDonationExampleCountryCode } from '../utils/donation-example-income';
import { updateDonationCountry, updateDonationIncomeCurrency } from '../utils/donation-income-state';
import { selectStep1FormView } from '../wizard/donation-machine-selectors';

export const useDonationFormState = (
	currency: WebsiteCurrency,
	visitorCountryCode: string | null,
	initial?: Partial<DonationAmountContext>,
) => {
	const [context, setContext] = useState<DonationAmountContext>(() => {
		const initialContext: DonationAmountContext = {
			...getInitialDonationContext(currency),
			...initial,
			monthlyIncomeSource: initial?.monthlyIncomeSource ?? (initial?.monthlyIncome === undefined ? 'generic' : 'manual'),
			donationAmountIsManual:
				initial?.donationAmountIsManual ?? (initial?.selectedAmount !== undefined && initial.selectedAmount !== null),
		};

		return visitorCountryCode && isDonationExampleCountryCode(visitorCountryCode)
			? updateDonationCountry(initialContext, visitorCountryCode, false)
			: initialContext;
	});

	const getCurrentContext = (current: DonationAmountContext): DonationAmountContext => {
		const currencyAdjusted = updateDonationIncomeCurrency(current, currency);

		return visitorCountryCode && isDonationExampleCountryCode(visitorCountryCode)
			? updateDonationCountry(currencyAdjusted, visitorCountryCode, false)
			: currencyAdjusted;
	};

	const updateContext = (update: (current: DonationAmountContext) => DonationAmountContext) =>
		setContext((current) => update(getCurrentContext(current)));

	const selectOnePercent = () => {
		updateContext((current) => ({
			...current,
			selectedAmount: null,
			customAmount: null,
			donationAmountIsManual: false,
		}));
	};

	const setMonthlyIncome = (value: number | null) => {
		updateContext((current) => ({
			...current,
			monthlyIncome: value,
			monthlyIncomeSource: 'manual',
			selectedAmount: null,
			customAmount: null,
			donationAmountIsManual: false,
		}));
	};

	const setPresetAmount = (value: PresetAmount | 'other') => {
		updateContext((current) => ({
			...current,
			selectedAmount: value,
			customAmount: null,
			donationAmountIsManual: true,
		}));
	};

	const setCustomAmount = (value: number | null) => {
		updateContext((current) => ({
			...current,
			customAmount: value,
			selectedAmount: value === null ? current.selectedAmount : 'other',
			donationAmountIsManual: true,
		}));
	};

	const setCountry = (countryCode: string) => {
		if (isDonationExampleCountryCode(countryCode)) {
			updateContext((current) => updateDonationCountry(current, countryCode, true));
		}
	};

	const currentContext = getCurrentContext(context);
	const view = selectStep1FormView(currentContext);

	return {
		context: currentContext,
		monthlyIncome: currentContext.monthlyIncome,
		selectedAmount: currentContext.selectedAmount,
		customAmount: currentContext.customAmount,
		cadence: currentContext.cadence,
		onePercent: view.onePercent,
		onePercentSelected: view.onePercentSelected,
		resolvedAmount: view.resolvedAmount,
		isValid: view.isValid,
		selectOnePercent,
		setMonthlyIncome,
		setPresetAmount,
		setCustomAmount,
		setCadence: (cadence: Cadence) => updateContext((current) => ({ ...current, cadence })),
		setCountry,
	};
};
