//TODO: Almost duplicate instead of the redirect, can be generalised as well probably
//TODO: shared/locales/[lang]/website-selection contains section2.amount which is no longer used anywhere
'use client';

import { useI18n } from '@/components/providers/context-providers';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
	const { currency } = useI18n();

	useEffect(() => {
		redirect('./recipient-selection/' + currency?.toLowerCase());
	}, [currency]);
}
