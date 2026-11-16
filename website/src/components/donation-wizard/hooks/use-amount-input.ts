'use client';

import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { formatNumberLocale } from '@/lib/utils/string-utils';
import { useLocale, useTranslations } from 'next-intl';
import { useState, type ChangeEvent } from 'react';

type AmountError = 'not-whole' | 'below-min' | 'above-max';

// Apostrophes and spaces are thousands separators. A dot or comma may be a decimal separator,
// so 10.50 is rejected instead of being read as 1050.
const parseWholeAmount = (text: string, max: number): { value: number | null } | { error: AmountError } => {
	const digits = text.replace(/['’\s]/g, '');
	if (digits === '') {
		return { value: null };
	}
	if (!/^\d+$/.test(digits)) {
		return { error: 'not-whole' };
	}
	const value = Number(digits);

	return value > max ? { error: 'above-max' } : { value };
};

type AmountInputOptions = {
	value: number | null;
	onChange: (value: number | null) => void;
	min: number;
	max: number;
	currency: WebsiteCurrency;
};

// Rejected text stays in the field so the person sees what to fix; only valid amounts reach the form state.
export const useAmountInput = ({ value, onChange, min, max, currency }: AmountInputOptions) => {
	const t = useTranslations('donation-wizard');
	const locale = useLocale();
	const [rejected, setRejected] = useState<{ text: string; error: AmountError } | null>(null);
	const error = rejected?.error ?? (value !== null && value < min ? 'below-min' : null);

	const formatLimit = (limit: number) => `${currency} ${formatNumberLocale(limit, locale)}`;
	const getHint = (amountError: AmountError) => {
		switch (amountError) {
			case 'not-whole':
				return t('stepAmount.whole-amount-only');
			case 'below-min':
				return t('stepAmount.below-minimum', { amount: formatLimit(min) });
			case 'above-max':
				return t('stepAmount.above-maximum', { amount: formatLimit(max) });
		}
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const result = parseWholeAmount(event.target.value, max);
		setRejected('error' in result ? { text: event.target.value, error: result.error } : null);
		onChange('error' in result ? null : result.value);
	};

	return {
		text: rejected?.text ?? value?.toString() ?? '',
		hint: error === null ? undefined : getHint(error),
		onChange: handleChange,
		reset: () => setRejected(null),
	};
};
