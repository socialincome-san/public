'use client';

import { useDonationModal } from '@/components/donation-wizard/hooks/use-donation-modal';
import {
	DONATION_CUSTOM_AMOUNT_MAX,
	DONATION_CUSTOM_AMOUNT_MIN,
	getInitialDonationContext,
	getOnePercentAmount,
	type Cadence,
} from '@/components/donation-wizard/utils/donation-amount';
import { defaultLanguage, getSafeNumberFormatLocale, isWebsiteLanguage } from '@/lib/i18n/utils';
import { useWebsiteCurrency } from '@/lib/i18n/website-currency';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { useLocale, useTranslations } from 'next-intl';
import { createContext, use, useState, type ReactNode } from 'react';

type Mode = 'percent' | 'own';

export const INCOME_SLIDER = { min: 1000, max: 15000, step: 10, initial: 5930 } as const;
const CUSTOM_AMOUNT_INITIAL = 50;

const useDonateAmountState = () => {
	const t = useTranslations('website-donate.page');
	const language = useLocale();
	const locale = getSafeNumberFormatLocale(isWebsiteLanguage(language) ? language : defaultLanguage);
	const currency = useWebsiteCurrency();
	const { openWizardWithFormAmount } = useDonationModal();
	const [mode, setMode] = useState<Mode>('percent');
	const [income, setIncome] = useState<number>(INCOME_SLIDER.initial);
	const [customAmount, setCustomAmount] = useState<number | null>(CUSTOM_AMOUNT_INITIAL);

	const format = (amount: number) => formatNumberLocale(amount, locale);
	const formatAmount = (amount: number) => `${currency} ${format(amount)}`;
	const customAmountError = () => {
		if (customAmount === null || customAmount < DONATION_CUSTOM_AMOUNT_MIN) {
			return t('below-minimum', { amount: formatAmount(DONATION_CUSTOM_AMOUNT_MIN) });
		}

		return customAmount > DONATION_CUSTOM_AMOUNT_MAX
			? t('above-maximum', { amount: formatAmount(DONATION_CUSTOM_AMOUNT_MAX) })
			: undefined;
	};
	const error = mode === 'own' ? customAmountError() : undefined;

	const openWizard = (cadence: Cadence) => {
		const context = getInitialDonationContext(currency);
		openWizardWithFormAmount(
			mode === 'percent'
				? { ...context, monthlyIncome: income, cadence }
				: { ...context, selectedAmount: 'other', customAmount, cadence },
		);
	};

	return {
		currency,
		mode,
		setMode,
		income,
		setIncome,
		customAmount,
		setCustomAmount,
		error,
		donation: mode === 'percent' ? getOnePercentAmount(income) : (customAmount ?? 0),
		format,
		formatAmount,
		openWizard,
	};
};

type DonateAmount = ReturnType<typeof useDonateAmountState>;

const DonateAmountContext = createContext<DonateAmount | null>(null);

// The calculator, the impact line under the program and the closing call to action share one amount
export const DonateAmountProvider = ({ children }: { children: ReactNode }) => {
	const amount = useDonateAmountState();

	return <DonateAmountContext value={amount}>{children}</DonateAmountContext>;
};

export const useDonateAmount = (): DonateAmount => {
	const context = use(DonateAmountContext);
	if (!context) {
		throw new Error('useDonateAmount must be used within DonateAmountProvider');
	}

	return context;
};
