'use client';

import { useI18n } from '@/components/providers/context-providers';
import { WebsiteCurrency } from '@/i18n';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export function CurrencyRedirect(props: { currency: WebsiteCurrency }) {
	const { currency } = useI18n();

	useEffect(() => {
		if (currency && props.currency !== currency) {
			redirect('./' + currency.toLowerCase());
		}
	}, [currency, props.currency]);

	return null;
}
