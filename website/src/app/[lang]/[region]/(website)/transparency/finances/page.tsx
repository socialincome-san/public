'use client';

import { useI18n } from '@/app/context-providers';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
	const { currency } = useI18n();

	useEffect(() => {
		redirect('./finances/' + currency?.toLowerCase());
	}, [currency]);
}
