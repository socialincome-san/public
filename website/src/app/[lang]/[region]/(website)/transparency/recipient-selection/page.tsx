'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
	const { currency } = useI18n();

	useEffect(() => {
		if (currency) redirect('./recipient-selection/' + currency.toLowerCase());
	}, [currency]);
}
