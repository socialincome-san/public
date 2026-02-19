'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { WebsiteCurrency } from '@/lib/i18n/utils';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export const CurrencyRedirect = (props: { currency: WebsiteCurrency }) => {
	const { currency } = useI18n();

	useEffect(() => {
		if (currency && props.currency !== currency) {
			redirect('./' + currency.toLowerCase());
		}
	}, [currency, props.currency]);

	return null;
};
