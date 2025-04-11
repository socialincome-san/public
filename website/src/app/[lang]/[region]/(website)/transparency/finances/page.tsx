'use client';

import { useI18n } from '@/components/providers/context-providers';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
	const { currency } = useI18n();

	useEffect(() => {
		if (currency) redirect('./finances/' + currency.toLowerCase());
	}, [currency]);
}
